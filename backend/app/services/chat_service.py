# app/services/chat_service.py

import os
import re
import sqlite3

from dotenv import load_dotenv
from openai import AzureOpenAI

from app.services.sql_agent_service import (
    generate_sql,
    execute_sql,
    is_safe_query
)

from app.services.rag_service import (
    search_rag
)

from app.services.gmail_send_service import (
    send_gmail
)

load_dotenv()

# =========================================================
# AZURE OPENAI CLIENT
# =========================================================

client = AzureOpenAI(

    api_key=os.getenv(
        "AZURE_OPENAI_API_KEY"
    ),

    api_version=os.getenv(
        "AZURE_OPENAI_API_VERSION"
    ),

    azure_endpoint=os.getenv(
        "AZURE_OPENAI_ENDPOINT"
    )
)

# =========================================================
# EMAIL MEMORY
# =========================================================

pending_email_drafts = {}

# =========================================================
# EMAIL CONFIRMATION DETECTOR
# =========================================================

def is_email_confirmation(message):

    msg = message.lower().strip()

    confirmations = [

        "yes",
        "yes send",
        "send it",
        "yes send it",
        "confirm",
        "confirm send",
        "go ahead",
        "proceed",
        "okay send",
        "ok send",
        "yes send mail",
        "send this email",
        "send this mail"

    ]

    return msg in confirmations

# =========================================================
# DETECT EMAIL REQUEST
# =========================================================

def is_email_request(message):

    msg = message.lower().strip()

    # =============================================
    # DO NOT TREAT CONFIRMATIONS AS REQUESTS
    # =============================================

    if is_email_confirmation(msg):
        return False

    email_keywords = [

        "send mail",
        "send email",
        "draft mail",
        "draft email",
        "reply to customer",
        "customer reply",
        "respond to customer",
        "write email",
        "compose email",
        "mail to customer",
        "customer communication",
        "send response",
        "email customer"

    ]

    return any(
        keyword in msg
        for keyword in email_keywords
    )

# =========================================================
# EXTRACT TICKET ID
# =========================================================

def extract_ticket_id(text):

    if not text:
        return None

    match = re.search(

        r"TICK[- ]?\w+|TCK[- ]?\w+",

        text,

        re.IGNORECASE
    )

    return (
        match.group(0)
        if match
        else None
    )

# =========================================================
# GET ACTIVE TICKET
# =========================================================

def get_active_ticket(
    history,
    current_message
):

    # =============================================
    # CHECK CURRENT MESSAGE
    # =============================================

    current_ticket = extract_ticket_id(
        current_message
    )

    if current_ticket:

        print(
            "\nFOUND TICKET IN CURRENT MESSAGE:\n",
            current_ticket
        )

        return current_ticket

    # =============================================
    # CHECK HISTORY
    # =============================================

    for msg in reversed(history):

        text = ""

        # =========================================
        # HANDLE DICT FORMAT
        # =========================================

        if isinstance(msg, dict):

            text = msg.get(
                "text",
                ""
            )

        # =========================================
        # HANDLE STRING FORMAT
        # =========================================

        elif isinstance(msg, str):

            text = msg

        # =========================================
        # SEARCH TICKET
        # =========================================

        ticket = extract_ticket_id(
            text
        )

        if ticket:

            print(
                "\nFOUND TICKET IN HISTORY:\n",
                ticket
            )

            return ticket

    # =============================================
    # FALLBACK → LAST EMAIL DRAFT
    # =============================================

    latest_draft = pending_email_drafts.get(
        "latest"
    )

    if latest_draft:

        ticket = latest_draft.get(
            "ticket"
        )

        if ticket:

            print(
                "\nFOUND TICKET IN EMAIL MEMORY:\n",
                ticket
            )

            return ticket

    # =============================================
    # FALLBACK → LAST TICKET FROM DATABASE RESULT
    # =============================================

    for msg in reversed(history):

        text = ""

        if isinstance(msg, dict):

            text = msg.get(
                "text",
                ""
            )

        elif isinstance(msg, str):

            text = msg

        ticket_match = re.findall(

            r"TICK[- ]?\w+",

            text,

            re.IGNORECASE
        )

        if ticket_match:

            latest_ticket = ticket_match[-1]

            print(
                "\nFALLBACK HISTORY TICKET:\n",
                latest_ticket
            )

            return latest_ticket

    print(
        "\nNO ACTIVE TICKET FOUND"
    )

    return None

# =========================================================
# FETCH CUSTOMER EMAIL FROM DATABASE
# =========================================================

def fetch_customer_email(ticket_id):

    try:

        if not ticket_id:
            return None

        # =============================================
        # CONNECT SQLITE DATABASE
        # =============================================

        conn = sqlite3.connect(
            "conversadesk.db"
        )

        cursor = conn.cursor()

        # =============================================
        # FETCH CUSTOMER FIELD
        # =============================================

        cursor.execute(

            """

            SELECT customer
            FROM tickets
            WHERE ticket_code = ?

            """,

            (ticket_id,)
        )

        row = cursor.fetchone()

        conn.close()

        print(
            "\nEMAIL DB ROW:\n",
            row
        )

        if not row:
            return None

        customer_value = str(
            row[0]
        )

        print(
            "\nCUSTOMER VALUE:\n",
            customer_value
        )

        # =============================================
        # EXTRACT EMAIL INSIDE <>
        # =============================================

        email_match = re.search(

            r'<([^<>]+)>',

            customer_value
        )

        if email_match:

            extracted_email = (
                email_match.group(1)
                .strip()
            )

            print(
                "\nEXTRACTED EMAIL:\n",
                extracted_email
            )

            return extracted_email

        # =============================================
        # DIRECT EMAIL FALLBACK
        # =============================================

        direct_match = re.search(

            r'[\w\.-]+@[\w\.-]+\.\w+',

            customer_value
        )

        if direct_match:

            extracted_email = (
                direct_match.group(0)
                .strip()
            )

            print(
                "\nDIRECT EMAIL:\n",
                extracted_email
            )

            return extracted_email

        return None

    except Exception as e:

        print(
            "\nEMAIL FETCH ERROR:\n",
            str(e)
        )

        return None

# =========================================================
# BUILD CONVERSATION HISTORY
# =========================================================

def build_conversation_history(history):

    conversation_history = ""

    for msg in history[-12:]:

        role_name = (

            "Assistant"

            if msg["role"] == "ai"

            else "User"
        )

        conversation_history += f"""

{role_name}:
{msg["text"]}

"""

    return conversation_history

# =========================================================
# PARSE EMAIL CONTENT
# =========================================================

def parse_email_content(email_content):

    try:

        # =============================================
        # SUBJECT
        # =============================================

        subject_match = re.search(

            r"Subject:\s*(.+)",

            email_content
        )

        subject = (
            subject_match.group(1).strip()
            if subject_match
            else "Enterprise Support Update"
        )

        # =============================================
        # BODY
        # =============================================

        body_match = re.search(

            r"Message:\s*(.*)",

            email_content,

            re.DOTALL
        )

        body = (
            body_match.group(1).strip()
            if body_match
            else email_content
        )

        return {

            "subject": subject,

            "body": body
        }

    except Exception as e:

        print(
            "\nEMAIL PARSE ERROR:\n",
            str(e)
        )

        return None

# =========================================================
# MAIN CHAT PROCESSOR
# =========================================================

def process_chat(

    message,

    role,

    history
):

    try:

        # =================================================
        # EMAIL CONFIRMATION FLOW
        # =================================================

        if is_email_confirmation(message):

            pending_email = pending_email_drafts.get(
                "latest"
            )

            if not pending_email:

                return (
                    "❌ No pending email draft found."
                )

            recipient = pending_email.get(
                "recipient"
            )

            if not recipient:

                return (
                    "❌ Customer email address "
                    "not found in database."
                )

            try:

                print(
                    "\nSENDING EMAIL TO:\n",
                    recipient
                )

                print(
                    "\nEMAIL SUBJECT:\n",
                    pending_email["subject"]
                )

                print(
                    "\nEMAIL BODY:\n",
                    pending_email["body"]
                )

                # =========================================
                # SEND REAL EMAIL
                # =========================================

                send_gmail(

                    recipient,

                    pending_email["subject"],

                    pending_email["body"]
                )

                print(
                    "\nREAL EMAIL SENT"
                )

                sent_to = recipient

                pending_email_drafts.clear()

                return (

                    f"✅ Email sent successfully to "
                    f"{sent_to}"
                )

            except Exception as e:

                print(
                    "\nGMAIL SEND ERROR:\n",
                    str(e)
                )

                return (

                    f"❌ Failed to send email:\n"
                    f"{str(e)}"
                )

        # =========================
        # STEP 1 — SQL SEARCH
        # =========================

        sql_query = generate_sql(
            message
        )

        print(
            "\nSQL QUERY:\n",
            sql_query
        )

        db_result = []

        if is_safe_query(
            sql_query
        ):

            db_result = execute_sql(
                sql_query
            )

        print(
            "\nDATABASE RESULT:\n",
            db_result
        )

        # =========================
        # STEP 2 — RAG SEARCH
        # =========================

        rag_docs = search_rag(
            message
        )

        rag_context = ""

        if rag_docs:

            rag_context = "\n\n".join([

                doc.page_content

                for doc in rag_docs[:3]

            ])

        print(
            "\nRAG CONTEXT:\n",
            rag_context
        )

        # =========================
        # STEP 3 — MEMORY
        # =========================

        conversation_history = build_conversation_history(
            history
        )

        # =============================================
        # ACTIVE TICKET
        # =============================================

        active_ticket = get_active_ticket(
            history,
            message
        )

        print(
            "\nACTIVE TICKET:\n",
            active_ticket
        )

        # =============================================
        # CUSTOMER EMAIL
        # =============================================

        customer_email = fetch_customer_email(
            active_ticket
        )

        print(
            "\nCUSTOMER EMAIL:\n",
            customer_email
        )

        # =============================================
        # EMERGENCY EMAIL FALLBACK FROM DB RESULT
        # =============================================

        if not customer_email:

            db_result_text = str(
                db_result
            )

            email_match = re.search(

                r'[\w\.-]+@[\w\.-]+\.\w+',

                db_result_text
            )

            if email_match:

                customer_email = (
                    email_match.group(0)
                    .strip()
                )

                print(
                    "\nEMAIL FOUND IN DB RESULT:\n",
                    customer_email
                )

        # =========================
        # STEP 4 — PROMPT
        # =========================

        prompt = f"""

You are ConversaDesk AI.

You are an advanced Enterprise
Ticket Intelligence Assistant
and AI Customer Communication Copilot.

==================================================
YOUR RESPONSIBILITIES
==================================================

- Help enterprise employees
- Analyze tickets intelligently
- Generate ticket summaries
- Suggest professional resolutions
- Generate customer-ready email drafts
- Use RAG knowledge base
- Use ticket database intelligently
- Maintain conversational continuity

==================================================
EMAIL COPILOT RULES
==================================================

If employee asks to:
- send mail
- send email
- reply to customer
- draft email
- respond to customer

Then:

1. ONLY generate email draft
2. NEVER say email already sent
3. NEVER assume confirmation
4. ALWAYS wait for user confirmation
5. ALWAYS ask before sending
6. ALWAYS include customer email
7. If customer email exists use it properly

EMAIL FORMAT:

Customer Email:
{customer_email}

Subject:
<professional subject>

Message:
Dear Customer,

<professional email body>

Regards,
ConversaDesk Support Team

After email ALWAYS say EXACTLY:

Please confirm if you want me to send this email.

==================================================
IMPORTANT RULE
==================================================

If user asks to send mail:
- ONLY generate draft
- NEVER send automatically
- WAIT for confirmation

==================================================
SUGGESTED ACTIONS (CRITICAL)
==================================================

At the very end of your response, you MUST provide exactly 3 logical follow-up questions or actions the user might want to take next, based on the current context.
Format them EXACTLY like this on a new line:
---SUGGESTIONS---
[Suggestion 1] | [Suggestion 2] | [Suggestion 3]

Example:
---SUGGESTIONS---
Summarize recent emails | Check SLA for this ticket | Assign to IT Support

==================================================
CONVERSATION HISTORY
==================================================

{conversation_history}

==================================================
USER ROLE
==================================================

{role}

==================================================
ACTIVE TICKET
==================================================

{active_ticket}

==================================================
USER REQUEST
==================================================

{message}

==================================================
DATABASE RESULT
==================================================

{db_result}

==================================================
RAG KNOWLEDGE BASE
==================================================

{rag_context}

==================================================
FINAL INSTRUCTION
==================================================

Generate professional,
human-like enterprise response.

"""

        # =========================
        # STEP 5 — OPENAI RESPONSE
        # =========================

        response = client.chat.completions.create(

            model=os.getenv(
                "AZURE_OPENAI_DEPLOYMENT"
            ),

            messages=[

                {
                    "role": "system",
                    "content": prompt
                },

                {
                    "role": "user",
                    "content": message
                }
            ],

            temperature=0.4,

            max_tokens=1400
        )

        final_response = (

            response
            .choices[0]
            .message.content
        )

        # =================================================
        # SAVE EMAIL DRAFT
        # =================================================

        if is_email_request(message):

            parsed_email = parse_email_content(
                final_response
            )

            if parsed_email:

                pending_email_drafts["latest"] = {

                    "recipient": customer_email,

                    "subject": parsed_email["subject"],

                    "body": parsed_email["body"],

                    "ticket": active_ticket
                }

                print(
                    "\nEMAIL DRAFT SAVED:\n",
                    pending_email_drafts
                )

        return final_response

    except Exception as e:

        print(
            "\nCHAT ERROR:\n",
            str(e)
        )

        return (

            "❌ Unable to process "
            "your request right now."
        )