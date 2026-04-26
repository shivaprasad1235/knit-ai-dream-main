from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.db.mongodb import get_db
from app.models.models import ProductModel
from app.schemas.schemas import Product, ProductCreate, ProductUpdate
from app.utils.dependencies import get_current_admin_user

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[Product])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db=Depends(get_db)
):
    """Get all products with pagination."""
    product_model = ProductModel(db)
    products = await product_model.get_all(skip, limit)
    return products


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db=Depends(get_db)):
    """Get a specific product."""
    product_model = ProductModel(db)
    product = await product_model.get_by_id(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.post("", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Create a new product (admin only)."""
    product_model = ProductModel(db)
    product = await product_model.create(product_data)
    return product


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Update a product (admin only)."""
    product_model = ProductModel(db)
    update_dict = product_data.model_dump(exclude_unset=True)
    
    product = await product_model.update(product_id, update_dict)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Delete a product (admin only)."""
    product_model = ProductModel(db)
    success = await product_model.delete(product_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
