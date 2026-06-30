from fastapi import APIRouter

from app.services.ai_email_processor import (
    process_emails
)

router = APIRouter()


@router.get("/process-ai-emails")
def process():

    return process_emails()