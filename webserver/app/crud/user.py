from app.models.user import User
from app.schemas.user import UserCreate
from app.core.hashing import get_password_hash

async def get_user_by_username(username: str):
    return await User.filter(username=username).first()

async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        name=user.name,  # Add this line
        hashed_password=hashed_password
    )
    await db_user.save()
    return db_user

async def get_users(skip: int = 0, limit: int = 100):
    return await User.all().offset(skip).limit(limit)

async def update_user(username: str, user_data: dict):
    user = await User.get(username=username)
    for key, value in user_data.items():
        setattr(user, key, value)
    await user.save()

async def delete_user(username: str):
    user = await User.get(username=username)
    await user.delete()
    return user
