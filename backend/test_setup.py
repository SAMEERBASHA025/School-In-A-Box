import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models

def test_database_connection():
    print("Checking database configuration...")
    try:
        # Create all tables if they do not exist
        Base.metadata.create_all(bind=engine)
        
        # Open a session
        db: Session = SessionLocal()
        
        # Attempt basic query
        users_count = db.query(models.User).count()
        print(f"Database connection successful!")
        print(f"Users table queried. Current users count: {users_count}")
        
        # Check upload folder
        os.makedirs("uploads", exist_ok=True)
        print("Uploads folder verified.")
        
        db.close()
        return True
    except Exception as e:
        print(f"Database connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    if success:
        print("\nAll systems operational! Backend ready for execution.")
    else:
        print("\nSystem verification failed. Please check database logs.")
