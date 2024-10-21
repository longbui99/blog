from pydantic import BaseModel

class ChatGPTRequest(BaseModel):
    message: str

class ChatGPTResponse(BaseModel):
    response: str
