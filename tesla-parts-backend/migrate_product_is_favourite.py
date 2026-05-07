import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    # Default to local sqlite for development
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(base_dir, "tesla_parts.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"

def ensure_product_is_favourite_column(engine: Engine):
    inspector = inspect(engine)
    columns = inspector.get_columns("product")
    column_names = {col["name"] for col in columns}

    if "is_favourite" in column_names:
        print("Product table already has 'is_favourite' column.")
        return

    print("Adding 'is_favourite' column to 'product' table...")
    
    # SQLite doesn't support BOOLEAN natively (it uses INTEGER 0/1)
    # SQLModel/SQLAlchemy handles this mapping.
    # For SQLite, we use INTEGER DEFAULT 0.
    # For PostgreSQL, we use BOOLEAN DEFAULT FALSE.
    
    dialect = engine.dialect.name
    if dialect == "postgresql":
        stmt = 'ALTER TABLE "product" ADD COLUMN "is_favourite" BOOLEAN DEFAULT FALSE'
    else:
        stmt = 'ALTER TABLE "product" ADD COLUMN "is_favourite" INTEGER DEFAULT 0'

    with engine.begin() as conn:
        conn.execute(text(stmt))
        
        # Add index
        try:
            if dialect == "postgresql":
                conn.execute(text('CREATE INDEX "ix_product_is_favourite" ON "product" ("is_favourite")'))
            else:
                conn.execute(text('CREATE INDEX "ix_product_is_favourite" ON "product" ("is_favourite")'))
            print("Index on 'is_favourite' created.")
        except Exception as e:
            print(f"Note: Could not create index (it might already exist): {e}")

    print("'is_favourite' column ensured.")

def run_migration():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    ensure_product_is_favourite_column(engine)
    print("Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
