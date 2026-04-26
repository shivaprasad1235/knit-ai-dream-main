"""Initialize database with sample data."""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
from app.models.models import UserModel, ProductModel
from app.core.security import hash_password


async def seed_db():
    """Seed database with sample data."""
    settings = get_settings()
    
    # Connect to database
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("🌱 Seeding database...")
    
    # Drop existing collections (for demo purposes)
    await db.users.drop()
    await db.products.drop()
    await db.orders.drop()
    await db.ai_designs.drop()
    
    # Create admin user
    admin_user = {
        "email": "admin@example.com",
        "full_name": "Admin User",
        "hashed_password": hash_password("admin123"),
        "is_admin": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(admin_user)
    print("✓ Admin user created (admin@example.com / admin123)")
    
    # Create sample users
    sample_users = [
        {
            "email": "user1@example.com",
            "full_name": "Alice Johnson",
            "hashed_password": hash_password("password123"),
            "is_admin": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "email": "user2@example.com",
            "full_name": "Bob Smith",
            "hashed_password": hash_password("password123"),
            "is_admin": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    await db.users.insert_many(sample_users)
    print(f"✓ {len(sample_users)} sample users created")
    
    # Create sample products
    sample_products = [
        {
            "name": "Cozy Baby Blanket",
            "description": "Soft and warm hand-crocheted baby blanket in pastel colors",
            "price": 45.99,
            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            "stock": 10,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "name": "Amigurumi Fox",
            "description": "Adorable stuffed fox toy made with premium yarn",
            "price": 28.50,
            "image_url": "https://images.unsplash.com/photo-1589985645043-8e59976a4bb5?w=500",
            "stock": 15,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "name": "Summer Tank Top",
            "description": "Lightweight lacy crochet tank top, perfect for warm weather",
            "price": 35.00,
            "image_url": "https://images.unsplash.com/photo-1585399446032-b8d40b73a60e?w=500",
            "stock": 8,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "name": "Throw Pillow",
            "description": "Geometric pattern throw pillow in mustard and teal",
            "price": 32.99,
            "image_url": "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500",
            "stock": 12,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "name": "Coffee Cup Cozy",
            "description": "Warm and cozy cup sleeve in forest green",
            "price": 12.99,
            "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500",
            "stock": 20,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    await db.products.insert_many(sample_products)
    print(f"✓ {len(sample_products)} sample products created")
    
    client.close()
    print("✅ Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_db())
