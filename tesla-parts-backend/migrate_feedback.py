"""
Migration script to add Feedback table
Run this script to create the feedback table in the database.
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tesla_parts.db")

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if feedback table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'")
    if cursor.fetchone():
        print("Feedback table already exists. Skipping migration.")
        conn.close()
        return
    
    # Create feedback table
    cursor.execute("""
        CREATE TABLE feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sort_order INTEGER DEFAULT 0
        )
    """)
    
    # Create index on sort_order
    cursor.execute("CREATE INDEX idx_feedback_sort_order ON feedback(sort_order)")
    
    conn.commit()
    conn.close()
    print("Feedback table created successfully!")

if __name__ == "__main__":
    migrate()
