from datetime import datetime

from uuid import UUID
from pydantic import BaseModel, Field, model_validator


class ChatRequest(BaseModel):
    message: str = Field(
        default="",
        max_length=2000,
    )
    chat_room_id: int | None = Field(
        default=None,
        gt=0,
    )
    attachment_ids: list[UUID] = Field(default_factory=list, max_length=3)
    client_request_id: UUID | None = None

    @model_validator(mode="after")
    def validate_content(self):
        if not self.message.strip() and not self.attachment_ids:
            raise ValueError("메시지 또는 이미지를 첨부해 주세요.")
        if len(set(self.attachment_ids)) != len(self.attachment_ids):
            raise ValueError("중복된 이미지입니다.")
        return self


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
    chat_is_pinned: bool
    chat_pinned_at: datetime | None
    chat_created_at: datetime
    chat_updated_at: datetime


class ChatRoomTitleUpdateRequest(BaseModel):
    chat_title: str = Field(
        min_length=1,
        max_length=150,
    )


class ChatRoomPinUpdateRequest(BaseModel):
    chat_is_pinned: bool


class ChatAttachmentResponse(BaseModel):
    attachment_id: str
    url: str
    content_type: str
    size: int
    width: int
    height: int


class StoredChatMessageResponse(BaseModel):
    chat_message_id: int
    role: str
    content: str
    created_at: datetime
    attachments: list[ChatAttachmentResponse] = Field(default_factory=list)
