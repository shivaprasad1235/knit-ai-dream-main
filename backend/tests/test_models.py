import pytest
import asyncio
from motor.motor_asyncio import AsyncClient, AsyncDatabase
from app.core.config import Settings
from app.models.models import ProductModel
from app.schemas.schemas import ProductCreate


@pytest.fixture
async def test_db():
    """Create test database."""
    settings = Settings(
        MONGODB_URL="mongodb://localhost:27017/test_crochet_db",
        DATABASE_NAME="test_crochet_db"
    )
    client = AsyncClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # Clean up before test
    await db.products.drop()
    
    yield db
    
    # Clean up after test
    await db.products.drop()
    client.close()


@pytest.mark.asyncio
async def test_create_product(test_db: AsyncDatabase):
    """Test product creation."""
    product_model = ProductModel(test_db)
    
    product_data = ProductCreate(
        name="Test Blanket",
        description="A test crochet blanket",
        price=49.99,
        image_url="https://example.com/image.jpg",
        stock=5
    )
    
    product = await product_model.create(product_data)
    
    assert product.name == "Test Blanket"
    assert product.price == 49.99
    assert product.stock == 5
    assert product.id is not None


@pytest.mark.asyncio
async def test_get_product(test_db: AsyncDatabase):
    """Test product retrieval."""
    product_model = ProductModel(test_db)
    
    # Create product
    product_data = ProductCreate(
        name="Test Blanket",
        description="A test crochet blanket",
        price=49.99,
        image_url="https://example.com/image.jpg"
    )
    created = await product_model.create(product_data)
    
    # Retrieve product
    retrieved = await product_model.get_by_id(str(created.id))
    
    assert retrieved is not None
    assert retrieved.name == "Test Blanket"
    assert retrieved.price == 49.99
