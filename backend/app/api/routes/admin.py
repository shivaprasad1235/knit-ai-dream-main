from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.db.mongodb import get_db
from app.models.models import UserModel, OrderModel, AIDesignModel
from app.schemas.schemas import Order, AIDesign, User
from app.utils.dependencies import get_current_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/orders", response_model=list[Order])
async def get_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Get all orders (admin only)."""
    order_model = OrderModel(db)
    orders = await order_model.get_all(skip, limit)
    return orders


@router.get("/designs", response_model=list[AIDesign])
async def get_all_designs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Get all AI design requests (admin only)."""
    design_model = AIDesignModel(db)
    designs = await design_model.get_all(skip, limit)
    return designs


@router.get("/users", response_model=list[User])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Get all users (admin only)."""
    user_model = UserModel(db)
    users = await user_model.get_all(skip, limit)
    return [
        User(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            is_admin=user.is_admin,
            created_at=user.created_at
        ) for user in users
    ]
