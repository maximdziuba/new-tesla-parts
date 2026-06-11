import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from models import Customer, PromoCode, EmailList, Order
from services.crypto import encrypt_value, decrypt_value, deterministic_hash
from auth import get_password_hash, create_access_token
from unittest.mock import patch

sqlite_url = "sqlite:///:memory:"
engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

def get_session_override():
    with Session(engine) as session:
        yield session

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_session] = get_session_override
    yield
    app.dependency_overrides.pop(get_session, None)

client = TestClient(app)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Create an admin user
        from models import User
        admin = User(username="admin", hashed_password=get_password_hash("admin123"))
        session.add(admin)
        session.commit()
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="admin_headers")
def admin_headers_fixture():
    token = create_access_token(data={"sub": "admin", "role": "admin"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(name="customer_headers")
def customer_headers_fixture():
    token = create_access_token(data={"sub": "customer@example.com", "role": "customer"})
    # Save token in cookie
    client.cookies.set("customerToken", token)
    return {"Authorization": f"Bearer {token}"}

# --- PII Encryption & Hashing Tests ---
def test_pii_encryption_and_decryption():
    raw_email = "John.Doe@example.com"
    raw_phone = "+380501234567"
    raw_name = "John"
    
    enc_email = encrypt_value(raw_email)
    enc_phone = encrypt_value(raw_phone)
    enc_name = encrypt_value(raw_name)
    
    assert enc_email != raw_email
    assert enc_phone != raw_phone
    assert enc_name != raw_name
    
    assert decrypt_value(enc_email) == raw_email
    assert decrypt_value(enc_phone) == raw_phone
    assert decrypt_value(enc_name) == raw_name
    
    # Hash is deterministic and lowercased
    hash1 = deterministic_hash("John.Doe@example.com")
    hash2 = deterministic_hash("john.doe@example.com ")
    assert hash1 == hash2
    assert len(hash1) == 64

# --- Customer Profile Setup Tests ---
def test_customer_register_and_profile_setup(session: Session, customer_headers):
    # Register customer
    with patch("services.email.EmailService.send_verification_email", return_value=True):
        reg_res = client.post("/customers/register", json={"email": "customer@example.com"})
        assert reg_res.status_code == 200
        
        # Verify customer in DB is encrypted but has correct hash
        h = deterministic_hash("customer@example.com")
        cust = session.exec(select(Customer).where(Customer.email_hash == h)).first()
        assert cust is not None
        assert cust.email != "customer@example.com"
        assert decrypt_value(cust.email) == "customer@example.com"
        
        # Mock token verification/login
        cust.is_verified = True
        cust.hashed_password = get_password_hash("pass123")
        session.add(cust)
        session.commit()
        
    # Get profile details (decrypted)
    me_res = client.get("/customers/me", headers=customer_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "customer@example.com"
    assert me_res.json()["first_name"] is None
    
    # Update profile name, phone, and default address (which get encrypted in DB)
    profile_data = {
        "first_name": "Elon",
        "last_name": "Musk",
        "phone": "+123456789",
        "default_address": "Kyiv, Khreshchatyk str 1"
    }
    update_res = client.put("/customers/profile", json=profile_data, headers=customer_headers)
    assert update_res.status_code == 200
    assert update_res.json()["first_name"] == "Elon"
    assert update_res.json()["phone"] == "+123456789"
    assert update_res.json()["default_address"] == "Kyiv, Khreshchatyk str 1"
    
    # Check database directly is encrypted
    session.refresh(cust)
    assert cust.first_name != "Elon"
    assert cust.default_address != "Kyiv, Khreshchatyk str 1"
    assert decrypt_value(cust.first_name) == "Elon"
    assert decrypt_value(cust.phone) == "+123456789"
    assert decrypt_value(cust.default_address) == "Kyiv, Khreshchatyk str 1"

# --- Admin View Decrypted Customer PII ---
def test_admin_view_decrypted_customers(session: Session, admin_headers):
    # Setup encrypted customer
    customer = Customer(
        email=encrypt_value("tesla@example.com"),
        email_hash=deterministic_hash("tesla@example.com"),
        first_name=encrypt_value("Nikola"),
        last_name=encrypt_value("Tesla"),
        phone=encrypt_value("+380998888888"),
        is_verified=True
    )
    session.add(customer)
    session.commit()
    
    # View customers via admin endpoint
    res = client.get("/customers/", headers=admin_headers)
    assert res.status_code == 200
    cust_data = res.json()
    assert len(cust_data) >= 1
    # Check that it returns DECRYPTED PII
    matched = [c for c in cust_data if c["email"] == "tesla@example.com"]
    assert len(matched) == 1
    assert matched[0]["first_name"] == "Nikola"
    assert matched[0]["phone"] == "+380998888888"

# --- Promo Code Management & Validation ---
def test_promocodes_everyone_and_selected(session: Session, admin_headers, customer_headers):
    # Create the regular customer for customer_headers
    reg_cust = Customer(
        email=encrypt_value("customer@example.com"),
        email_hash=deterministic_hash("customer@example.com"),
        is_verified=True
    )
    session.add(reg_cust)
    session.commit()

    # 1. Create a promo code for everyone (global)
    promo_data_everyone = {
        "code": "GLOBAL10",
        "discount_type": "percent",
        "discount_value": 10.0,
        "scope": "everyone"
    }
    res = client.post("/promocodes/", json=promo_data_everyone, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["code"] == "GLOBAL10"
    
    # Validate global promo code as guest (no headers)
    val_res = client.post("/promocodes/validate", json={"code": "GLOBAL10"})
    assert val_res.status_code == 200
    assert val_res.json()["discount_value"] == 10.0
    
    # 2. Create a targeted promo code for a selected customer
    # Setup customer first
    cust = Customer(
        email=encrypt_value("select@example.com"),
        email_hash=deterministic_hash("select@example.com"),
        is_verified=True
    )
    session.add(cust)
    session.commit()
    session.refresh(cust)
    
    promo_data_selected = {
        "code": "TARGET50",
        "discount_type": "usd",
        "discount_value": 50.0,
        "scope": "selected",
        "customer_ids": [cust.id]
    }
    res = client.post("/promocodes/", json=promo_data_selected, headers=admin_headers)
    assert res.status_code == 200
    
    # Validate targeted promo code as non-logged-in guest (fails)
    client.cookies.clear()
    val_res = client.post("/promocodes/validate", json={"code": "TARGET50"})
    assert val_res.status_code == 400
    assert "тільки для зареєстрованих клієнтів" in val_res.json()["detail"]
    
    # Validate as another logged-in customer who is not eligible
    val_res = client.post("/promocodes/validate", json={"code": "TARGET50"}, headers=customer_headers)
    assert val_res.status_code == 400
    assert "недійсний для вашого акаунту" in val_res.json()["detail"]
    
    # Validate as eligible customer
    cust_token = create_access_token(data={"sub": "select@example.com", "role": "customer"})
    client.cookies.set("customerToken", cust_token)
    val_res = client.post("/promocodes/validate", json={"code": "TARGET50"})
    assert val_res.status_code == 200
    assert val_res.json()["discount_value"] == 50.0

# --- Checkout Promo Code Application ---
def test_checkout_with_promocode(session: Session, admin_headers):
    # Setup a global percent promo code
    promo = PromoCode(
        code="SAVE25",
        discount_type="percent",
        discount_value=25.0,
        scope="everyone",
        is_active=True
    )
    session.add(promo)
    
    # Setup some exchange rate settings to avoid crash
    from models import Settings
    session.add(Settings(key="usd_to_uah", value="40.0"))
    session.commit()
    
    order_payload = {
        "items": [
            {
                "id": "prod-abc",
                "name": "Model S Wheel",
                "category": "Wheels",
                "priceUSD": 100.0,
                "priceUAH": 4000.0,
                "image": "/img.png",
                "description": "Wheel",
                "inStock": True,
                "quantity": 2
            }
        ],
        "totalUSD": 200.0,
        "customer": {
            "firstName": "Alex",
            "lastName": "V",
            "phone": "+380"
        },
        "delivery": {
            "city": "Kyiv",
            "branch": "1"
        },
        "paymentMethod": "card",
        "promocode": "SAVE25"
    }
    
    with patch("services.telegram.send_telegram_notification", return_value=True):
        order_res = client.post("/orders/", json=order_payload)
        assert order_res.status_code == 200
        order_id = order_res.json()["id"]
        
        # Verify order in DB has applied the 25% discount (200 * 0.75 = 150)
        order = session.get(Order, order_id)
        assert order.totalUSD == 150.0

# --- Mailing Campaigns / Manual Email Lists ---
def test_admin_mailing_lists_and_sending(session: Session, admin_headers):
    # Setup two customers
    cust1 = Customer(
        email=encrypt_value("user1@example.com"),
        email_hash=deterministic_hash("user1@example.com"),
        first_name=encrypt_value("UserOne"),
        is_verified=True
    )
    cust2 = Customer(
        email=encrypt_value("user2@example.com"),
        email_hash=deterministic_hash("user2@example.com"),
        first_name=encrypt_value("UserTwo"),
        is_verified=True
    )
    session.add(cust1)
    session.add(cust2)
    session.commit()
    session.refresh(cust1)
    session.refresh(cust2)
    
    # 1. Create a custom email list
    list_payload = {
        "name": "VIP Tesla Owners",
        "customer_ids": [cust1.id, cust2.id]
    }
    create_res = client.post("/email-campaigns/lists", json=list_payload, headers=admin_headers)
    assert create_res.status_code == 200
    list_id = create_res.json()["id"]
    assert create_res.json()["name"] == "VIP Tesla Owners"
    assert len(create_res.json()["customers"]) == 2
    assert create_res.json()["customers"][0]["email"] in ["user1@example.com", "user2@example.com"]
    
    # 2. Get email lists
    get_res = client.get("/email-campaigns/lists", headers=admin_headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) >= 1
    
    # 3. Send campaign to the mailing list
    with patch("services.email.EmailService.send_custom_email", return_value=True) as mock_send:
        send_res = client.post(
            f"/email-campaigns/lists/{list_id}/send", 
            json={"subject": "Exclusive Discount", "body": "<p>Hello Owners</p>"},
            headers=admin_headers
        )
        assert send_res.status_code == 200
        assert "отримувачів" in send_res.json()["message"]
        
    # 4. Send direct campaign to custom emails
    with patch("services.email.EmailService.send_custom_email", return_value=True) as mock_send_direct:
        direct_payload = {
            "subject": "Direct Alert",
            "body": "<p>Direct Text</p>",
            "emails": ["custom1@example.com", "custom2@example.com"],
            "customer_ids": [cust1.id]
        }
        send_direct_res = client.post(
            "/email-campaigns/send-direct",
            json=direct_payload,
            headers=admin_headers
        )
        assert send_direct_res.status_code == 200
