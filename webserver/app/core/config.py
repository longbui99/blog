from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALLOWED_ORIGINS: str  # Will be converted to list in get_settings()
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    # Convert ALLOWED_ORIGINS string to list
    settings.ALLOWED_ORIGINS = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(',')]
    return settings

# Create settings instance
settings = get_settings()