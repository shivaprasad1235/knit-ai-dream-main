from motor.motor_asyncio import AsyncDatabase
from app.models.models import UserModel
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.schemas.schemas import UserCreate, TokenResponse, UserInDB
from fastapi import HTTPException, status


class AuthService:
    """Authentication business logic."""
    
    def __init__(self, db: AsyncDatabase):
        self.user_model = UserModel(db)
    
    async def register(self, user_data: UserCreate) -> UserInDB:
        """Register a new user."""
        # Check if user already exists
        existing_user = await self.user_model.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        new_user = await self.user_model.create(user_data)
        return new_user
    
    async def login(self, email: str, password: str) -> TokenResponse:
        """Login user and return tokens."""
        # Get user by email
        user = await self.user_model.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create tokens
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
    
    async def get_current_user(self, user_id: str) -> UserInDB:
        """Get current user from ID."""
        user = await self.user_model.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
