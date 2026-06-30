from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Ticket(Base):

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    ticket_code = Column(String, unique=True)

    customer = Column(String)

    department = Column(String)

    priority = Column(String)

    status = Column(String)

    sentiment = Column(String)

    description = Column(String)

    summary = Column(String)

    created_date = Column(String)

    sla = Column(Integer)

    created_by = Column(Integer, ForeignKey("users.id"))