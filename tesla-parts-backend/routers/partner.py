from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Security
from fastapi.security.api_key import APIKeyHeader
from sqlmodel import Session, select, func
from typing import List, Dict
from datetime import datetime, timedelta
import collections

from database import engine
from models import Product, ApiKey
from schemas import PartnerProductRead
from auth import verify_password
from zoneinfo import ZoneInfo

router = APIRouter(prefix="/api/partner", tags=["partner"])

# In-memory dictionary for Rate Limiting: { api_key_id: deque([timestamp1, timestamp2, ...]) }
rate_limits: Dict[int, collections.deque] = collections.defaultdict(collections.deque)

def get_kyiv_time():
    return datetime.now(ZoneInfo("Europe/Kyiv")).replace(tzinfo=None)

def increment_api_key_usage(api_key_id: int):
    # This runs in background, open new session manually since Depends won't work in background task
    with Session(engine) as session:
        api_key = session.get(ApiKey, api_key_id)
        if api_key:
            # Check if we need to reset month
            now = get_kyiv_time()
            if api_key.last_reset_date.month != now.month or api_key.last_reset_date.year != now.year:
                api_key.requests_this_month = 0
                api_key.last_reset_date = now
            
            api_key.requests_this_month += 1
            session.add(api_key)
            session.commit()

# Need to import get_session for normal dependencies
from database import get_session

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False, description="Ключ доступу до Partner API")

@router.get(
    "/products", 
    response_model=List[PartnerProductRead],
    summary="Отримати каталог товарів (Partner API)",
    description="""
Отримує повний список товарів із вказанням актуальної наявності та цін з урахуванням персональної знижки СТО.

Для виконання запиту необхідно передати ваш ключ у заголовку `X-API-Key`.
Авторизуватись в Swagger UI можна, натиснувши кнопку **Authorize** (або замок) та ввівши ключ.

**Обмеження (Rate Limit):**
Максимум 3 запити на 10 хвилин для одного ключа.
    """,
    responses={
        200: {"description": "Успішна відповідь зі списком товарів"},
        401: {"description": "Відсутній або невірний API ключ"},
        429: {"description": "Перевищено ліміт запитів (3 на 10 хвилин)"}
    }
)
async def get_partner_products(
    background_tasks: BackgroundTasks,
    x_api_key: str = Security(api_key_header),
    session: Session = Depends(get_session)
):
    if not x_api_key or "." not in x_api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key format")
    
    prefix, secret = x_api_key.split(".", 1)
    
    # Lookup ApiKey by prefix
    api_key = session.exec(select(ApiKey).where(ApiKey.key_prefix == prefix)).first()
    
    if not api_key or not api_key.is_active:
        raise HTTPException(status_code=401, detail="Invalid or inactive API Key")
        
    # Verify the secret against hashed_key
    if not verify_password(secret, api_key.hashed_key):
        raise HTTPException(status_code=401, detail="Invalid API Key")
        
    # Rate Limiting check (3 per 10 minutes)
    now = get_kyiv_time()
    ten_minutes_ago = now - timedelta(minutes=10)
    
    # Clean up old timestamps for this key
    timestamps = rate_limits[api_key.id]
    while timestamps and timestamps[0] < ten_minutes_ago:
        timestamps.popleft()
        
    if len(timestamps) >= 3:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Maximum 3 requests per 10 minutes.")
        
    timestamps.append(now)
    
    # Schedule background task to increment DB counter
    background_tasks.add_task(increment_api_key_usage, api_key.id)
    
    # Fetch products
    products = session.exec(
        select(Product)
        .order_by(Product.sort_order.desc(), Product.created_at.desc())
    ).all()
    
    items = []
    discount = api_key.discount_percent / 100.0
    for p in products:
        discounted = p.priceUAH * (1 - discount)
        items.append(PartnerProductRead(
            id=p.id,
            name=p.name,
            priceUAH=p.priceUAH,
            discountedPriceUAH=discounted,
            inStock=p.inStock,
            image=p.image
        ))
        
    return items
