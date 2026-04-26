from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration from environment variables."""
    
    # App
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Loop & Bloom API"
    APP_VERSION: str = "1.0.0"
    
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "crochet_db"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ADMIN_FRONTEND_URL: str = "http://localhost:5173"
    
    # AI Integration
    AI_PROVIDER: str = "openai"  # openai, gemini, claude
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None
    
    # Firebase
    FIREBASE_API_KEY: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    
    # Admin credentials (for demo/setup)
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "changeme123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
