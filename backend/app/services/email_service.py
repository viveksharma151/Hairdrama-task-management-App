import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email via Gmail SMTP. Returns True on success."""
    sender = os.environ.get("GMAIL_SENDER_EMAIL")
    password = os.environ.get("GMAIL_APP_PASSWORD")

    if not sender or not password:
        logger.warning("Email credentials not configured — skipping email send")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Hairdrama Tasks <{sender}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_task_assigned_email(
    to_email: str,
    assignee_name: str,
    task_title: str,
    task_description: str,
    creator_name: str,
    task_id: str,
    frontend_url: str,
) -> bool:
    """Send notification when a task is assigned to a user."""
    subject = f"📋 New Task Assigned: {task_title}"
    task_url = f"{frontend_url}/tasks/{task_id}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d5a;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700;">📋 New Task Assigned</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #a5b4fc; font-size: 16px; margin-top: 0;">Hi {assignee_name},</p>
          <p style="color: #e2e8f0;">You have been assigned a new task by <strong style="color: #a5b4fc;">{creator_name}</strong>.</p>
          <div style="background: #0f0f1a; border: 1px solid #2d2d5a; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h2 style="margin: 0 0 8px; color: #fff; font-size: 18px;">{task_title}</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">{task_description or 'No description provided.'}</p>
          </div>
          <div style="text-align: center; margin-top: 32px;">
            <a href="{task_url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Task →</a>
          </div>
        </div>
        <div style="border-top: 1px solid #2d2d5a; padding: 16px 32px; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">Hairdrama Task Manager · You received this because a task was assigned to you.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return _send_email(to_email, subject, html)


def send_task_completed_email(
    to_email: str,
    creator_name: str,
    task_title: str,
    completer_name: str,
    task_id: str,
    frontend_url: str,
) -> bool:
    """Send notification when a task is marked as completed."""
    subject = f"✅ Task Completed: {task_title}"
    task_url = f"{frontend_url}/tasks/{task_id}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d5a;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700;">✅ Task Completed!</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #6ee7b7; font-size: 16px; margin-top: 0;">Hi {creator_name},</p>
          <p style="color: #e2e8f0;">Great news! Your task has been marked as <strong style="color: #10b981;">completed</strong> by <strong style="color: #6ee7b7;">{completer_name}</strong>.</p>
          <div style="background: #0f0f1a; border: 1px solid #2d2d5a; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h2 style="margin: 0; color: #fff; font-size: 18px;">{task_title}</h2>
          </div>
          <div style="text-align: center; margin-top: 32px;">
            <a href="{task_url}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Task →</a>
          </div>
        </div>
        <div style="border-top: 1px solid #2d2d5a; padding: 16px 32px; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">Hairdrama Task Manager · You received this because you created this task.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return _send_email(to_email, subject, html)
