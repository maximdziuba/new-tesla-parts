"""
Migration script to add Feedback table
Uses SQLModel to be compatible with any database configured in DATABASE_URL.
"""
from sqlmodel import SQLModel, create_engine
import os
import sys

# Add the current directory to sys.path so we can import models and database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from models import Feedback  # Importing registers it with SQLModel.metadata

def migrate():
    print(f"Starting migration using engine: {engine.url}")
    try:
        # This will create all tables registered with SQLModel.metadata that don't exist yet
        SQLModel.metadata.create_all(engine)
        print("Feedback table created (or already existed) successfully!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
