import os

from dotenv import load_dotenv

from openai import AzureOpenAI


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


def analyze_email(subject, body):

    prompt = f"""

Analyze this enterprise support email.

SUBJECT:
{subject}

BODY:
{body}

Return ONLY JSON:

{{
    "department": "",
    "priority": "",
    "sentiment": "",
    "summary": "",
    "issue_type": ""
}}

"""

    response = client.chat.completions.create(

        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT"
        ),

        messages=[

            {
                "role": "system",
                "content":
                "You are an enterprise support AI."
            },

            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.2
    )

    return response.choices[0].message.content


def generate_email_reply(query, context):

    prompt = f"""

You are an enterprise AI customer support assistant
for ConversaDesk AI.

Generate a short professional email reply.

Customer Query:
{query}

Retrieved Context:
{context}

Rules:

- Be concise
- Be professional
- Do not copy context directly
- If context insufficient,
  escalate politely

"""

    response = client.chat.completions.create(

        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT"
        ),

        messages=[

            {
                "role": "system",
                "content":
                "You are an enterprise support AI."
            },

            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.3
    )

    return response.choices[0].message.content