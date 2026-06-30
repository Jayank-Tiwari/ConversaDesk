
from fastapi import APIRouter
from sqlalchemy import func
from app.database import SessionLocal
from app.models.ticket_model import Ticket
from app.services.analytics_ai_service import (
    generate_ai_insights
)


router = APIRouter()


@router.get("/dashboard-analytics2")
def dashboard_analytics():

    db = SessionLocal()

    try:

        # =========================
        # KPI COUNTS
        # =========================

        total_tickets = db.query(
            Ticket
        ).count()

        open_tickets = db.query(
            Ticket
        ).filter(

            Ticket.status == "Open"

        ).count()

        resolved_tickets = db.query(
            Ticket
        ).filter(

            Ticket.status.in_([
                "Resolved",
                "Closed"
            ])

        ).count()

        critical_tickets = db.query(
            Ticket
        ).filter(

            Ticket.priority == "Critical"

        ).count()

        # =========================
        # DEPARTMENT ANALYTICS
        # =========================

        department_query = db.query(

            Ticket.department,

            func.count(
                Ticket.id
            )

        ).group_by(
            Ticket.department
        ).all()

        departments = []

        colors = [

            "#6366f1",

            "#8b5cf6",

            "#06b6d4",

            "#f97316",

            "#16a34a",
        ]

        for index, item in enumerate(
            department_query
        ):

            departments.append({

                "name":
                item[0],

                "value":
                item[1],

                "color":
                colors[
                    index % len(colors)
                ]
            })

        # =========================
        # PRIORITY ANALYTICS
        # =========================

        priority_query = db.query(

            Ticket.priority,

            func.count(
                Ticket.id
            )

        ).group_by(
            Ticket.priority
        ).all()

        priority_data = []

        for item in priority_query:

            priority_data.append({

                "name":
                item[0],

                "value":
                item[1]
            })

        # =========================
        # TREND DATA
        # =========================

        trend_data = [

            {
                "day": "Mon",
                "open": max(
                    open_tickets - 2,
                    0
                ),
                "resolved": max(
                    resolved_tickets - 1,
                    0
                )
            },

            {
                "day": "Tue",
                "open": max(
                    open_tickets - 1,
                    0
                ),
                "resolved": max(
                    resolved_tickets,
                    0
                )
            },

            {
                "day": "Wed",
                "open": max(
                    open_tickets,
                    0
                ),
                "resolved": max(
                    resolved_tickets + 1,
                    0
                )
            },

            {
                "day": "Thu",
                "open": max(
                    open_tickets + 1,
                    0
                ),
                "resolved": max(
                    resolved_tickets + 2,
                    0
                )
            },

            {
                "day": "Fri",
                "open": max(
                    open_tickets + 2,
                    0
                ),
                "resolved": max(
                    resolved_tickets + 3,
                    0
                )
            },
        ]

        # =========================
        # SENTIMENT ANALYTICS
        # =========================

        positive = db.query(
            Ticket
        ).filter(

            Ticket.sentiment == "Positive"

        ).count()

        neutral = db.query(
            Ticket
        ).filter(

            Ticket.sentiment == "Neutral"

        ).count()

        negative = db.query(
            Ticket
        ).filter(

            Ticket.sentiment == "Negative"

        ).count()

        sentiment_data = [

            {
                "month": "Positive",
                "positive": positive,
                "negative": 0
            },

            {
                "month": "Neutral",
                "positive": neutral,
                "negative": 0
            },

            {
                "month": "Negative",
                "positive": 0,
                "negative": negative
            },
        ]

        # =========================
        # AI ANALYTICS PAYLOAD
        # =========================

        analytics_payload = {

            "total_tickets":
            total_tickets,

            "open_tickets":
            open_tickets,

            "resolved_tickets":
            resolved_tickets,

            "critical_tickets":
            critical_tickets,

            "departments":
            departments,

            "priority_data":
            priority_data,

            "positive_sentiment":
            positive,

            "neutral_sentiment":
            neutral,

            "negative_sentiment":
            negative,
        }

        # =========================
        # AI INSIGHTS
        # =========================

        ai_insights = generate_ai_insights(
            analytics_payload
        )

        # =========================
        # RESPONSE
        # =========================

        return {

            "total_tickets":
            total_tickets,

            "open_tickets":
            open_tickets,

            "resolved_tickets":
            resolved_tickets,

            "critical_tickets":
            critical_tickets,

            "ai_resolution_rate":
            81,

            "sla_health":
            92,

            "trend_data":
            trend_data,

            "departments":
            departments,

            "priority_data":
            priority_data,

            "sentiment_data":
            sentiment_data,

            "ai_insights":
            ai_insights,
        }

    except Exception as e:

        return {

            "error":
            str(e)
        }

    finally:

        db.close()

