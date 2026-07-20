import sqlite3
import os

db_paths = ["../school_in_a_box.db", "school_in_a_box.db", "backend/school_in_a_box.db"]

for path in db_paths:
    if os.path.exists(path):
        print(f"Checking database at {path}:")
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role FROM users")
            users = cursor.fetchall()
            print("Users in DB:", users)
            conn.close()
        except Exception as e:
            print(f"Error checking {path}: {e}")
