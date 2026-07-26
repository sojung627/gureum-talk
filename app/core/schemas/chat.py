from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
    )
    chat_room_id: int | None = Field(
        default=None,
        gt=0,
    )


class EmotionScoreResponse(BaseModel):
    label: str
    score: float = Field(
        ge=0.0,
        le=1.0,
    )


class ChatResponse(BaseModel):
    answer: str
    model: str
    emotions: list[EmotionScoreResponse]
    safety_detected: bool
    chat_room_id: int
    chat_title: str


class ChatRoomResponse(BaseModel):
    chat_room_id: int
    chat_title: str
    chat_created_at: datetime
    chat_updated_at: datetime


class ChatRoomTitleUpdateRequest(BaseModel):
    chat_title: str = Field(
        min_length=1,
        max_length=150,
    )


class StoredChatMessageResponse(BaseModel):
    chat_message_id: int
    role: str
    content: str
    created_at: datetime
