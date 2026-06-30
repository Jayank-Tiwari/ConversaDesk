import os
from dotenv import load_dotenv
from openai import AzureOpenAI
from app.database import SessionLocal
from app.models.ticket_model import Ticket
from app.services.rag_service import search_rag

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

def auto_resolve_ticket(ticket_id: int):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    db.close()
    
    if not ticket:
        return {"error": "Ticket not found"}
        
    # Search RAG
    rag_docs = search_rag(ticket.description)
    rag_context = "\n\n".join([doc.page_content for doc in rag_docs[:3]]) if rag_docs else "No relevant knowledge found."
    
    prompt = f"""
You are an expert IT Support Agent.
Your task is to generate a professional, accurate resolution or response to the customer based on their ticket.

TICKET DETAILS:
Customer: {ticket.customer}
Issue: {ticket.summary}
Description: {ticket.description}

KNOWLEDGE BASE CONTEXT:
{rag_context}

Provide ONLY the suggested resolution text or email response. Do not include markdown blocks or introductory phrases.
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": "You are a professional IT Support Agent."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        resolution = response.choices[0].message.content.strip()
        return {"resolution": resolution}
    except Exception as e:
        return {"error": str(e)}
