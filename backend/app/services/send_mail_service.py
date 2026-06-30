import base64

from email.mime.multipart import MIMEMultipart

from email.mime.text import MIMEText

from app.services.gmail_service import (
    get_gmail_service
)


def send_gmail(
    to,
    subject,
    body
):

    service = get_gmail_service()

    # =========================================
    # BEAUTIFUL HTML EMAIL TEMPLATE
    # =========================================

    html_template = f"""
    <!DOCTYPE html>

    <html>

    <body
        style="
            margin:0;
            padding:0;
            background:#f4f7fb;
            font-family:
                Arial,
                sans-serif;
        "
    >

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
                padding:
                40px 12px;
            "
        >

            <tr>

                <td align="center">

                    <!-- MAIN CARD -->
                    <table
                        width="620"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background:#ffffff;

                            border-radius:18px;

                            overflow:hidden;

                            box-shadow:
                            0 6px 24px
                            rgba(15,23,42,0.08);
                        "
                    >

                        <!-- HEADER -->
                        <tr>

                            <td
                                style="
                                    background:
                                    linear-gradient(
                                        135deg,
                                        #6366f1,
                                        #8b5cf6
                                    );

                                    padding:
                                    30px 36px;
                                "
                            >

                                <h1
                                    style="
                                        color:white;

                                        margin:0;

                                        font-size:30px;

                                        font-weight:700;
                                    "
                                >
                                    ConversaDesk AI
                                </h1>

                                <p
                                    style="
                                        color:
                                        rgba(
                                            255,
                                            255,
                                            255,
                                            0.9
                                        );

                                        margin-top:8px;

                                        font-size:14px;
                                    "
                                >
                                    Enterprise Ticket Intelligence
                                </p>

                            </td>

                        </tr>

                        <!-- BODY -->
                        <tr>

                            <td
                                style="
                                    padding:
                                    42px 38px;

                                    color:#1e293b;

                                    font-size:15px;

                                    line-height:1.9;
                                "
                            >

                                {body.replace(chr(10), '<br>')}

                            </td>

                        </tr>

                        <!-- SUPPORT BOX -->
                        <tr>

                            <td
                                style="
                                    padding:
                                    0 38px 30px 38px;
                                "
                            >

                                <div
                                    style="
                                        background:
                                        #f8fafc;

                                        border:
                                        1px solid #e2e8f0;

                                        border-radius:
                                        14px;

                                        padding:
                                        20px;
                                    "
                                >

                                    <h3
                                        style="
                                            margin-top:0;

                                            color:#0f172a;

                                            font-size:16px;
                                        "
                                    >
                                        Enterprise Support
                                    </h3>

                                    <p
                                        style="
                                            margin:0;

                                            color:#64748b;

                                            font-size:14px;

                                            line-height:1.7;
                                        "
                                    >
                                        Our AI-powered support
                                        operations team continuously
                                        monitors enterprise tickets,
                                        escalations and customer
                                        communication workflows.
                                    </p>

                                </div>

                            </td>

                        </tr>

                        <!-- CTA BUTTON -->
                        <tr>

                            <td
                                align="center"
                                style="
                                    padding-bottom:
                                    36px;
                                "
                            >

                                <a
                                    href="#"

                                    style="
                                        display:inline-block;

                                        background:
                                        linear-gradient(
                                            135deg,
                                            #6366f1,
                                            #8b5cf6
                                        );

                                        color:white;

                                        text-decoration:none;

                                        padding:
                                        14px 30px;

                                        border-radius:
                                        999px;

                                        font-size:14px;

                                        font-weight:600;
                                    "
                                >
                                    Contact Support
                                </a>

                            </td>

                        </tr>

                        <!-- FOOTER -->
                        <tr>

                            <td
                                style="
                                    background:#f8fafc;

                                    border-top:
                                    1px solid #e2e8f0;

                                    padding:
                                    26px;

                                    text-align:center;
                                "
                            >

                                <p
                                    style="
                                        margin:0;

                                        color:#334155;

                                        font-size:13px;

                                        font-weight:600;
                                    "
                                >
                                    ConversaDesk AI
                                </p>

                                <p
                                    style="
                                        margin-top:8px;

                                        color:#94a3b8;

                                        font-size:12px;

                                        line-height:1.7;
                                    "
                                >
                                    Intelligent enterprise support
                                    and ticket management platform.
                                </p>

                                <p
                                    style="
                                        margin-top:16px;

                                        color:#cbd5e1;

                                        font-size:11px;
                                    "
                                >
                                    © 2026 ConversaDesk AI.
                                    All rights reserved.
                                </p>

                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

        </table>

    </body>

    </html>
    """

    # =========================================
    # CREATE EMAIL MESSAGE
    # =========================================

    message = MIMEMultipart()

    message["to"] = to

    message["subject"] = subject

    # HTML PART ONLY
    html_part = MIMEText(

        html_template,

        "html"
    )

    message.attach(
        html_part
    )

    # =========================================
    # ENCODE MESSAGE
    # =========================================

    raw = base64.urlsafe_b64encode(

        message.as_bytes()

    ).decode()

    send_message = {

        "raw": raw
    }

    # =========================================
    # SEND EMAIL
    # =========================================

    service.users().messages().send(

        userId="me",

        body=send_message

    ).execute()

    print(
        "BEAUTIFUL HTML EMAIL SENT"
    )