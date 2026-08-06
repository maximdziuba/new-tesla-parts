from fastapi import FastAPI, Response, Depends, HTTPException
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from database import create_db_and_tables, engine, get_session
from routers import products, orders, categories, settings, pages, auth, feeds, feedback, customers, promocodes, email_campaigns, partner, apikeys
from contextlib import asynccontextmanager
import os
from models import Product, Category, Subcategory, StaticPageSEO, Feedback
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
    "feedback": {
        "meta_title": "Відгуки клієнтів | TeslaFix",
        "meta_description": "Скріншоти відгуків наших задоволених клієнтів про запчастини та сервіс TeslaFix."
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
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]

frontend_url_env = os.getenv("FRONTEND_URL", "https://teslafix.com.ua")
for url in frontend_url_env.split(","):
    url = url.strip().rstrip("/")
    if url:
        origins.append(url)
        # Parse base domain to add www. and admin. subdomains dynamically
        from urllib.parse import urlparse
        parsed = urlparse(url)
        scheme = parsed.scheme
        netloc = parsed.netloc
        if scheme and netloc:
            if netloc.startswith("www."):
                base_domain = netloc[4:]
            else:
                base_domain = netloc
            origins.append(f"{scheme}://www.{base_domain}")
            origins.append(f"{scheme}://admin.{base_domain}")

# Remove duplicates
origins = list(set(origins))

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
app.include_router(feedback.router)
app.include_router(customers.router) # Include customers router
app.include_router(promocodes.router) # Include promocodes router
app.include_router(email_campaigns.router) # Include email_campaigns router
app.include_router(partner.router)
app.include_router(apikeys.router)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
        
    openapi_schema = get_openapi(
        title="TeslaFix Partner API",
        version="1.0.0",
        description="API для доступу до каталогу запчастин для сторонніх СТО.",
        routes=app.routes,
    )
    
    # Фільтруємо ендпоінти: залишаємо тільки Partner API
    filtered_paths = {}
    for path, path_item in openapi_schema.get("paths", {}).items():
        if path.startswith("/api/partner"):
            filtered_paths[path] = path_item
            
    openapi_schema["paths"] = filtered_paths
    
    # Фільтруємо схеми: залишаємо тільки ті, що використовуються в Partner API
    allowed_schemas = {"PaginatedPartnerResponse", "PartnerProductRead", "HTTPValidationError", "ValidationError"}
    if "components" in openapi_schema and "schemas" in openapi_schema["components"]:
        schemas = openapi_schema["components"]["schemas"]
        filtered_schemas = {k: v for k, v in schemas.items() if k in allowed_schemas}
        openapi_schema["components"]["schemas"] = filtered_schemas
        
    # Фільтруємо схеми авторизації: залишаємо тільки X-API-Key
    if "components" in openapi_schema and "securitySchemes" in openapi_schema["components"]:
        schemes = openapi_schema["components"]["securitySchemes"]
        filtered_schemes = {
            k: v for k, v in schemes.items() 
            if v.get("in") == "header" and v.get("name") == "X-API-Key"
        }
        openapi_schema["components"]["securitySchemes"] = filtered_schemes
        
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

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
    category_map = {c.id: c.slug for c in categories}
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

@app.get("/prom-ua.xml", response_class=Response, include_in_schema=False)
async def get_prom_ua_feed_root(session: Session = Depends(get_session)):
    from routers.feeds import get_prom_ua_feed
    return await get_prom_ua_feed(session)


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
