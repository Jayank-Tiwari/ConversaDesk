
from fastapi import APIRouter

from app.database import SessionLocal

from app.models.ticket_model import Ticket

router = APIRouter()


@router.get("/dashboard-stats")
def dashboard_stats():

    db = SessionLocal()

    total_tickets = db.query(
        Ticket
    ).count()

    open_tickets = db.query(
        Ticket
    ).filter(

        Ticket.status == "Open"

    ).count()

    critical_tickets = db.query(
        Ticket
    ).filter(

        Ticket.priority == "Critical"

    ).count()

    resolved_tickets = db.query(
        Ticket
    ).filter(

        Ticket.status == "Resolved"

    ).count()

    db.close()

    return {

        "totalTickets":
        total_tickets,

        "openTickets":
        open_tickets,

        "criticalTickets":
        critical_tickets,

        "resolvedTickets":
        resolved_tickets
    }
