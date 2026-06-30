from apscheduler.schedulers.background import (
    BackgroundScheduler
)

from app.services.email_store_service import (
    save_emails
)

from app.services.ai_email_processor import (
    process_emails
)


scheduler = BackgroundScheduler()


def start_scheduler():

    # Save new emails
    scheduler.add_job(

        save_emails,

        "interval",

        minutes=1,

        max_instances=1,

        coalesce=True
    )

    # AI Processing
    scheduler.add_job(

        process_emails,

        "interval",

        minutes=1,

        max_instances=1,

        coalesce=True
    )

    scheduler.start()

    print("AI EMAIL AUTOMATION STARTED")