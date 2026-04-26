from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class OrderStatus(str, Enum):
    """Order status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ==================== User Model ====================
class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """User creation schema."""
    password: str


class UserInDB(UserBase):
    """User in database schema."""
    id: str = Field(alias="_id")
    hashed_password: str
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class User(UserBase):
    """User response schema."""
    id: str = Field(alias="_id")
    is_admin: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True


# ==================== Product Model ====================
class ProductBase(BaseModel):
    """Base product schema."""
    name: str
    description: str
    price: float
    image_url: str
    stock: int = 10


class ProductCreate(ProductBase):
    """Product creation schema."""
    pass


class ProductUpdate(BaseModel):
    """Product update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None


class Product(ProductBase):
    """Product response schema."""
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


# ==================== Order Model ====================
class OrderItemBase(BaseModel):
    """Base order item schema."""
    product_id: str
    quantity: int
    price: float


class OrderCreate(BaseModel):
    """Order creation schema."""
    items: List[OrderItemBase]
    shipping_address: str
    is_custom: bool = False
    custom_design_id: Optional[str] = None


class Order(BaseModel):
    """Order response schema."""
    id: str = Field(alias="_id")
    user_id: str
    items: List[OrderItemBase]
    total: float
    status: OrderStatus = OrderStatus.PENDING
    shipping_address: str
    is_custom: bool
    custom_design_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class OrderUpdate(BaseModel):
    """Order update schema."""
    status: OrderStatus
    notes: Optional[str] = None


# ==================== AI Design Model ====================
class AIDesignCreate(BaseModel):
    """AI design creation schema."""
    prompt: str
    style: Optional[str] = None


class AIDesign(BaseModel):
    """AI design response schema."""
    id: str = Field(alias="_id")
    user_id: str
    prompt: str
    style: Optional[str]
    image_url: Optional[str] = None
    description: Optional[str] = None
    pattern_notes: Optional[str] = None
    status: str = "completed"  # pending, completed, failed
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


# ==================== Auth Schemas ====================
class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class RegisterRequest(BaseModel):
    """Register request schema."""
    email: EmailStr
    full_name: str
    password: str
