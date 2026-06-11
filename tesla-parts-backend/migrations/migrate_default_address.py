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
    # Go up one level from migrations/ to get backend root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_path = os.path.join(base_dir, sqlite_file_name)
    sqlite_url = f"sqlite:///{sqlite_path}"
    engine = create_engine(sqlite_url)

def migrate():
    with Session(engine) as session:
        # Add default_address column to customer table
        try:
            session.exec(text("ALTER TABLE customer ADD COLUMN default_address VARCHAR"))
            session.commit()
            print("Added 'default_address' column to customer table.")
        except Exception as e:
            print(f"Column 'default_address' might already exist: {e}")

if __name__ == "__main__":
    migrate()
