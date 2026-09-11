from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exceptions import unexpected_error_handler

from app.api.location.routes import router as location_router
from app.api.district.routes import router as district_router
from app.api.auth.routes import router as auth_router
from app.api.prediction.routes import router as prediction_router


app = FastAPI(
    title="Flash Flood Prediction System API",
    version="1.0.0",
)

app.add_exception_handler(
    Exception,
    unexpected_error_handler,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router,prefix="/api",)
app.include_router(prediction_router,prefix="/api",)
app.include_router(location_router, prefix="/api")
app.include_router(district_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Flash Flood Prediction System API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }