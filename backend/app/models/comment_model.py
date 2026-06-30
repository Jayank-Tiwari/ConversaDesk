from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Integer, primary_key=True, index=True)

    comment = Column(String)

    ticket_id = Column(Integer, ForeignKey("tickets.id"))

    user_id = Column(Integer, ForeignKey("users.id"))