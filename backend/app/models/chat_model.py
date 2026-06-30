from sqlalchemy import Column, Integer, String
from app.database import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    time = Column(String)

    user_id = Column(Integer)