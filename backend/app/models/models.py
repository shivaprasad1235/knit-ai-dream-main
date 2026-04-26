from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List
from app.schemas.schemas import (
    UserCreate, UserInDB, Product, ProductCreate, 
    Order, OrderCreate, AIDesign, AIDesignCreate
)
from app.core.security import hash_password


def _stringify_id(document: dict) -> dict:
    """Convert Mongo ObjectId values to strings before Pydantic validation."""
    if "_id" in document:
        document["_id"] = str(document["_id"])
    return document


class UserModel:
    """User database operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]
    
    async def create(self, user_data: UserCreate) -> UserInDB:
        """Create a new user."""
        user_dict = user_data.model_dump()
        user_dict["hashed_password"] = hash_password(user_dict.pop("password"))
        user_dict["is_admin"] = False
        user_dict["created_at"] = datetime.now(timezone.utc)
        user_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        return UserInDB(**user_dict)
    
    async def get_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        user = await self.collection.find_one({"email": email})
        if user:
            return UserInDB(**_stringify_id(user))
        return None
    
    async def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user:
                return UserInDB(**_stringify_id(user))
        except Exception:
            pass
        return None
    
    async def get_all(self, skip: int = 0, limit: int = 10) -> List[UserInDB]:
        """Get all users with pagination."""
        users = await self.collection.find().skip(skip).limit(limit).to_list(limit)
        return [UserInDB(**_stringify_id(user)) for user in users]


class ProductModel:
    """Product database operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["products"]
    
    async def create(self, product_data: ProductCreate) -> Product:
        """Create a new product."""
        product_dict = product_data.model_dump()
        product_dict["created_at"] = datetime.now(timezone.utc)
        product_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(product_dict)
        product_dict["_id"] = str(result.inserted_id)
        return Product(**product_dict)
    
    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID."""
        try:
            product = await self.collection.find_one({"_id": ObjectId(product_id)})
            if product:
                return Product(**_stringify_id(product))
        except Exception:
            pass
        return None
    
    async def get_all(self, skip: int = 0, limit: int = 10) -> List[Product]:
        """Get all products with pagination."""
        products = await self.collection.find().skip(skip).limit(limit).to_list(limit)
        return [Product(**_stringify_id(product)) for product in products]
    
    async def update(self, product_id: str, update_data: dict) -> Optional[Product]:
        """Update a product."""
        try:
            update_data["updated_at"] = datetime.now(timezone.utc)
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(product_id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                return Product(**_stringify_id(result))
        except Exception:
            pass
        return None
    
    async def delete(self, product_id: str) -> bool:
        """Delete a product."""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(product_id)})
            return result.deleted_count > 0
        except Exception:
            return False


class OrderModel:
    """Order database operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["orders"]
    
    async def create(self, user_id: str, order_data: OrderCreate) -> Order:
        """Create a new order."""
        order_dict = order_data.model_dump()
        order_dict["user_id"] = user_id
        order_dict["total"] = sum(item["price"] * item["quantity"] for item in order_dict["items"])
        order_dict["status"] = "pending"
        order_dict["created_at"] = datetime.now(timezone.utc)
        order_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(order_dict)
        order_dict["_id"] = str(result.inserted_id)
        return Order(**order_dict)
    
    async def get_by_id(self, order_id: str) -> Optional[Order]:
        """Get order by ID."""
        try:
            order = await self.collection.find_one({"_id": ObjectId(order_id)})
            if order:
                return Order(**_stringify_id(order))
        except Exception:
            pass
        return None
    
    async def get_by_user(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Order]:
        """Get orders by user ID."""
        orders = await self.collection.find({"user_id": user_id}).skip(skip).limit(limit).to_list(limit)
        return [Order(**_stringify_id(order)) for order in orders]
    
    async def get_all(self, skip: int = 0, limit: int = 10) -> List[Order]:
        """Get all orders (admin)."""
        orders = await self.collection.find().skip(skip).limit(limit).to_list(limit)
        return [Order(**_stringify_id(order)) for order in orders]
    
    async def update_status(self, order_id: str, status: str) -> Optional[Order]:
        """Update order status."""
        try:
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(order_id)},
                {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
                return_document=True
            )
            if result:
                return Order(**_stringify_id(result))
        except Exception:
            pass
        return None


class AIDesignModel:
    """AI Design database operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["ai_designs"]
    
    async def create(self, user_id: str, design_data: AIDesignCreate) -> AIDesign:
        """Create a new AI design request."""
        design_dict = design_data.model_dump()
        design_dict["user_id"] = user_id
        design_dict["status"] = "pending"
        design_dict["created_at"] = datetime.now(timezone.utc)
        design_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(design_dict)
        design_dict["_id"] = str(result.inserted_id)
        return AIDesign(**design_dict)
    
    async def get_by_id(self, design_id: str) -> Optional[AIDesign]:
        """Get design by ID."""
        try:
            design = await self.collection.find_one({"_id": ObjectId(design_id)})
            if design:
                return AIDesign(**_stringify_id(design))
        except Exception:
            pass
        return None
    
    async def get_by_user(self, user_id: str, skip: int = 0, limit: int = 10) -> List[AIDesign]:
        """Get designs by user ID."""
        designs = await self.collection.find({"user_id": user_id}).skip(skip).limit(limit).to_list(limit)
        return [AIDesign(**_stringify_id(design)) for design in designs]
    
    async def update(self, design_id: str, update_data: dict) -> Optional[AIDesign]:
        """Update a design."""
        try:
            update_data["updated_at"] = datetime.now(timezone.utc)
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(design_id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                return AIDesign(**_stringify_id(result))
        except Exception:
            pass
        return None
    
    async def get_all(self, skip: int = 0, limit: int = 10) -> List[AIDesign]:
        """Get all designs (admin)."""
        designs = await self.collection.find().skip(skip).limit(limit).to_list(limit)
        return [AIDesign(**_stringify_id(design)) for design in designs]
