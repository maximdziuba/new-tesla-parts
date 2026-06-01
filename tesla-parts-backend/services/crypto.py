import base64
import hashlib
import os
from cryptography.fernet import Fernet

# Derive a consistent encryption key from JWT_SECRET_KEY if ENCRYPTION_KEY is not defined.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    secret = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")
    key_hash = hashlib.sha256(secret.encode()).digest()
    ENCRYPTION_KEY = base64.urlsafe_b64encode(key_hash).decode()

# Initialize Fernet cipher suite
_fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_value(value: str) -> str:
    if not value:
        return value
    return _fernet.encrypt(value.encode()).decode()

def decrypt_value(value: str) -> str:
    if not value:
        return value
    try:
        return _fernet.decrypt(value.encode()).decode()
    except Exception:
        # If decryption fails (e.g. existing unencrypted data), return original
        return value

def deterministic_hash(value: str) -> str:
    if not value:
        return ""
    return hashlib.sha256(value.lower().strip().encode()).hexdigest()
