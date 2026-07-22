from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy import text, inspect
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models import Settings, User, Customer, Category, UserSession, ApiKey # Import Settings, User, Customer, Category, UserSession and ApiKey models
from auth import get_password_hash # Import password hashing utility

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
else:
    sqlite_file_name = "tesla_parts.db"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(base_dir, sqlite_file_name)
    sqlite_url = f"sqlite:///{sqlite_path}"
    connect_args = {"check_same_thread": False}
    engine = create_engine(sqlite_url, connect_args=connect_args)


def is_sqlite():
    return engine.url.drivername == "sqlite"

def create_db_and_tables():
    import time
    from sqlalchemy.exc import OperationalError
    
    # Retry database connection on startup to handle Docker DNS/container startup delays
    retries = 6
    for i in range(retries):
        try:
            SQLModel.metadata.create_all(engine)
            break
        except OperationalError as e:
            if i == retries - 1:
                print("Failed to connect to database after several retries. Exiting.")
                raise e
            print(f"Database connection failed (DNS/network delay), retrying in 2 seconds... ({e})")
            time.sleep(2)
    
    # Run manual migrations for existing tables
    _ensure_category_sort_order_column()
    _ensure_subcategory_sort_order_column()
    _ensure_product_cross_number_column()
    _ensure_category_seo_columns()
    _ensure_category_slug_column() # Run Category slug migration
    _ensure_product_sort_order_column()
    _ensure_product_subcategory_id_column()
    _ensure_product_created_at_column()
    _ensure_product_is_favourite_column()
    _ensure_customer_cart_data_column()
    _ensure_customer_discount_fields()
    _ensure_customer_email_hash_column()
    _ensure_customer_reset_token_columns()
    _ensure_order_customer_id_column()
    _ensure_customer_default_address_column()
    _ensure_order_comment_column()
    _migrate_existing_customers()
    _ensure_apikey_table()
    
    with Session(engine) as session:
        # Check if admin user exists, if not, create it
        admin_user = session.exec(select(User).where(User.username == "admin")).first()
        if not admin_user:
            hashed_password = get_password_hash("admin123") # Default password
            initial_admin_user = User(username="admin", hashed_password=hashed_password)
            session.add(initial_admin_user)
            session.commit()

def get_session():
    with Session(engine) as session:
        yield session

def _ensure_category_sort_order_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("category")]
    if "sort_order" not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE category ADD COLUMN sort_order INTEGER DEFAULT 0"))
            conn.commit()

def _ensure_product_cross_number_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("product")]
    if "cross_number" not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE product ADD COLUMN cross_number VARCHAR"))
            conn.commit()

def _ensure_category_seo_columns():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("category")]
    with engine.connect() as conn:
        if "meta_title" not in columns:
            conn.execute(text("ALTER TABLE category ADD COLUMN meta_title VARCHAR"))
        if "meta_description" not in columns:
            conn.execute(text("ALTER TABLE category ADD COLUMN meta_description VARCHAR"))
        conn.commit()

def _ensure_subcategory_sort_order_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("subcategory")]
    if "sort_order" not in columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE subcategory ADD COLUMN sort_order INTEGER DEFAULT 0"))
            conn.commit()

def _ensure_product_sort_order_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("product")]
    if "sort_order" not in columns:
        print("Adding 'sort_order' column to 'product' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE product ADD COLUMN sort_order INTEGER DEFAULT 0"))
            conn.commit()

def _ensure_product_subcategory_id_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("product")]
    if "subcategory_id" not in columns:
        print("Adding 'subcategory_id' column to 'product' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE product ADD COLUMN subcategory_id INTEGER"))
            conn.commit()

def _ensure_product_created_at_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("product")]
    if "created_at" not in columns:
        print("Adding 'created_at' column to 'product' table...")
        with engine.connect() as conn:
            # Different SQL for different DB types if needed, but SQLModel.metadata.create_all handles initial creation.
            # For migrations, we manually add it. Using a default timestamp for existing records.
            # SQLite and PostgreSQL both support this syntax for ADD COLUMN.
            if is_sqlite():
                conn.execute(text("ALTER TABLE product ADD COLUMN created_at DATETIME"))
            else:
                conn.execute(text("ALTER TABLE product ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
            conn.commit()

            # For SQLite, we might need a manual update for existing records if default wasn't set correctly in ALTER
            if is_sqlite():
                 from datetime import datetime
                 current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                 with engine.connect() as conn2:
                     conn2.execute(text(f"UPDATE product SET created_at = '{current_time}' WHERE created_at IS NULL"))
                     conn2.commit()

def _ensure_product_is_favourite_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("product")]
    if "is_favourite" not in columns:
        print("Adding 'is_favourite' column to 'product' table...")
        with engine.connect() as conn:
            if is_sqlite():
                conn.execute(text("ALTER TABLE product ADD COLUMN is_favourite INTEGER DEFAULT 0"))
                # Create index manually for SQLite
                try:
                    conn.execute(text("CREATE INDEX ix_product_is_favourite ON product (is_favourite)"))
                except Exception:
                    pass
            else:
                conn.execute(text("ALTER TABLE product ADD COLUMN is_favourite BOOLEAN DEFAULT FALSE"))
                # PostgreSQL usually handles index creation if defined in model, 
                # but since we are adding column manually:
                try:
                    conn.execute(text("CREATE INDEX ix_product_is_favourite ON product (is_favourite)"))
                except Exception:
                    pass
            conn.commit()

def _ensure_customer_cart_data_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("customer")]
    if "cart_data" not in columns:
        print("Adding 'cart_data' column to 'customer' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customer ADD COLUMN cart_data TEXT"))
            conn.commit()

def _ensure_customer_discount_fields():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("customer")]
    with engine.connect() as conn:
        if "discount_percent" not in columns:
            conn.execute(text("ALTER TABLE customer ADD COLUMN discount_percent FLOAT DEFAULT 0.0"))
        if "discount_type" not in columns:
            conn.execute(text("ALTER TABLE customer ADD COLUMN discount_type VARCHAR DEFAULT 'percent'"))
        if "discount_value" not in columns:
            conn.execute(text("ALTER TABLE customer ADD COLUMN discount_value FLOAT DEFAULT 0.0"))
        
        # Legacy migration: copy discount_percent -> discount_value if legacy discount exists and discount_value is zero/null
        try:
            conn.execute(text("UPDATE customer SET discount_type = 'percent', discount_value = discount_percent WHERE discount_percent > 0 AND (discount_value IS NULL OR discount_value = 0.0)"))
        except Exception as e:
            print(f"Skipping discount legacy migration: {e}")
        conn.commit()

def _ensure_category_slug_column():
    def _slugify(value: str) -> str:
        return (
            value.lower()
            .strip()
            .replace(" ", "-")
            .replace("/", "-")
        )

    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("category")]
    if "slug" not in columns:
        print("Adding 'slug' column to 'category' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE category ADD COLUMN slug VARCHAR DEFAULT ''"))
            conn.commit()
            
        # Update slugs for all existing categories
        with Session(engine) as session:
            categories = session.exec(select(Category)).all()
            for category in categories:
                category.slug = _slugify(category.name)
                session.add(category)
            session.commit()

def _ensure_customer_email_hash_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("customer")]
    if "email_hash" not in columns:
        print("Adding 'email_hash' column to 'customer' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customer ADD COLUMN email_hash VARCHAR"))
            conn.commit()
            try:
                conn.execute(text("CREATE UNIQUE INDEX ix_customer_email_hash ON customer (email_hash)"))
                conn.commit()
            except Exception as e:
                print(f"Skipping index creation or index already exists: {e}")

def _migrate_existing_customers():
    from services.crypto import encrypt_value, deterministic_hash
    with Session(engine) as session:
        # We query all customers
        customers = session.exec(select(Customer)).all()
        for customer in customers:
            # If email_hash is empty or None, it means the record is plain-text
            if not customer.email_hash:
                plain_email = customer.email
                customer.email_hash = deterministic_hash(plain_email)
                customer.email = encrypt_value(plain_email)
                if customer.first_name:
                    customer.first_name = encrypt_value(customer.first_name)
                if customer.last_name:
                    customer.last_name = encrypt_value(customer.last_name)
                if customer.phone:
                    customer.phone = encrypt_value(customer.phone)
                session.add(customer)
        session.commit()

def _ensure_order_customer_id_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("order")]
    if "customer_id" not in columns:
        print("Adding 'customer_id' column to 'order' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE \"order\" ADD COLUMN customer_id INTEGER"))
            conn.commit()

def _ensure_order_comment_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("order")]
    if "comment" not in columns:
        print("Adding 'comment' column to 'order' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE \"order\" ADD COLUMN comment TEXT"))
            conn.commit()

def _ensure_customer_reset_token_columns():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("customer")]
    with engine.connect() as conn:
        if "reset_token_hash" not in columns:
            print("Adding 'reset_token_hash' column to 'customer' table...")
            conn.execute(text("ALTER TABLE customer ADD COLUMN reset_token_hash VARCHAR"))
        if "reset_token_expires_at" not in columns:
            print("Adding 'reset_token_expires_at' column to 'customer' table...")
            if is_sqlite():
                conn.execute(text("ALTER TABLE customer ADD COLUMN reset_token_expires_at DATETIME"))
            else:
                conn.execute(text("ALTER TABLE customer ADD COLUMN reset_token_expires_at TIMESTAMP WITH TIME ZONE"))
        conn.commit()

def _ensure_customer_default_address_column():
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("customer")]
    if "default_address" not in columns:
        print("Adding 'default_address' column to 'customer' table...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customer ADD COLUMN default_address VARCHAR"))
            conn.commit()

def _ensure_apikey_table():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if "apikey" not in tables:
        print("Creating 'apikey' table...")
        ApiKey.__table__.create(engine)
