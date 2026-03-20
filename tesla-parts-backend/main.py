from fastapi import FastAPI, Response, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from database import create_db_and_tables, engine, get_session
from routers import products, orders, categories, settings, pages, auth, feeds # Import auth and feeds routers
from contextlib import asynccontextmanager
import os
from models import Product, Category, StaticPageSEO
from schemas import StaticPageSEORead, StaticPageSEOUpdate
from dependencies import get_current_admin

DEFAULT_STATIC_SEO = {
    "home": {
        "meta_title": "TeslaFix | Магазин запчастин для Tesla",
        "meta_description": "Купуйте оригінальні та перевірені запчастини для Tesla з доставкою по Україні."
    },
    "about": {
        "meta_title": "Про TeslaFix",
        "meta_description": "Дізнайтеся більше про команду TeslaFix та наш підхід до сервісу."
    },
    "delivery": {
        "meta_title": "Доставка та оплата | TeslaFix",
        "meta_description": "Інформація про варіанти доставки та оплати у TeslaFix."
    },
    "returns": {
        "meta_title": "Повернення та гарантія | TeslaFix",
        "meta_description": "Правила повернення товарів та гарантійні умови інтернет-магазину TeslaFix."
    },
    "faq": {
        "meta_title": "Часті питання | TeslaFix",
        "meta_description": "Відповіді на популярні питання клієнтів TeslaFix."
    },
    "contacts": {
        "meta_title": "Контакти TeslaFix",
        "meta_description": "Зв’яжіться з нами для консультації або замовлення запчастин."
    },
    "search": {
        "meta_title": "Пошук запчастин | TeslaFix",
        "meta_description": "Знайдіть необхідні запчастини для вашої Tesla у нашому каталозі."
    },
}

def ensure_static_seo_records():
    with Session(engine) as session:
        for slug, defaults in DEFAULT_STATIC_SEO.items():
            existing = session.exec(
                select(StaticPageSEO).where(StaticPageSEO.slug == slug)
            ).first()
            if not existing:
                session.add(
                    StaticPageSEO(
                        slug=slug,
                        meta_title=defaults.get("meta_title"),
                        meta_description=defaults.get("meta_description"),
                    )
                )
        session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    ensure_static_seo_records()
    yield

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS Configuration
# Add your production frontend URLs here
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://teslafix.com.ua",
    "https://www.teslafix.com.ua",
    "https://admin.teslafix.com.ua",
]

# Add frontend URL from environment variable if set
frontend_url_env = os.getenv("FRONTEND_URL")
if frontend_url_env:
    for url in frontend_url_env.split(","):
        url = url.strip()
        if url:
            origins.append(url)
            # Also add with trailing slash
            origins.append(url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(categories.router)
app.include_router(settings.router)
app.include_router(pages.router)
app.include_router(auth.router) # Include auth router
app.include_router(feeds.router) # Include feeds router

@app.get("/")
def read_root():
    return {"message": "TeslaFix API is running"}

def _slugify(value: str) -> str:
    return (
        value.lower()
        .strip()
        .replace(" ", "-")
        .replace("/", "-")
    )

@app.get("/sitemap.xml", response_class=Response)
def get_sitemap():
    base_url = os.getenv("FRONTEND_URL", "https://teslafix.com.ua").rstrip("/")
    with Session(engine) as session:
        products = session.exec(select(Product)).all()
        # Load categories with subcategories
        categories = session.exec(select(Category)).all()
        subcategories = session.exec(select(Subcategory)).all()

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Home page
    xml_parts.append(f'<url><loc>{base_url}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>')

    # Categories
    category_map = {c.id: _slugify(c.name) for c in categories}
    for category in categories:
        slug = category_map.get(category.id)
        if slug:
            xml_parts.append(f'<url><loc>{base_url}/category/{slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')

    # Subcategories
    for sub in subcategories:
        cat_slug = category_map.get(sub.category_id)
        if cat_slug:
            xml_parts.append(f'<url><loc>{base_url}/category/{cat_slug}/sub/{sub.id}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>')

    # Products
    for product in products:
        xml_parts.append(f'<url><loc>{base_url}/product/{product.id}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>')

    xml_parts.append("</urlset>")

    return Response(content="".join(xml_parts), media_type="application/xml")

@app.get("/seo/static", response_model=List[StaticPageSEORead])
def get_static_seo_records(session: Session = Depends(get_session)):
    return session.exec(select(StaticPageSEO)).all()

@app.get("/seo/static/{slug}", response_model=StaticPageSEORead)
def get_static_seo_record(slug: str, session: Session = Depends(get_session)):
    record = session.exec(
        select(StaticPageSEO).where(StaticPageSEO.slug == slug)
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="SEO record not found")
    return record

@app.put(
    "/seo/static/{slug}",
    response_model=StaticPageSEORead,
    dependencies=[Depends(get_current_admin)],
)
def update_static_seo_record(
    slug: str,
    payload: StaticPageSEOUpdate,
    session: Session = Depends(get_session),
):
    record = session.exec(
        select(StaticPageSEO).where(StaticPageSEO.slug == slug)
    ).first()
    if not record:
        record = StaticPageSEO(slug=slug)
        session.add(record)
        session.commit()
        session.refresh(record)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    session.add(record)
    session.commit()
    session.refresh(record)
    return record
