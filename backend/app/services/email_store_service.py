import json

from datetime import datetime

from app.database import SessionLocal

from app.models.email_model import EmailRecord

from app.models.ticket_model import Ticket

from app.services.gmail_service import (
    fetch_emails
)

from app.services.ai_filter_service import (
    is_support_email
)

from app.services.azure_ai_service import (

    analyze_email,

    generate_email_reply
)

from app.services.rag_service import (
    search_rag
)

from app.services.gmail_send_service import (
    send_gmail
)


def save_emails():

    db = SessionLocal()

    try:

        emails = fetch_emails()

        saved_count = 0

        for email in emails:

            # ====================================
            # CHECK EXISTING EMAIL
            # ====================================

            existing_email = db.query(
                EmailRecord
            ).filter(
                EmailRecord.gmail_id
                == email["gmail_id"]
            ).first()

            # EMAIL EXISTS
            if existing_email:
                if existing_email.reply_sent == "Yes" or existing_email.status == "Ignored":
                    continue
                # If reply not sent, it will proceed to the existing block below...
            else:
                # ====================================
                # FILTER NON SUPPORT EMAILS
                # ====================================
                if not is_support_email(
                    email["subject"],
                    email["body"]
                ):
                    ignored_email = EmailRecord(
                        gmail_id=email["gmail_id"],
                        sender=email["sender"],
                        subject=email["subject"],
                        body=email["body"],
                        status="Ignored",
                        created_at=str(datetime.now())
                    )
                    db.add(ignored_email)
                    db.commit()
                    continue

            if existing_email:

                # REPLY ALREADY SENT
                if existing_email.reply_sent == "Yes":

                    print(
                        "REPLY ALREADY SENT"
                    )

                    continue

                else:

                    print(
                        "REPLY NOT SENT YET"
                    )

                    # SEARCH RAG
                    rag_results = search_rag(

                        email["subject"]
                        + " "
                        + email["body"]
                    )

                    rag_context = ""

                    if rag_results:

                        rag_context = "\n\n".join([

                            doc.page_content

                            for doc in rag_results[:3]

                        ])

                    # GENERATE REPLY
                    reply = generate_email_reply(

                        email["body"],

                        rag_context
                    )

                    # SEND MAIL
                    send_gmail(

                        email["sender"],

                        "Re: " + email["subject"],

                        reply
                    )

                    # UPDATE EMAIL
                    existing_email.ai_reply = reply

                    existing_email.reply_sent = "Yes"

                    existing_email.resolution_summary = (
                        reply[:300]
                    )

                    existing_email.resolved_at = str(
                        datetime.now()
                    )

                    db.commit()

                    print(
                        "MISSING REPLY SENT"
                    )

                    continue

            # ====================================
            # AI ANALYSIS
            # ====================================

            ai_response = analyze_email(

                email["subject"],

                email["body"]
            )

            try:

                analysis = json.loads(
                    ai_response
                )

            except Exception:

                analysis = {

                    "department": "Support",

                    "priority": "Medium",

                    "sentiment": "Neutral",

                    "summary": email["subject"],

                    "issue_type": "General"
                }

            # ====================================
            # RAG SEARCH
            # ====================================

            rag_results = search_rag(

                email["subject"]
                + " "
                + email["body"]
            )

            rag_context = ""

            if rag_results:

                rag_context = "\n\n".join([

                    doc.page_content

                    for doc in rag_results[:3]

                ])

            print(
                "RAG CONTEXT FOUND"
            )

            # ====================================
            # GENERATE AI REPLY
            # ====================================

            reply = generate_email_reply(

                email["body"],

                rag_context
            )

            print(
                "AI REPLY GENERATED"
            )

            # ====================================
            # SEND AUTO EMAIL
            # ====================================

            send_gmail(

                email["sender"],

                "Re: " + email["subject"],

                reply
            )

            print(
                "AUTO REPLY SENT"
            )

            # ====================================
            # GENERATE TICKET CODE
            # ====================================

            ticket_code = (
                f"TICK-{email['gmail_id'][:6]}"
            )

            # ====================================
            # DUPLICATE TICKET CHECK
            # ====================================

            existing_ticket = db.query(
                Ticket
            ).filter(

                Ticket.ticket_code
                == ticket_code

            ).first()

            if existing_ticket:

                print(
                    "TICKET ALREADY EXISTS"
                )

            else:

                # CREATE TICKET
                ticket = Ticket(

                    ticket_code=ticket_code,

                    customer=email["sender"],

                    department=
                    analysis["department"],

                    priority=
                    analysis["priority"],

                    status="Open",

                    sentiment=
                    analysis["sentiment"],

                    description=email["body"],

                    summary=
                    analysis["summary"],

                    created_date=
                    str(datetime.now()),

                    sla=24,

                    created_by=1
                )

                db.add(ticket)

                print(
                    "TICKET CREATED"
                )

            # ====================================
            # SAVE EMAIL RECORD
            # ====================================

            new_email = EmailRecord(

                gmail_id=email["gmail_id"],

                sender=email["sender"],

                subject=email["subject"],

                body=email["body"],

                department=
                analysis["department"],

                priority=
                analysis["priority"],

                sentiment=
                analysis["sentiment"],

                status="Processed",

                ticket_created="Yes",

                created_at=
                str(datetime.now()),

                ticket_code=
                ticket_code,

                ai_reply=reply,

                resolution_summary=
                reply[:300],

                reply_sent="Yes",

                resolved_at=
                str(datetime.now())
            )

            db.add(new_email)

            print(
                "EMAIL RECORD SAVED"
            )

            saved_count += 1

        # ====================================
        # COMMIT DATABASE
        # ====================================

        db.commit()

        print(
            "DATABASE COMMIT SUCCESS"
        )

        return {

            "message":
            "AI automation completed",

            "saved_count":
            saved_count
        }

    except Exception as e:

        db.rollback()

        print(

            "DATABASE ERROR:",

            str(e)
        )

        return {

            "error":
            str(e)
        }

    finally:

        db.close()

