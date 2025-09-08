"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings"""
    
    # API Keys
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, alias="ANTHROPIC_API_KEY")
    
    # Database
    database_url: str = Field("sqlite:///./esg_data.db", alias="DATABASE_URL")
    
    # Server
    host: str = Field("0.0.0.0", alias="HOST")
    port: int = Field(8000, alias="PORT")
    debug: bool = Field(True, alias="DEBUG")
    
    # CORS
    allowed_origins: List[str] = Field(
        ["http://localhost:3000", "http://127.0.0.1:3000"], 
        alias="ALLOWED_ORIGINS"
    )
    
    # AI Configuration
    default_ai_provider: str = Field("openai", alias="DEFAULT_AI_PROVIDER")
    max_tokens: int = Field(2000, alias="MAX_TOKENS")
    temperature: float = Field(0.1, alias="TEMPERATURE")
    
    # Security
    secret_key: str = Field("change-me-in-production", alias="SECRET_KEY")
    rate_limit_requests: int = Field(100, alias="RATE_LIMIT_REQUESTS")
    rate_limit_minutes: int = Field(15, alias="RATE_LIMIT_MINUTES")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()