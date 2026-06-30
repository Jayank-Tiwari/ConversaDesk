import os
import re

from dotenv import load_dotenv

from sqlalchemy import text

from openai import AzureOpenAI

from app.database import engine


load_dotenv()


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


# =========================================
# SAFE SQL EXECUTION
# =========================================

def execute_sql(query):

    try:

        # AUTO COMMIT TRANSACTION
        with engine.begin() as conn:

            result = conn.execute(
                text(query)
            )

            # SELECT QUERY
            if query.strip().lower().startswith(
                "select"
            ):

                rows = result.fetchall()

                return [

                    dict(row._mapping)

                    for row in rows
                ]

            # UPDATE / INSERT / DELETE
            return {

                "message":
                "Database updated successfully"
            }

    except Exception as e:

        print(
            "\nSQL EXECUTION ERROR:\n",
            str(e)
        )

        return {

            "error":
            str(e)
        }


# =========================================
# STRICT SQL SAFETY CHECK
# =========================================

def is_safe_query(query):

    lower_query = query.lower()

    dangerous_keywords = [

        "drop",

        "truncate",

        "alter",

        "grant",

        "revoke",

        "pragma"
    ]

    # BLOCK DANGEROUS QUERIES
    if any(

        keyword in lower_query

        for keyword in dangerous_keywords
    ):

        return False

    # BLOCK UPDATE WITHOUT WHERE
    if (

        "update" in lower_query

        and "where" not in lower_query
    ):

        return False

    # BLOCK DELETE WITHOUT WHERE
    if (

        "delete" in lower_query

        and "where" not in lower_query
    ):

        return False

    return True


# =========================================
# GENERATE SQL
# =========================================

def generate_sql(user_message):

    schema = """

TABLE: tickets

Columns:

id
ticket_code
customer
department
priority
status
sentiment
description
summary
created_date
sla
created_by

"""

    prompt = f"""

You are an Enterprise SQLite SQL Generator.

You ONLY generate SAFE enterprise ticket queries.

==================================================
STRICT RULES
==================================================

1. Return ONLY SQL
2. No markdown
3. No explanations
4. SQLite syntax only

5. NEVER generate:
- DROP
- DELETE without WHERE
- TRUNCATE
- ALTER
- PRAGMA
- GRANT
- REVOKE

6. NEVER UPDATE ALL ROWS.

7. UPDATE queries MUST ALWAYS contain:
- WHERE clause
AND
- ticket_code
OR
- id

8. NEVER generate UPDATE without WHERE.

9. If ticket ID is missing for update:
RETURN:

SELECT 'MISSING_TICKET_ID';

10. If request is unrelated:
RETURN:

SELECT 'OUT_OF_SCOPE';

==================================================
VALID DEPARTMENTS
==================================================

- IT
- Finance
- Billing
- HR
- Operations
- Others

==================================================
VALID PRIORITIES
==================================================

- Low
- Medium
- High
- Critical

==================================================
VALID STATUSES
==================================================

- Open
- In Progress
- Resolved
- Closed

==================================================
IMPORTANT UPDATE RULES
==================================================

EXAMPLE 1

User:
change priority of TICK-19e24c to low

SQL:

UPDATE tickets
SET priority='Low'
WHERE LOWER(ticket_code)
LIKE LOWER('%tick-19e24c%');

--------------------------------------------------

EXAMPLE 2

User:
mark TICK-19e24c resolved

SQL:

UPDATE tickets
SET status='Resolved'
WHERE LOWER(ticket_code)
LIKE LOWER('%tick-19e24c%');

--------------------------------------------------

EXAMPLE 3

User:
change department of TICK-19e24c to Finance

SQL:

UPDATE tickets
SET department='Finance'
WHERE LOWER(ticket_code)
LIKE LOWER('%tick-19e24c%');

==================================================
SEARCH RULES
==================================================

ALWAYS use:

LOWER(column)
LIKE LOWER('%value%')

for:
- department
- priority
- status
- customer
- ticket_code
- sentiment
- description
- summary

==================================================
SUMMARY RULES
==================================================

If user asks:
- summarize ticket
- explain ticket
- tell about ticket

then SELECT:
- description
- summary
- priority
- department
- status
- sentiment

==================================================
ANALYTICS RULES
==================================================

For count queries:

SELECT COUNT(*) as total_tickets
FROM tickets;

==================================================
OUT OF SCOPE RULES
==================================================

If user asks:
- sports
- politics
- movies
- entertainment
- coding tutorials
- personal advice
- random knowledge

RETURN:

SELECT 'OUT_OF_SCOPE';

==================================================
DATABASE SCHEMA
==================================================

{schema}

==================================================
USER REQUEST
==================================================

{user_message}

==================================================
FINAL INSTRUCTION
==================================================

Generate SAFE SQLite query ONLY.

"""

    response = client.chat.completions.create(

        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT"
        ),

        messages=[

            {
                "role": "system",

                "content": prompt
            }
        ],

        temperature=0
    )

    sql_query = (

        response
        .choices[0]
        .message.content
        .strip()
    )

    # REMOVE MARKDOWN
    sql_query = re.sub(

        r"```sql|```",

        "",

        sql_query
    ).strip()

    print(
        "\nGENERATED SQL:\n",
        sql_query
    )

    return sql_query