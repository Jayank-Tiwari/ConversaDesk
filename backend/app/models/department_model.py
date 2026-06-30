from sqlalchemy import Column, Integer, String
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True)

    total_tickets = Column(Integer)

    escalation_rate = Column(Integer)