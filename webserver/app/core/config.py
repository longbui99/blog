from typing import Any
from pydantic_settings import BaseSettings
from functools import lru_cache
import logging
import os

class Settings(BaseSettings):
    PROJECT_NAME: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALLOWED_ORIGINS: str  # Will be converted to list in get_settings()
    LOG_FILE: str
    ELASTICSEARCH_HOST: str = "http://localhost:9200"
    ATTACHMENT_PATH: str = ""

    class Config:
        env_file = ("builder/.env", ".env")  # Try multiple possible locations
        env_file_encoding = 'utf-8'
        case_sensitive = True
        env_prefix = ""  

    def check_not_empty(self) -> None:
        """Validate all fields are not empty after model initialization"""
        for field_name, field_value in self:
            logging.info(f"Checking field {field_name} with value {field_value}")
            if not field_value or (isinstance(field_value, str) and field_value.strip() == ""):
                raise ValueError(f"Field {field_name} cannot be empty")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    # Convert ALLOWED_ORIGINS string to list
    settings.ALLOWED_ORIGINS = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(',')]
    settings.check_not_empty()
    return settings

# Create settings instance
settings = get_settings()
