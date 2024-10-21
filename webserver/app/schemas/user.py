from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    name: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserDelete(BaseModel):
    username: str

class UserLogin(BaseModel):
    username: str
    password: str