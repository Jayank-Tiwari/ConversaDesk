from sqlalchemy import Column, Integer, String
from app.database import Base

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)

    metric_name = Column(String)

    metric_value = Column(String)

    created_at = Column(String)