from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import get_db
from app.core.security import create_access_token, verify_token
from app.services.auth_service import AuthService
from app.schemas.schemas import LoginRequest, RegisterRequest, RefreshTokenRequest, TokenResponse, User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=User)
async def register(request: RegisterRequest, db=Depends(get_db)):
    """Register a new user."""
    auth_service = AuthService(db)
    user = await auth_service.register(request)
    return User(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    """Login user."""
    auth_service = AuthService(db)
    return await auth_service.login(request.email, request.password)


@router.get("/me", response_model=User)
async def get_me(user=Depends(get_current_user)):
    """Get current user info."""
    return User(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db=Depends(get_db)):
    """Issue a new access token from a valid refresh token."""
    payload = verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh" or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    auth_service = AuthService(db)
    user = await auth_service.get_current_user(payload["sub"])
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=access_token, refresh_token=request.refresh_token)
