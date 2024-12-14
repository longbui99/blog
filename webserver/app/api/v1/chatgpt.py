from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.auth import get_current_user
from app.schemas.chatgpt import ChatGPTRequest, ChatGPTResponse

router = APIRouter()

@router.post("/chat", response_model=ChatGPTResponse)
async def chat_with_gpt(request: ChatGPTRequest, current_user: dict = Depends(get_current_user)):
    try:
        response = await generate_text(request.message)
        return ChatGPTResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
