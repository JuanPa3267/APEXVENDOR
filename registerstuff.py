"""Registration helpers: username generator and HTML email sender."""

from string import Template
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

import random
import string
import hashlib

load_dotenv()
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587


def username_gen(name: str = "user", base: str = "p", length: int = 8) -> str:
    """Generate a pseudo-unique username token.

    The format is: "{base}-{name}-{hashprefix}".
    """
    random_str = ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=16))
    hash_str = hashlib.sha256(random_str.encode()).hexdigest()
    return f"{base}-{name}-{hash_str[:length]}"

def send_html_email(to, subject, template_path, context):
    """Send an HTML email using a template and context values."""
    SMTP_USERNAME = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    with open(template_path, 'r', encoding='utf-8') as f:
        html_template = Template(f.read())

    html_content = html_template.safe_substitute(context)

    msg = MIMEMultipart('alternative')
    msg['From'] = SMTP_USERNAME
    msg['To'] = to
    msg['Subject'] = subject

    part = MIMEText(html_content, 'html')
    msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending HTML email: {e}")
        return False
