from fastapi import APIRouter

from pydantic import BaseModel

from app.services.send_mail_service import (
    send_gmail
)

router = APIRouter()


class MailSchema(BaseModel):

    to: str

    subject: str

    body: str


@router.post("/send-reply")
def send_reply(data: MailSchema):

    try:

        send_gmail(

            data.to,

            data.subject,

            data.body
        )

        return {

            "message":
            "Email sent successfully"
        }

    except Exception as e:

        return {

            "error":
            str(e)
        }