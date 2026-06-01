import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from models import Customer

# Setup in-memory SQLite for testing
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
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def auth_headers(session: Session):
    # Create verified customer
    from auth import get_password_hash
    from services.crypto import encrypt_value, deterministic_hash
    customer = Customer(
        email=encrypt_value("cart-tester@example.com"),
        email_hash=deterministic_hash("cart-tester@example.com"),
        hashed_password=get_password_hash("password123"),
        is_verified=True
    )
    session.add(customer)
    session.commit()
    
    # Log in
    response = client.post("/customers/login", json={
        "email": "cart-tester@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_cart_empty(auth_headers):
    response = client.get("/customers/cart", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_post_and_get_cart(auth_headers, session: Session):
    cart_items = [
        {
            "id": "prod-1",
            "name": "Tesla Model 3 Door Handle",
            "category": "Body",
            "priceUAH": 4500.0,
            "priceUSD": 120.0,
            "image": "/images/prod-1.jpg",
            "description": "OEM Door handle for Model 3",
            "inStock": True,
            "quantity": 2
        },
        {
            "id": "prod-2",
            "name": "Tesla Charging Cable",
            "category": "Charging",
            "priceUAH": 9000.0,
            "priceUSD": 240.0,
            "image": "/images/prod-2.jpg",
            "description": "Mobile connector cable",
            "inStock": True,
            "quantity": 1
        }
    ]
    
    # Save the cart
    post_res = client.post("/customers/cart", json=cart_items, headers=auth_headers)
    assert post_res.status_code == 200
    assert post_res.json()["message"] == "Кошик успішно збережено"
    
    # Verify via DB directly
    from services.crypto import deterministic_hash
    customer = session.exec(select(Customer).where(Customer.email_hash == deterministic_hash("cart-tester@example.com"))).first()
    assert customer is not None
    assert customer.cart_data is not None
    assert "Tesla Model 3 Door Handle" in customer.cart_data
    
    # Fetch the cart
    get_res = client.get("/customers/cart", headers=auth_headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert len(data) == 2
    assert data[0]["id"] == "prod-1"
    assert data[0]["quantity"] == 2
    assert data[1]["id"] == "prod-2"
    assert data[1]["quantity"] == 1

def test_cart_endpoints_auth_required():
    # GET without auth
    get_res = client.get("/customers/cart")
    assert get_res.status_code == 401
    
    # POST without auth
    post_res = client.post("/customers/cart", json=[])
    assert post_res.status_code == 401
