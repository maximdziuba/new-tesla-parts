import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from models import Customer, User, Order
from auth import get_password_hash

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

@pytest.fixture(name="admin_token")
def admin_token_fixture(session: Session):
    # Setup admin user
    admin = User(username="admin", hashed_password=get_password_hash("admin123"))
    session.add(admin)
    session.commit()
    
    # Login as admin to get token
    response = client.post("/auth/token", data={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_admin_get_customers_unauthorized(session: Session):
    # Retrieve without authorization header
    response = client.get("/customers/")
    assert response.status_code == 401

def test_admin_get_customers(session: Session, admin_token: str):
    # Create some customers
    c1 = Customer(email="c1@example.com", first_name="John", last_name="Doe", is_verified=True)
    c2 = Customer(email="c2@example.com", first_name="Jane", last_name="Smith", is_verified=False)
    session.add(c1)
    session.add(c2)
    session.commit()
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/customers/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["email"] == "c1@example.com"
    assert data[0]["first_name"] == "John"
    assert data[0]["discount_type"] == "percent"
    assert data[0]["discount_value"] == 0.0
    assert data[1]["email"] == "c2@example.com"
    assert data[1]["is_verified"] is False

def test_admin_update_customer_discount(session: Session, admin_token: str):
    # Create customer
    c1 = Customer(email="discount@example.com", first_name="John", is_verified=True)
    session.add(c1)
    session.commit()
    session.refresh(c1)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Invalid type
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "invalid_type", "discount_value": 15.0}, headers=headers)
    assert response.status_code == 400
    
    # 2. Invalid percent (>100)
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "percent", "discount_value": 150.0}, headers=headers)
    assert response.status_code == 400
    
    # 3. Invalid percent (<0)
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "percent", "discount_value": -5.0}, headers=headers)
    assert response.status_code == 400
    
    # 4. Valid percent (15.5%)
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "percent", "discount_value": 15.5}, headers=headers)
    assert response.status_code == 200
    assert response.json()["discount_type"] == "percent"
    assert response.json()["discount_value"] == 15.5
    
    # 5. Valid flat USD discount ($20)
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "usd", "discount_value": 20.0}, headers=headers)
    assert response.status_code == 200
    assert response.json()["discount_type"] == "usd"
    assert response.json()["discount_value"] == 20.0
    
    # 6. Valid flat UAH discount (500 грн)
    response = client.put(f"/customers/{c1.id}/discount", json={"discount_type": "uah", "discount_value": 500.0}, headers=headers)
    assert response.status_code == 200
    assert response.json()["discount_type"] == "uah"
    assert response.json()["discount_value"] == 500.0
    
    # Verify final state in DB
    session.refresh(c1)
    assert c1.discount_type == "uah"
    assert c1.discount_value == 500.0

def test_admin_get_customer_orders(session: Session, admin_token: str):
    # Create customer
    c1 = Customer(email="orders@example.com", first_name="John", is_verified=True)
    session.add(c1)
    session.commit()
    session.refresh(c1)
    
    # Create order for customer
    o1 = Order(
        customer_id=c1.id,
        customer_first_name="John",
        customer_last_name="Doe",
        customer_phone="0991234567",
        delivery_city="Kyiv",
        delivery_branch="Branch 1",
        payment_method="IBAN",
        totalUSD=150.0
    )
    session.add(o1)
    session.commit()
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get(f"/customers/{c1.id}/orders", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["totalUSD"] == 150.0
    assert data[0]["delivery_city"] == "Kyiv"
