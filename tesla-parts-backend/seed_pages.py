"""
Seed script to add the required static pages to the database using SQLModel
Run: python seed_pages.py
"""
from sqlmodel import Session, select
from database import engine
from models import Page

def seed_pages():
    pages = [
        ('about', 'Про магазин', 'Ласкаво просимо до TeslaFix!...', True, 'footer'),
        ('delivery', 'Доставка та оплата', 'Інформація про доставку та оплату...', True, 'footer'),
        ('returns', 'Повернення та обмін', 'Умови повернення товару...', True, 'footer'),
        ('faq', 'Часті питання', 'Відповіді на популярні питання...', True, 'footer'),
        ('contacts', 'Контакти', 'Контактна інформація...', True, 'footer'),
    ]
    
    with Session(engine) as session:
        added_count = 0
        for slug, title, content, is_published, location in pages:
            existing = session.exec(select(Page).where(Page.slug == slug)).first()
            if not existing:
                new_page = Page(
                    slug=slug,
                    title=title,
                    content=content,
                    is_published=is_published,
                    location=location
                )
                session.add(new_page)
                print(f"✓ Added page: {slug}")
                added_count += 1
            else:
                print(f"- Page already exists: {slug}")
        
        session.commit()
        print(f"\nSeeding complete! Added {added_count} new pages.")

if __name__ == "__main__":
    seed_pages()
