from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import get_settings
from app.db.mongodb import connect_to_db, close_db_connection
from app.utils.error_handlers import add_exception_handlers
from app.api.routes import auth, products, orders, designs, admin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="AI-powered Crochet Marketplace API"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, settings.ADMIN_FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
add_exception_handlers(app)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(designs.router)
app.include_router(admin.router)


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    logger.info("Starting up...")
    await connect_to_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    logger.info("Shutting down...")
    await close_db_connection()


# Health check
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/api/health", tags=["health"])
async def api_health_check():
    """API-prefixed health check for frontend clients."""
    return {"status": "healthy", "service": settings.APP_NAME}


# API documentation
@app.get("/", tags=["root"])
async def root():
    """API root endpoint."""
    return {
        "message": "Welcome to Loop & Bloom API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
