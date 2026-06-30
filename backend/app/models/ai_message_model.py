from sqlalchemy import Column, Integer, String
from app.database import Base

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(String)

    response = Column(String)

    created_at = Column(String)

    user_id = Column(Integer)