from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.db.mongodb import get_db
from app.models.models import OrderModel
from app.schemas.schemas import Order, OrderCreate, OrderUpdate
from app.utils.dependencies import get_current_user, get_current_admin_user, get_current_user_id

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=Order)
async def create_order(
    order_data: OrderCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Create a new order."""
    order_model = OrderModel(db)
    order = await order_model.create(user_id, order_data)
    return order


@router.get("", response_model=list[Order])
async def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Get current user's orders."""
    order_model = OrderModel(db)
    orders = await order_model.get_by_user(user_id, skip, limit)
    return orders


@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Get a specific order (verify ownership)."""
    order_model = OrderModel(db)
    order = await order_model.get_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order


@router.put("/{order_id}", response_model=Order)
async def update_order_status(
    order_id: str,
    order_data: OrderUpdate,
    _=Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """Update order status (admin only)."""
    order_model = OrderModel(db)
    order = await order_model.update_status(order_id, order_data.status)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order
