from pydantic import BaseModel

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str