import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///tesla_parts.db")

def ensure_customer_columns(engine: Engine):
    inspector = inspect(engine)
    columns = inspector.get_columns("customer")
    column_names = {col["name"] for col in columns}

    statements = []
    if "first_name" not in column_names:
        statements.append('ALTER TABLE "customer" ADD COLUMN "first_name" VARCHAR')
    if "last_name" not in column_names:
        statements.append('ALTER TABLE "customer" ADD COLUMN "last_name" VARCHAR')
    if "phone" not in column_names:
        statements.append('ALTER TABLE "customer" ADD COLUMN "phone" VARCHAR')

    if not statements:
        print("Customer table already has the new columns.")
        return

    with engine.begin() as conn:
        for stmt in statements:
            print(f"Executing: {stmt}")
            conn.execute(text(stmt))
    print("Customer columns ensured.")

def ensure_order_customer_id_column(engine: Engine):
    inspector = inspect(engine)
    columns = inspector.get_columns("order")
    column_names = {col["name"] for col in columns}

    if "customer_id" in column_names:
        print('Order table already has "customer_id" column.')
        return

    stmt = 'ALTER TABLE "order" ADD COLUMN "customer_id" INTEGER'
    with engine.begin() as conn:
        print(f"Executing: {stmt}")
        conn.execute(text(stmt))
    print("Order customer_id column ensured.")

def run_migration():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL environment variable is required.")

    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)

    ensure_customer_columns(engine)
    ensure_order_customer_id_column(engine)

    print("Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
