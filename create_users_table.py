from app.database.database import engine, Base
from app.models.user import User
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
