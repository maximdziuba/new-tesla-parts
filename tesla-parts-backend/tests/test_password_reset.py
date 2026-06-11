import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from models import Customer
from services.email import email_service
from unittest.mock import patch
from datetime import datetime, timedelta
import hashlib

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

def test_forgot_password_existing_customer(session: Session):
    from services.crypto import encrypt_value, deterministic_hash
    # Setup customer
    customer = Customer(
        email=encrypt_value("user@example.com"),
        email_hash=deterministic_hash("user@example.com"),
        is_verified=True
    )
    session.add(customer)
    session.commit()
    
    with patch("services.email.EmailService.send_password_reset_email", return_value=True) as mock_email:
        response = client.post("/customers/forgot-password", json={"email": "user@example.com"})
        assert response.status_code == 200
        assert "надіслано" in response.json()["message"]
        
        # Verify reset token hash is saved in DB
        session.refresh(customer)
        assert customer.reset_token_hash is not None
        assert customer.reset_token_expires_at is not None
        
        # Verify email was sent with the raw token
        mock_email.assert_called_once()
        called_email, called_token = mock_email.call_args[0]
        assert called_email == "user@example.com"
        
        # Verify saved hash corresponds to the token sent in email
        expected_hash = hashlib.sha256(called_token.encode()).hexdigest()
        assert customer.reset_token_hash == expected_hash

def test_forgot_password_non_existing_customer(session: Session):
    with patch("services.email.EmailService.send_password_reset_email", return_value=True) as mock_email:
        # Should return 200 anyway to prevent user enumeration
        response = client.post("/customers/forgot-password", json={"email": "nonexistent@example.com"})
        assert response.status_code == 200
        assert "надіслано" in response.json()["message"]
        
        # Verify email was not sent
        mock_email.assert_not_called()

def test_reset_password_success(session: Session):
    from services.crypto import encrypt_value, deterministic_hash
    from auth import get_password_hash
    
    # Setup token
    raw_token = "secure-reset-token-123"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    customer = Customer(
        email=encrypt_value("reset@example.com"),
        email_hash=deterministic_hash("reset@example.com"),
        hashed_password=get_password_hash("oldpassword"),
        is_verified=True,
        reset_token_hash=token_hash,
        reset_token_expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    session.add(customer)
    session.commit()
    
    reset_data = {
        "token": raw_token,
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    response = client.post("/customers/reset-password", json=reset_data)
    assert response.status_code == 200
    assert "успішно" in response.json()["message"]
    
    # Verify customer updated in DB
    session.refresh(customer)
    assert customer.reset_token_hash is None
    assert customer.reset_token_expires_at is None
    
    # Verify we can login with the new password
    login_response = client.post("/customers/login", json={
        "email": "reset@example.com",
        "password": "newpassword123"
    })
    assert login_response.status_code == 200

def test_reset_password_mismatch(session: Session):
    reset_data = {
        "token": "some-token",
        "password": "pass1",
        "confirm_password": "pass2"
    }
    response = client.post("/customers/reset-password", json=reset_data)
    assert response.status_code == 400
    assert "не співпадають" in response.json()["detail"]

def test_reset_password_expired(session: Session):
    from services.crypto import encrypt_value, deterministic_hash
    
    raw_token = "expired-token"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    customer = Customer(
        email=encrypt_value("reset_exp@example.com"),
        email_hash=deterministic_hash("reset_exp@example.com"),
        is_verified=True,
        reset_token_hash=token_hash,
        reset_token_expires_at=datetime.utcnow() - timedelta(seconds=1)
    )
    session.add(customer)
    session.commit()
    
    reset_data = {
        "token": raw_token,
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    response = client.post("/customers/reset-password", json=reset_data)
    assert response.status_code == 400
    assert "прострочений" in response.json()["detail"]

def test_reset_password_invalid_token(session: Session):
    from services.crypto import encrypt_value, deterministic_hash
    
    raw_token = "correct-token"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    
    customer = Customer(
        email=encrypt_value("reset_inv@example.com"),
        email_hash=deterministic_hash("reset_inv@example.com"),
        is_verified=True,
        reset_token_hash=token_hash,
        reset_token_expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    session.add(customer)
    session.commit()
    
    # Try resetting with "wrong-token"
    reset_data = {
        "token": "wrong-token",
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    response = client.post("/customers/reset-password", json=reset_data)
    assert response.status_code == 400
    assert "Недійсний" in response.json()["detail"]
