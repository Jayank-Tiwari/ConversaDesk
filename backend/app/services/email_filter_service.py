def is_support_email(subject, body):

    text = f"{subject} {body}".lower()

    support_keywords = [

        "issue",
        "problem",
        "help",
        "support",
        "error",
        "refund",
        "payment",
        "vpn",
        "bug",
        "unable",
        "not working",
        "failure",
        "ticket",
        "complaint",
        "access",
        "login",
        "password",
        "system",
        "leave",
        "invoice",
        "billing",
        "technical",
        "request"
    ]

    for keyword in support_keywords:

        if keyword in text:

            return True

    return False