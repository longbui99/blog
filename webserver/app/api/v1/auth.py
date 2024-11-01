from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.core.security import authenticate_user, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserInDB, UserLogin
from app.crud.user import create_user, delete_user, get_user_by_username
from typing import Annotated
import jwt
from app.core.config import settings  # Import settings from your config file

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login")
async def login_post(user_data: UserLogin):
    user = await authenticate_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}  # Disable expiration verification
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/users", response_model=UserInDB)
async def create_new_user(user: UserCreate, _: Annotated[User, Depends(get_current_user)]):
    db_user = await get_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await create_user(user)

@router.delete("/users/{username}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user(username: str, current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    user = await get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await delete_user(username)
    return {"detail": "User successfully deleted"}


@router.post("/test")
async def test_authentication(_: Annotated[User, Depends(get_current_user)]):
    return {"authenticated": True}

@router.post("/logout")
async def logout(_: Annotated[User, Depends(get_current_user)]):
    return {"message": "Logout successful"}