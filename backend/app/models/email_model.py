from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from app.database import Base


class EmailRecord(Base):

    __tablename__ = "emails"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    gmail_id = Column(String)

    sender = Column(String)

    subject = Column(String)

    body = Column(Text)

    department = Column(String)

    priority = Column(String)

    sentiment = Column(String)

    status = Column(String)

    ticket_created = Column(String)

    created_at = Column(String)

    ticket_code = Column(String)

    # NEW
    ai_reply = Column(Text)

    resolution_summary = Column(Text)

    reply_sent = Column(String)

    resolved_at = Column(String)