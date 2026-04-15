import os
from pathlib import Path
from sqlmodel import Session, SQLModel, create_engine
from typing import Generator
from models import *  # Registra todos los modelos en SQLModel

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend_database.db")

# PostgreSQL en Render / SQLite en local
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
