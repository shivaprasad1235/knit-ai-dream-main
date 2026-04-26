from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

# Global database instance
db_client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_db():
    """Connect to MongoDB."""
    global db_client, db
    settings = get_settings()
    db_client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = db_client[settings.DATABASE_NAME]
    print("✓ Connected to MongoDB")


async def close_db_connection():
    """Close MongoDB connection."""
    global db_client
    if db_client:
        db_client.close()
        print("✓ Disconnected from MongoDB")


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if db is None:
        raise RuntimeError("Database is not connected")
    return db
