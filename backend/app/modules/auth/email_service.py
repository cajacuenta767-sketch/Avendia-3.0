import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _send_reset_email(recipient: str, code: str) -> None:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from_email:
        raise RuntimeError("SMTP is not configured")

    message = EmailMessage()
    message["Subject"] = "Código para recuperar tu cuenta de Avendia"
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = recipient
    message.set_content(
        "Tu código de recuperación de Avendia es "
        f"{code}. Caduca en {settings.password_reset_expire_minutes} minutos. "
        "Si no solicitaste este cambio, ignora este mensaje."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as client:
        if settings.smtp_use_tls:
            client.starttls()
        if settings.smtp_username and settings.smtp_password:
            client.login(settings.smtp_username, settings.smtp_password.get_secret_value())
        client.send_message(message)


async def send_password_reset_email(recipient: str, code: str) -> bool:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from_email:
        return False
    try:
        await asyncio.to_thread(_send_reset_email, recipient, code)
        return True
    except Exception:
        logger.exception("Password reset email could not be sent")
        return False
