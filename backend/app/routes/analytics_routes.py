from fastapi import APIRouter
from sqlalchemy import func
from datetime import datetime, timedelta
import json
from app.database import SessionLocal
from app.models.ticket_model import Ticket
from app.services.analytics_ai_service import generate_executive_report

router = APIRouter()

@router.get("/dashboard-analytics")
def dashboard_analytics():
    db = SessionLocal()
    weekly_counts = []
    today = datetime.now()

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        date_str = day.strftime("%Y-%m-%d")
        count = db.query(Ticket).filter(Ticket.created_date.like(f"{date_str}%")).count()
        weekly_counts.append(count)

    total_tickets = db.query(Ticket).count()
    critical_open = db.query(Ticket).filter(Ticket.priority == "Critical", Ticket.status != "Resolved").count()
    
    escalation_risk = 0
    if total_tickets > 0:
        escalation_risk = int((critical_open / total_tickets) * 100)

    resolved = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    sla_health = 0
    if total_tickets > 0:
        sla_health = int((resolved / total_tickets) * 100)

    dept_result = db.query(Ticket.department, func.count(Ticket.id)).group_by(Ticket.department).order_by(func.count(Ticket.id).desc()).first()
    most_active_dept = dept_result[0] if dept_result else "N/A"

    dept_counts = db.query(Ticket.department, func.count(Ticket.id)).group_by(Ticket.department).all()
    department_breakdown = [{"name": dept, "value": count} for dept, count in dept_counts]

    positive_sentiment = db.query(Ticket).filter(Ticket.sentiment == "Positive").count()
    csat = int((positive_sentiment / total_tickets) * 100) if total_tickets > 0 else 0

    db.close()

    return {
        "weekly_trend": [
            {"day": (today - timedelta(days=i)).strftime("%a"), "count": c} 
            for i, c in zip(range(6, -1, -1), weekly_counts)
        ],
        "escalation_risk": escalation_risk,
        "sla_health": sla_health,
        "most_active_department": most_active_dept,
        "department_breakdown": department_breakdown,
        "csat": csat
    }

@router.get("/generate-report")
def generate_report():
    data = dashboard_analytics()
    db = SessionLocal()
    
    total = db.query(Ticket).count()
    resolved = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    open_count = db.query(Ticket).filter(Ticket.status == "Open").count()
    closed = db.query(Ticket).filter(Ticket.status == "Closed").count()
    in_progress = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    
    critical = db.query(Ticket).filter(Ticket.priority == "Critical").count()
    high = db.query(Ticket).filter(Ticket.priority == "High").count()
    medium = db.query(Ticket).filter(Ticket.priority == "Medium").count()
    low = db.query(Ticket).filter(Ticket.priority == "Low").count()
    
    positive = db.query(Ticket).filter(Ticket.sentiment == "Positive").count()
    neutral = db.query(Ticket).filter(Ticket.sentiment == "Neutral").count()
    negative = db.query(Ticket).filter(Ticket.sentiment == "Negative").count()
    
    dept_counts = db.query(Ticket.department, func.count(Ticket.id)).group_by(Ticket.department).all()
    departments = {dept: count for dept, count in dept_counts}

    db.close()
    
    enriched_data = {
        "dashboard_metrics": data,
        "ticket_overview": {
            "Total Tickets": total,
            "Open Tickets": open_count,
            "Resolved Tickets": resolved,
            "Closed Tickets": closed,
            "In Progress Tickets": in_progress
        },
        "priority_analysis": {
            "Critical": critical,
            "High": high,
            "Medium": medium,
            "Low": low
        },
        "customer_insights": {
            "Positive Sentiment": positive,
            "Neutral Sentiment": neutral,
            "Negative Sentiment": negative
        },
        "department_analysis": departments
    }
    
    return generate_executive_report(json.dumps(enriched_data))
