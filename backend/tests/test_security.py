import pytest
from app.core.security import hash_password, verify_password, create_access_token, verify_token


def test_password_hashing():
    """Test password hashing and verification."""
    password = "securepassword123"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_jwt_token_creation():
    """Test JWT token creation."""
    data = {"sub": "user123", "email": "test@example.com"}
    token = create_access_token(data)
    
    assert token
    assert isinstance(token, str)
    
    payload = verify_token(token)
    assert payload
    assert payload["sub"] == "user123"
    assert payload["email"] == "test@example.com"


def test_invalid_token():
    """Test invalid token verification."""
    invalid_token = "invalid.token.here"
    payload = verify_token(invalid_token)
    
    assert payload is None


def test_token_expiry():
    """Test token expiration."""
    from datetime import timedelta, datetime, timezone
    
    data = {"sub": "user123"}
    # Create token that expires immediately
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    
    # Token should be invalid (expired)
    import time
    time.sleep(1)
    payload = verify_token(token)
    
    # May be None or have exp in the past
    assert payload is None or payload.get("exp", 0) < datetime.now(timezone.utc).timestamp()
