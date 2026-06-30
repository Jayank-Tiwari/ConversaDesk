from fastapi import APIRouter

from app.services.gmail_service import (
    fetch_emails
)

from app.services.email_store_service import (
    save_emails
)

from app.database import SessionLocal

from app.models.email_model import (
    EmailRecord
)

from app.models.ticket_model import (
    Ticket
)


router = APIRouter()


# =========================================
# FETCH RAW GMAIL EMAILS
# =========================================

@router.get("/emails")
def get_emails():

    return fetch_emails()


# =========================================
# SAVE EMAILS TO DATABASE
# =========================================

@router.get("/save-emails")
def save_email_data():

    return save_emails()


# =========================================
# GET ALL EMAILS FROM DATABASE
# =========================================

@router.get("/all-emails")
def get_all_emails():

    db = SessionLocal()

    emails = db.query(
        EmailRecord
    ).order_by(
        EmailRecord.id.desc()
    ).all()

    data = []

    for email in emails:

        # FIND RELATED TICKET
        ticket = db.query(
            Ticket
        ).filter(

            Ticket.ticket_code
            == email.ticket_code

        ).first()

        ticket_status = None

        if ticket:

            ticket_status = (
                ticket.status
            )

        data.append({

            "id":
            email.id,

            "sender":
            email.sender,

            "subject":
            email.subject,

            "body":
            email.body,

            "department":
            email.department,

            "priority":
            email.priority,

            "status":
            email.status,

            "ticket_created":
            email.ticket_created,

            "ticket_id":
            email.ticket_code,

            "ticket_status":
            ticket_status,

            "created_at":
            email.created_at,

            # NEW FIELDS
            "ai_reply":
            email.ai_reply,

            "resolution_summary":
            email.resolution_summary,

            "reply_sent":
            email.reply_sent,

            "resolved_at":
            email.resolved_at
        })

    db.close()

    return data