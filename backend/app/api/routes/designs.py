from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.db.mongodb import get_db
from app.models.models import AIDesignModel
from app.services.ai_service import AIDesignService
from app.schemas.schemas import AIDesign, AIDesignCreate
from app.utils.dependencies import get_current_user_id

router = APIRouter(prefix="/api/designs", tags=["ai-designs"])


@router.post("", response_model=AIDesign)
async def generate_design(
    design_data: AIDesignCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Generate a new AI crochet design."""
    ai_service = AIDesignService(db)
    design = await ai_service.generate_design(user_id, design_data)
    return design


@router.get("", response_model=list[AIDesign])
async def get_user_designs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Get current user's AI designs."""
    design_model = AIDesignModel(db)
    designs = await design_model.get_by_user(user_id, skip, limit)
    return designs


@router.get("/{design_id}", response_model=AIDesign)
async def get_design(
    design_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Get a specific design (verify ownership)."""
    ai_service = AIDesignService(db)
    design = await ai_service.get_design(design_id, user_id)
    return design
