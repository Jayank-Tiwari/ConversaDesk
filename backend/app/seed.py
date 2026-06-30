from app.database import SessionLocal

from app.models.user_model import User
from app.models.ticket_model import Ticket
from app.models.chat_model import ChatHistory
from app.models.ai_message_model import AIMessage
from app.models.department_model import Department
from app.models.comment_model import TicketComment
from app.models.analytics_model import AnalyticsLog
from app.models.notification_model import Notification

from app.utils.security import hash_password


def seed_database():

    db = SessionLocal()

    # Prevent duplicate seeding
    existing_user = db.query(User).first()

    if existing_user:
        db.close()
        return

    # =========================
    # USERS
    # =========================

    users = [

        User(
            full_name="Anubhav Singh Pathania",
            email="manager@conversadesk.ai",
            password=hash_password("123456"),
            role="manager",
            department="Management",
            created_at="2025-05-08"
        ),

        User(
            full_name="Jayank Tiwari",
            email="employee@conversadesk.ai",
            password=hash_password("123456"),
            role="employee",
            department="IT",
            created_at="2025-05-08"
        ),

        User(
            full_name="Yatharth Chamoli",
            email="hr@conversadesk.ai",
            password=hash_password("123456"),
            role="employee",
            department="HR",
            created_at="2025-05-08"
        )
    ]

    db.add_all(users)
    db.commit()

    # =========================
    # TICKETS
    # =========================

    tickets = [

        Ticket(
            ticket_code="FIN1024",
            customer="Sarah Mitchell",
            department="Finance",
            priority="Critical",
            status="Open",
            sentiment="Negative",
            description="ERP payment module not processing international transfers.",
            summary="Critical ERP failure affecting international transfers.",
            created_date="2025-05-07",
            sla=92,
            created_by=1
        ),

        Ticket(
            ticket_code="HR2031",
            customer="James Okafor",
            department="HR",
            priority="High",
            status="In Progress",
            sentiment="Neutral",
            description="Employee onboarding portal showing incorrect benefits.",
            summary="Benefits sync issue in onboarding system.",
            created_date="2025-05-06",
            sla=74,
            created_by=2
        ),

        Ticket(
            ticket_code="IT3052",
            customer="David Park",
            department="IT",
            priority="Critical",
            status="Open",
            sentiment="Negative",
            description="Production database cluster at 94% disk usage.",
            summary="Database storage alert needs immediate action.",
            created_date="2025-05-08",
            sla=97,
            created_by=2
        )
    ]

    db.add_all(tickets)
    db.commit()

    # =========================
    # CHAT HISTORY
    # =========================

    chats = [

        ChatHistory(
            title="FIN1024 Critical Issue",
            time="2h ago",
            user_id=1
        ),

        ChatHistory(
            title="Weekly Analytics Report",
            time="Yesterday",
            user_id=1
        )
    ]

    db.add_all(chats)
    db.commit()

    # =========================
    # AI MESSAGES
    # =========================

    ai_messages = [

        AIMessage(
            question="Summarize FIN1024",
            response="Critical ERP payment issue affecting reconciliation.",
            created_at="2025-05-08",
            user_id=1
        ),

        AIMessage(
            question="Which department has highest escalation?",
            response="Operations department currently has highest escalation risk.",
            created_at="2025-05-08",
            user_id=1
        )
    ]

    db.add_all(ai_messages)
    db.commit()

    # =========================
    # DEPARTMENTS
    # =========================

    departments = [

        Department(
            name="Finance",
            total_tickets=12,
            escalation_rate=40
        ),

        Department(
            name="IT",
            total_tickets=18,
            escalation_rate=32
        ),

        Department(
            name="HR",
            total_tickets=7,
            escalation_rate=15
        )
    ]

    db.add_all(departments)
    db.commit()

    # =========================
    # COMMENTS
    # =========================

    comments = [

        TicketComment(
            comment="Escalated to Tier-3 support.",
            ticket_id=1,
            user_id=1
        ),

        TicketComment(
            comment="Database cleanup initiated.",
            ticket_id=3,
            user_id=2
        )
    ]

    db.add_all(comments)
    db.commit()

    # =========================
    # ANALYTICS
    # =========================

    analytics = [

        AnalyticsLog(
            metric_name="Weekly Resolution Rate",
            metric_value="64%",
            created_at="2025-05-08"
        ),

        AnalyticsLog(
            metric_name="Average SLA",
            metric_value="72%",
            created_at="2025-05-08"
        )
    ]

    db.add_all(analytics)
    db.commit()

    # =========================
    # NOTIFICATIONS
    # =========================

    notifications = [

        Notification(
            title="Critical Ticket Alert",
            message="FIN1024 requires immediate action.",
            type="critical",
            user_id=1,
            is_read="false"
        ),

        Notification(
            title="New Ticket Assigned",
            message="IT3052 assigned to IT department.",
            type="info",
            user_id=2,
            is_read="false"
        )
    ]

    db.add_all(notifications)
    db.commit()

    db.close()

    print("Dummy database seeded successfully!")