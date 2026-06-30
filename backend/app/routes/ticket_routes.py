
from datetime import datetime

from fastapi import APIRouter

from pydantic import BaseModel
import os
from openai import AzureOpenAI
from app.services.rag_service import get_embedding, cosine_similarity, build_rag

from app.database import SessionLocal

from app.models.ticket_model import Ticket


router = APIRouter()


# =========================
# REQUEST SCHEMA
# =========================

class TicketSchema(BaseModel):

    customer: str

    department: str

    priority: str

    status: str

    summary: str


# =========================
# GET ALL TICKETS
# =========================

@router.get("/all-tickets")
def all_tickets():

    db = SessionLocal()

    tickets = (
        db.query(Ticket)
        .order_by(Ticket.id.desc())
        .all()
    )

    data = []

    for ticket in tickets:

        data.append({

            "id":
            ticket.id,

            "ticket_code":
            ticket.ticket_code,

            "customer":
            ticket.customer,

            "department":
            ticket.department,

            "priority":
            ticket.priority,

            "status":
            ticket.status,

            "summary":
            ticket.summary,

            "created_date":
            ticket.created_date,
        })

    db.close()

    return data


# =========================
# RECENT TICKETS
# =========================

@router.get("/recent-tickets")
def recent_tickets():

    db = SessionLocal()

    tickets = (

        db.query(Ticket)

        .order_by(
            Ticket.id.desc()
        )

        .limit(2)

        .all()
    )

    data = []

    for ticket in tickets:

        data.append({

            "id":
            ticket.id,

            "ticket_code":
            ticket.ticket_code,

            "customer":
            ticket.customer,

            "department":
            ticket.department,

            "priority":
            ticket.priority,

            "status":
            ticket.status,

            "summary":
            ticket.summary,

            "created_date":
            ticket.created_date,
        })

    db.close()

    return data


# =========================
# SEARCH TICKET
# =========================

@router.get(
    "/search-ticket/{ticket_code}"
)
def search_ticket(
    ticket_code: str
):

    db = SessionLocal()

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.ticket_code ==
            ticket_code
        )
        .first()
    )

    if not ticket:

        db.close()

        return {

            "error":
            "Ticket not found"
        }

    data = {

        "ticket_code":
        ticket.ticket_code,

        "customer":
        ticket.customer,

        "department":
        ticket.department,

        "priority":
        ticket.priority,

        "status":
        ticket.status,

        "summary":
        ticket.summary,

        "sentiment":
        getattr(
            ticket,
            "sentiment",
            "Neutral"
        ),

        "sla":
        getattr(
            ticket,
            "sla",
            "24 hours"
        ),

        "created_date":
        ticket.created_date,
    }

    db.close()

    return data


# =========================
# CREATE TICKET
# =========================

@router.post("/create-ticket")
def create_ticket(
    data: TicketSchema
):

    db = SessionLocal()

    try:

        print(
            "CREATE REQUEST:",
            data
        )

        ticket = Ticket(

            ticket_code=
            f"TICK-{int(datetime.now().timestamp())}",

            customer=
            data.customer,

            department=
            data.department,

            priority=
            data.priority,

            status=
            data.status,

            summary=
            data.summary,

            created_date=
            str(datetime.now())
        )

        db.add(ticket)

        db.commit()

        db.refresh(ticket)

        print(
            "TICKET CREATED"
        )

        return {

            "message":
            "Ticket created successfully"
        }

    except Exception as e:

        db.rollback()

        print(
            "CREATE ERROR:",
            str(e)
        )

        return {

            "error":
            str(e)
        }

    finally:

        db.close()


# =========================
# UPDATE TICKET
# =========================

@router.put(
    "/update-ticket/{ticket_id}"
)
def update_ticket(

    ticket_id: int,

    data: TicketSchema
):

    db = SessionLocal()

    try:

        ticket = (
            db.query(Ticket)
            .filter(
                Ticket.id == ticket_id
            )
            .first()
        )

        if not ticket:

            return {

                "message":
                "Ticket not found"
            }

        ticket.customer = (
            data.customer
        )

        ticket.department = (
            data.department
        )

        ticket.priority = (
            data.priority
        )

        ticket.status = (
            data.status
        )

        ticket.summary = (
            data.summary
        )

        db.commit()

        print(
            "TICKET UPDATED"
        )

        return {
            "message":
            "Ticket updated successfully"
        }

    except Exception as e:

        db.rollback()

        print(
            "UPDATE ERROR:",
            str(e)
        )

        return {

            "error":
            str(e)
        }

    finally:

        db.close()


# =========================
# DELETE TICKET
# =========================

@router.delete(
    "/delete-ticket/{ticket_id}"
)
def delete_ticket(
    ticket_id: int
):

    db = SessionLocal()

    try:

        ticket = (
            db.query(Ticket)
            .filter(
                Ticket.id == ticket_id
            )
            .first()
        )

        if not ticket:

            return {

                "message":
                "Ticket not found"
            }

        db.delete(ticket)

        db.commit()

        print(
            "TICKET DELETED"
        )

        return {

            "message":
            "Ticket deleted successfully"
        }

    except Exception as e:

        db.rollback()

        print(
            "DELETE ERROR:",
            str(e)
        )

        return {

            "error":
            str(e)
        }

    finally:

        db.close()


# =========================
# SINGLE TICKET
# =========================

@router.get(
    "/ticket/{ticket_id}"
)
def get_ticket(
    ticket_id: int
):

    db = SessionLocal()

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id
        )
        .first()
    )

    if not ticket:

        db.close()

        return {

            "message":
            "Ticket not found"
        }

    data = {

        "id":
        ticket.id,

        "ticket_code":
        ticket.ticket_code,

        "customer":
        ticket.customer,

        "department":
        ticket.department,

        "priority":
        ticket.priority,

        "status":
        ticket.status,

        "summary":
        ticket.summary,

        "created_date":
        ticket.created_date,
    }

    db.close()

    return data

from app.services.ticket_resolution_service import auto_resolve_ticket

@router.get("/ticket-resolve/{ticket_id}")
def resolve_ticket(ticket_id: int):
    return auto_resolve_ticket(ticket_id)

@router.get("/tickets/{ticket_id}/similar")
def get_similar_tickets(ticket_id: int):
    db = SessionLocal()
    current = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not current:
        db.close()
        return {"error": "Not found"}
    
    resolved_tickets = db.query(Ticket).filter(Ticket.status == "Resolved", Ticket.id != ticket_id).all()
    if not resolved_tickets:
        db.close()
        return []
    
    current_text = f"{current.summary} {current.description or ''}"
    current_emb = get_embedding(current_text)
    
    results = []
    for t in resolved_tickets:
        t_text = f"{t.summary} {t.description or ''}"
        t_emb = get_embedding(t_text)
        sim = cosine_similarity(current_emb, t_emb)
        results.append((sim, t))
    
    results.sort(key=lambda x: x[0], reverse=True)
    top_3 = results[:3]
    
    data = []
    for sim, t in top_3:
        data.append({
            "id": t.id,
            "ticket_code": t.ticket_code,
            "summary": t.summary,
            "department": t.department,
            "similarity": round(sim * 100, 1)
        })
        
    db.close()
    return data

class UploadKBSchema(BaseModel):
    filename: str
    content: str

@router.post("/tickets/{ticket_id}/generate-kb")
def generate_kb(ticket_id: int):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    db.close()
    
    if not ticket:
        return {"error": "Not found"}
        
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    
    prompt = f"""
    You are an expert IT Support Knowledge Base writer.
    Draft a professional Markdown (.md) Knowledge Base article based on this resolved ticket:
    
    Customer: {ticket.customer}
    Issue: {ticket.summary}
    Description: {ticket.description}
    Department: {ticket.department}
    
    Include sections: # Title, ## Problem Description, ## Resolution / Steps to Fix.
    Provide ONLY the Markdown content.
    """
    
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    content = response.choices[0].message.content
    return {"content": content, "suggested_filename": f"KB-{ticket.ticket_code}.md"}

@router.post("/upload-kb")
def upload_kb(data: UploadKBSchema):
    os.makedirs("docs", exist_ok=True)
    filepath = os.path.join("docs", data.filename)
    if not filepath.endswith(".md"):
        filepath += ".md"
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(data.content)
        
    build_rag()
    
    return {"status": "success", "message": "KB Article uploaded and RAG rebuilt."}
