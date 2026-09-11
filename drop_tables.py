from app.database.database import engine, Base
from app.models.prediction import Prediction, Alert

print("Dropping tables...")
Base.metadata.drop_all(bind=engine)
print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
