import os
from sqlmodel import create_engine, Session, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
else:
    sqlite_file_name = "tesla_parts.db"
    # Go up one level frommigrations/ to get backend root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_path = os.path.join(base_dir, sqlite_file_name)
    sqlite_url = f"sqlite:///{sqlite_path}"
    engine = create_engine(sqlite_url)

def migrate():
    with Session(engine) as session:
        # Check database engine type
        is_sqlite = engine.url.drivername == "sqlite"
        
        # 1. Add reset_token_hash column to customer table
        try:
            session.exec(text("ALTER TABLE customer ADD COLUMN reset_token_hash VARCHAR"))
            session.commit()
            print("Added 'reset_token_hash' column to customer table.")
        except Exception as e:
            print(f"Column 'reset_token_hash' might already exist: {e}")

        # 2. Add reset_token_expires_at column to customer table
        try:
            if is_sqlite:
                session.exec(text("ALTER TABLE customer ADD COLUMN reset_token_expires_at DATETIME"))
            else:
                session.exec(text("ALTER TABLE customer ADD COLUMN reset_token_expires_at TIMESTAMP WITH TIME ZONE"))
            session.commit()
            print("Added 'reset_token_expires_at' column to customer table.")
        except Exception as e:
            print(f"Column 'reset_token_expires_at' might already exist: {e}")

if __name__ == "__main__":
    migrate()
