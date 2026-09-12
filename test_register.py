from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()
try:
    u = User(name="Test", email="test@test.com", password_hash=hash_password("test"), role="admin")
    db.add(u)
    db.commit()
    print("Success")
except Exception as e:
    print(f"Error: {e}")
