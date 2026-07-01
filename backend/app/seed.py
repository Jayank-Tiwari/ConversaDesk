import random
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.user_model import User
from app.models.ticket_model import Ticket
from app.models.chat_model import ChatHistory
from app.models.ai_message_model import AIMessage
from app.utils.security import hash_password

def seed_database():
    db = SessionLocal()

    # Prevent duplicate user seeding
    existing_user = db.query(User).first()
    if not existing_user:
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

    # Clear existing tickets to avoid huge duplicate lists if seeded multiple times, or just append
    # Let's just append to give them 150 more
    
    departments = ['IT', 'Finance', 'Billing', 'HR', 'Operations', 'Others']
    priorities = ['Low', 'Medium', 'High', 'Critical']
    statuses = ['Open', 'In Progress', 'Resolved', 'Closed']
    sentiments = ['Positive', 'Neutral', 'Negative']
    
    customers = [
        "Sarah Mitchell", "James Okafor", "David Park", "Emily Chen", 
        "Michael Chang", "Jessica Williams", "Robert Brown", "Linda Davis", 
        "William Miller", "Elizabeth Wilson", "Richard Moore", "Barbara Taylor", 
        "Thomas Anderson", "Susan Thomas", "Christopher Jackson"
    ]
    
    issues = [
        ("Login issue", "User cannot login to the portal. Says invalid credentials."),
        ("Payment failed", "Customer tried to pay for invoice #1234 but card was declined."),
        ("VPN access", "Employee needs VPN access setup on their new laptop."),
        ("Payroll inquiry", "Question about recent pay stub deduction."),
        ("Database alert", "High CPU usage on the production database cluster."),
        ("Account locked", "Customer locked out after 5 failed attempts."),
        ("Refund request", "Requesting a refund for the last billing cycle."),
        ("Benefits update", "Need to update health insurance dependents."),
        ("Server downtime", "Main application server is responding with 502 Bad Gateway."),
        ("Feature request", "Would like a new export to CSV button on the dashboard."),
        ("Hardware replacement", "Mouse is broken, need a replacement."),
        ("Security audit", "Quarterly security audit compliance check needed."),
        ("Onboarding delay", "New hire is missing their software licenses."),
        ("Invoice discrepancy", "Billed amount doesn't match the contract."),
        ("Office supplies", "Running low on printer ink on the 3rd floor.")
    ]
    
    tickets_to_add = []
    base_date = datetime.now() - timedelta(days=30)
    
    # Check current ticket count
    current_count = db.query(Ticket).count()
    if current_count < 100:
        for i in range(150):
            dept = random.choice(departments)
            pri = random.choice(priorities)
            stat = random.choice(statuses)
            sent = random.choice(sentiments)
            cust = random.choice(customers)
            issue_summary, issue_desc = random.choice(issues)
            
            # Add some randomness to summary
            issue_summary = f"{issue_summary} - {random.randint(100, 999)}"
            
            # Random date within last 30 days
            created = base_date + timedelta(days=random.randint(0, 30))
            
            t = Ticket(
                ticket_code=f"{dept[:3].upper()}{random.randint(1000, 9999)}{i}",
                customer=cust,
                department=dept,
                priority=pri,
                status=stat,
                sentiment=sent,
                description=issue_desc,
                summary=issue_summary,
                created_date=created.strftime("%Y-%m-%d"),
                sla=random.randint(50, 100),
                created_by=random.choice([1, 2, 3])
            )
            tickets_to_add.append(t)
            
        db.add_all(tickets_to_add)
        db.commit()

    db.close()
    print("Database seeded successfully with 150+ tickets!")

if __name__ == "__main__":
    seed_database()