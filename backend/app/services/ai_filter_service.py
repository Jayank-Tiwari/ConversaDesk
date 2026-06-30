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


def is_support_email(subject, body):

    prompt = f"""

You are an enterprise AI email classifier.

Determine whether this email is a REAL
customer support/service/helpdesk query.

Return ONLY:

YES
or
NO

Ignore:
- newsletters
- promotions
- OTP emails
- marketing emails
- social notifications
- advertisements
- spam

Customer Email:

Subject:
{subject}

Body:
{body}

"""

    response = client.chat.completions.create(

        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT"
        ),

        messages=[

            {
                "role": "system",
                "content":
                "You are an enterprise email classifier."
            },

            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0
    )

    answer = response.choices[0].message.content.strip()

    print("AI FILTER RESULT:", answer)

    return answer.upper() == "YES"