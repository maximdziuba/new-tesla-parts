import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class EmailService:
    def __init__(self):
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

    def send_verification_email(self, to_email: str, token: str):
        if not self.smtp_email or not self.smtp_password:
            print("SMTP credentials not set. Skipping verification email.")
            # For development purposes, print the link to console
            print(f"VERIFICATION LINK: {self.frontend_url}/verify?token={token}")
            return False

        verification_link = f"{self.frontend_url}/verify?token={token}"
        
        message = MIMEMultipart("alternative")
        message["Subject"] = "Підтвердження реєстрації - TeslaFix"
        message["From"] = f"TeslaFix <{self.smtp_email}>"
        message["To"] = to_email

        html = f"""
        <html>
        <body>
            <h2>Вітаємо в TeslaFix!</h2>
            <p>Дякуємо за реєстрацію. Будь ласка, підтвердіть вашу електронну адресу та встановіть пароль, перейшовши за посиланням нижче:</p>
            <p><a href="{verification_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Підтвердити реєстрацію</a></p>
            <p>Якщо кнопка не працює, скопіюйте та вставте це посилання у ваш браузер:</p>
            <p>{verification_link}</p>
            <p>Посилання дійсне протягом 24 годин.</p>
        </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_email, self.smtp_password)
                server.sendmail(self.smtp_email, to_email, message.as_string())
            print(f"Verification email sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def send_password_reset_email(self, to_email: str, token: str):
        if not self.smtp_email or not self.smtp_password:
            print("SMTP credentials not set. Skipping password reset email.")
            # For development purposes, print the link to console
            print(f"PASSWORD RESET LINK: {self.frontend_url}/reset-password?token={token}")
            return False

        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        
        message = MIMEMultipart("alternative")
        message["Subject"] = "Відновлення паролю - TeslaFix"
        message["From"] = f"TeslaFix <{self.smtp_email}>"
        message["To"] = to_email

        html = f"""
        <html>
        <body>
            <h2>Відновлення паролю на TeslaFix</h2>
            <p>Ви отримали цей лист, тому що зробили запит на відновлення паролю для вашого акаунта.</p>
            <p>Будь ласка, перейдіть за посиланням нижче, щоб встановити новий пароль:</p>
            <p><a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Відновити пароль</a></p>
            <p>Якщо кнопка не працює, скопіюйте та вставте це посилання у ваш браузер:</p>
            <p>{reset_link}</p>
            <p>Це посилання дійсне протягом 15 хвилин.</p>
            <p>Якщо ви не робили цього запиту, просто проігноруйте цей лист.</p>
        </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_email, self.smtp_password)
                server.sendmail(self.smtp_email, to_email, message.as_string())
            print(f"Password reset email sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
            return False

    def send_custom_email(self, to_email: str, subject: str, body: str) -> bool:
        if not self.smtp_email or not self.smtp_password:
            print("SMTP credentials not set. Skipping custom email.")
            print(f"EMAIL TO: {to_email}\nSUBJECT: {subject}\nBODY:\n{body}\n")
            return True # Return true so flow doesn't crash on dev setup without SMTP credentials

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"TeslaFix <{self.smtp_email}>"
        message["To"] = to_email

        part = MIMEText(body, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_email, self.smtp_password)
                server.sendmail(self.smtp_email, to_email, message.as_string())
            print(f"Custom email sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

email_service = EmailService()
