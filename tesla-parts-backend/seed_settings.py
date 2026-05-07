"""
Seed script to add default settings to the database using SQLModel
Run: python seed_settings.py
"""
from sqlmodel import Session, select
from database import engine
from models import Settings

def seed_settings():
    settings_data = [
        ('contact_phone', '+38 (067) 000-00-00'),
        ('contact_email', 'info@teslafix.com.ua'),
        ('footer_text', '© 2025 TeslaFix. Всі права захищені.'),
        ('footer_description', 'Ваш надійний партнер у світі запчастин для Tesla. Ми пропонуємо широкий асортимент оригінальних та якісних аналогів для всіх моделей Tesla.'),
        ('exchange_rate', '40.0'),
        ('instagram_link', 'https://instagram.com/teslafix'),
        ('telegram_link', 'https://t.me/teslafix'),
        ('viber_link', 'viber://chat?number=%2B380670000000'),
        ('whatsapp_link', 'https://wa.me/380670000000'),
    ]
    
    with Session(engine) as session:
        added_count = 0
        for key, value in settings_data:
            existing = session.get(Settings, key)
            if not existing:
                new_setting = Settings(key=key, value=value)
                session.add(new_setting)
                print(f"✓ Added setting: {key}")
                added_count += 1
            else:
                print(f"- Setting already exists: {key}")
        
        session.commit()
        print(f"\nSeeding complete! Added {added_count} new settings.")

if __name__ == "__main__":
    seed_settings()
