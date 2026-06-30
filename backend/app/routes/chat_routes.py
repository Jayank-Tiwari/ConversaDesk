from typing import List

from fastapi import APIRouter

from pydantic import BaseModel

from app.services.chat_service import (
    process_chat
)


router = APIRouter()


class Message(BaseModel):

    role: str

    text: str


class ChatRequest(BaseModel):

    message: str

    role: str

    history: List[Message] = []


@router.post("/chat")
def chat_ai(data: ChatRequest):

    response = process_chat(

        data.message,

        data.role,

        [
            {
                "role": msg.role,

                "text": msg.text
            }

            for msg in data.history
        ]
    )

    return {

        "response": response
    }