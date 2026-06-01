import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from models import Customer
from services.email import email_service
from unittest.mock import patch

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

def test_register_customer(session: Session):
    with patch("services.email.EmailService.send_verification_email", return_value=True) as mock_email:
        response = client.post("/customers/register", json={"email": "test@example.com"})
        assert response.status_code == 200
        assert response.json()["message"] == "Посилання для підтвердження надіслано на вашу пошту"
        
        # Verify customer created in DB
        from services.crypto import deterministic_hash
        customer = session.exec(select(Customer).where(Customer.email_hash == deterministic_hash("test@example.com"))).first()
        assert customer is not None
        assert customer.is_verified is False
        assert customer.verification_token is not None
        
        # Verify email "sent"
        mock_email.assert_called_once_with("test@example.com", customer.verification_token)

def test_verify_customer(session: Session):
    # Setup unverified customer
    customer = Customer(
        email="verify@example.com", 
        verification_token="valid-token",
        token_expires_at=None # We'll set it in a bit or rely on defaults if we update the model
    )
    from datetime import datetime, timedelta
    customer.token_expires_at = datetime.utcnow() + timedelta(hours=1)
    session.add(customer)
    session.commit()
    
    verify_data = {
        "token": "valid-token",
        "password": "password123",
        "confirm_password": "password123"
    }
    response = client.post("/customers/verify", json=verify_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Акаунт успішно підтверджено. Тепер ви можете увійти"
    
    # Verify DB update
    session.refresh(customer)
    assert customer.is_verified is True
    assert customer.hashed_password is not None
    assert customer.verification_token is None

def test_verify_customer_mismatch_password(session: Session):
    verify_data = {
        "token": "some-token",
        "password": "pass1",
        "confirm_password": "pass2"
    }
    response = client.post("/customers/verify", json=verify_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Паролі не співпадають"

def test_login_customer(session: Session):
    # Setup verified customer
    from auth import get_password_hash
    customer = Customer(
        email="login@example.com",
        hashed_password=get_password_hash("secret123"),
        is_verified=True
    )
    session.add(customer)
    session.commit()
    
    login_data = {
        "email": "login@example.com",
        "password": "secret123"
    }
    response = client.post("/customers/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_unverified_customer(session: Session):
    from auth import get_password_hash
    customer = Customer(
        email="unverified@example.com",
        hashed_password=get_password_hash("secret123"),
        is_verified=False
    )
    session.add(customer)
    session.commit()
    
    login_data = {
        "email": "unverified@example.com",
        "password": "secret123"
    }
    response = client.post("/customers/login", json=login_data)
    assert response.status_code == 401
