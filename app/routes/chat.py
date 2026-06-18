from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAIError

from app.database import chats_collection
from app.middleware.auth import get_current_user
from app.models.chat import ChatHistoryItem, SendMessageRequest, SendMessageResponse
from app.services.llm import get_football_reply

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.get("/history", response_model=list[ChatHistoryItem])
def get_chat_history(
    current_user: dict = Depends(get_current_user)
):
    history = chats_collection.find(
        {"user_id": current_user["id"]}
    ).sort(
        "created_at",
        -1
    ).limit(30)

    return [
        {
            "id": str(item["_id"]),
            "user_message": item["user_message"],
            "bot_reply": item["bot_reply"],
            "created_at": item["created_at"]
        }
        for item in history
    ]


@router.post("/message", response_model=SendMessageResponse)
def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        reply = get_football_reply(request.message)
    except OpenAIError as exc:
        raise HTTPException(
            status_code=502,
            detail="AI service is unavailable"
        ) from exc

    now = datetime.utcnow()

    chats_collection.insert_one(
        {
            "user_id": current_user["id"],
            "user_message": request.message,
            "bot_reply": reply,
            "created_at": now
        }
    )

    return {
        "reply": reply
    }
