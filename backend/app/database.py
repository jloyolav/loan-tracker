from collections.abc import Generator

from sqlalchemy import text
from sqlmodel import Session, create_engine
from sqlmodel import SQLModel

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, echo=False)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def ping_database() -> bool:
    with Session(engine) as session:
        session.exec(text("SELECT 1"))
    return True

# Creates all tables in the PostgreSQL database when they don't exist.
def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
