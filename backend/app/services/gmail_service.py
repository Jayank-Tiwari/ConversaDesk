import os.path
import base64

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [

    "https://www.googleapis.com/auth/gmail.readonly",

    "https://www.googleapis.com/auth/gmail.send"
]


def get_gmail_service():

    creds = None

    token_path = "app/token.json"

    credentials_path = "app/credentials.json"

    # Load existing token
    if os.path.exists(token_path):

        creds = Credentials.from_authorized_user_file(
            token_path,
            SCOPES
        )

    # Login if token invalid
    if not creds or not creds.valid:

        if creds and creds.expired and creds.refresh_token:

            creds.refresh(Request())

        else:

            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path,
                SCOPES
            )

            creds = flow.run_local_server(port=0)

        # Save token
        with open(token_path, "w") as token:

            token.write(creds.to_json())

    service = build(
        "gmail",
        "v1",
        credentials=creds
    )

    return service


def fetch_emails():

    service = get_gmail_service()

    results = service.users().messages().list(
        userId="me",
        labelIds=["INBOX"],
        maxResults=10
    ).execute()

    messages = results.get("messages", [])

    email_data = []

    for msg in messages:

        txt = service.users().messages().get(
            userId="me",
            id=msg["id"]
        ).execute()

        payload = txt.get("payload", {})

        headers = payload.get("headers", [])

        subject = ""

        sender = ""

        body = ""

        # Extract headers
        for header in headers:

            if header["name"] == "Subject":

                subject = header["value"]

            if header["name"] == "From":

                sender = header["value"]

        # Extract body safely
        parts = payload.get("parts")

        if parts:

            for part in parts:

                data = part.get("body", {}).get("data")

                if data:

                    try:

                        body = base64.urlsafe_b64decode(
                            data
                        ).decode("utf-8")

                    except Exception as e:

                        print("BODY ERROR:", str(e))

                        body = "Unable to decode body"

                    break

        else:

            data = payload.get("body", {}).get("data")

            if data:

                try:

                    body = base64.urlsafe_b64decode(
                        data
                    ).decode("utf-8")

                except Exception as e:

                    print("BODY ERROR:", str(e))

                    body = "Unable to decode body"

        email_object = {

            "gmail_id": msg["id"],

            "subject": subject,

            "sender": sender,

            "body": body,
        }

        print("FETCHED EMAIL:", email_object)

        email_data.append(email_object)

    return email_data