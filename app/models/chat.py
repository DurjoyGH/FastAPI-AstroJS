from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Literal


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class ChatResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatDocument(BaseModel):
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[Message] = []


class SendMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)


class SendMessageResponse(BaseModel):
    reply: str


class ChatHistoryItem(BaseModel):
    id: str
    user_message: str
    bot_reply: str
    created_at: datetime
