"""
Email Service using Resend
Sends invitation emails to team members and founders
"""

import os
import asyncio
import logging
import resend
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

logger = logging.getLogger(__name__)

# Configure Resend
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@startupintel.com")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend email service configured")
else:
    logger.warning("RESEND_API_KEY not set - emails will be logged but not sent")


async def send_email(to_email: str, subject: str, html_content: str) -> dict:
    """
    Send email using Resend (async non-blocking)
    """
    if not RESEND_API_KEY:
        logger.warning(f"Email not sent (no API key): {to_email} - {subject}")
        return {"status": "skipped", "reason": "No API key configured"}
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        # Run sync Resend SDK in thread to keep FastAPI non-blocking
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {email_response.get('id')}")
        return {
            "status": "success",
            "email_id": email_response.get("id"),
            "recipient": to_email
        }
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {
            "status": "failed",
            "error": str(e),
            "recipient": to_email
        }


def generate_team_invitation_email(
    recipient_name: str,
    workspace_name: str,
    invited_by: str,
    role: str,
    invitation_token: str
) -> str:
    """Generate HTML for team member invitation email"""
    invitation_link = f"{FRONTEND_URL}/accept-invitation?token={invitation_token}"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>You're Invited!</h1>
            </div>
            <div class="content">
                <p>Hi {recipient_name},</p>
                
                <p><strong>{invited_by}</strong> has invited you to join <strong>{workspace_name}</strong> as a <strong>{role}</strong>.</p>
                
                <p>Click the button below to accept your invitation and set up your account:</p>
                
                <center>
                    <a href="{invitation_link}" class="button">Accept Invitation</a>
                </center>
                
                <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:<br>
                {invitation_link}</p>
                
                <p>This invitation will expire in 14 days.</p>
                
                <p>Best regards,<br>The Startup Intel Team</p>
            </div>
            <div class="footer">
                <p>© 2026 Startup Intel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


def generate_founder_invitation_email(
    founder_name: str,
    startup_name: str,
    investor_name: str,
    invitation_token: str
) -> str:
    """Generate HTML for founder invitation email"""
    invitation_link = f"{FRONTEND_URL}/founder/onboarding?token={invitation_token}"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Startup Intel!</h1>
            </div>
            <div class="content">
                <p>Hi {founder_name},</p>
                
                <p><strong>{investor_name}</strong> has invited you to set up your workspace for <strong>{startup_name}</strong>.</p>
                
                <p>Startup Intel helps you:</p>
                <ul>
                    <li>Connect your data sources (accounting, CRM, etc.)</li>
                    <li>Auto-generate investor reports</li>
                    <li>Track metrics and share updates</li>
                    <li>Collaborate with your team</li>
                </ul>
                
                <p>Get started by completing your workspace setup:</p>
                
                <center>
                    <a href="{invitation_link}" class="button">Start Setup (10 min)</a>
                </center>
                
                <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:<br>
                {invitation_link}</p>
                
                <p>This invitation will expire in 30 days.</p>
                
                <p>Best regards,<br>The Startup Intel Team</p>
            </div>
            <div class="footer">
                <p>© 2026 Startup Intel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
