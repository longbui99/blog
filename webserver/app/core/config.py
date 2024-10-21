from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BlogAPI"
    DATABASE_URL: str = "postgres://longbui:longbui@localhost:5432/blogdb"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: list = ["http://localhost:3000"]  # Add your frontend URL here
    OPENAI_API_KEY: str = "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"

    class Config:
        env_file = ".env"

settings = Settings()

