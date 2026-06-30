from sqlalchemy import Column, Integer, String

from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    message = Column(String)

    type = Column(String)

    user_id = Column(Integer)

    is_read = Column(String)