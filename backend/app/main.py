from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_db_and_tables, ping_database
from app.models import Debtor, Transaction
from app.routers import debtors as debtors_router
from app.routers import transactions as transactions_router

# Keep explicit model imports so SQLModel metadata is populated before create_all.
# Types are not used directly in the code, but by importing them, their definitions 
# are registered in SQLModel.metadata, which allows create_db_and_tables() to detect 
# them and create their tables when the app starts.
_ = (Debtor, Transaction)


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="LoanTracker API", version="0.1.0", lifespan=lifespan)
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debtors_router.router)
app.include_router(transactions_router.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "loan-tracker-api"}


@app.get("/health")
def health() -> dict[str, str]:
    # Touch settings so misconfigured DATABASE_URL fails early in dev.
    _ = get_settings().database_url
    return {"status": "ok"}


@app.get("/health/db")
def health_db() -> dict[str, str]:
    ping_database()
    return {"status": "ok"}
