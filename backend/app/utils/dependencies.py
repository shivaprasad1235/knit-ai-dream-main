from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.db.mongodb import get_db
from app.core.security import verify_token
from app.models.models import UserModel

security = HTTPBearer()


async def get_current_user_id(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """Get current user ID from JWT token."""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return payload["sub"]


async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user from database."""
    db = get_db()
    user_model = UserModel(db)
    user = await user_model.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_current_admin_user(user_id: str = Depends(get_current_user_id)):
    """Get current admin user."""
    db = get_db()
    user_model = UserModel(db)
    user = await user_model.get_by_id(user_id)
    
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user
