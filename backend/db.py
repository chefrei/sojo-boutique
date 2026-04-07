import os
from pathlib import Path
from sqlmodel import Session, SQLModel, create_engine
from typing import Generator
from models import * # Esto asegura que SQLModel registre todas las tablas

# Configuración de la base de datos
BASE_DIR = Path(__file__).resolve().parent
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend_database.db")

# Si estamos en Cloudflare Workers y el entorno es producción, usamos el dialecto de D1
if ENVIRONMENT == "production":
    # El dialecto 'd1' de sqlalchemy-cloudflare-d1 buscará automáticamente 
    # la vinculación en el objeto 'env' global si está disponible.
    engine = create_engine("d1://", connect_args={"binding": "sojo_boutique_db"})
else:
    # Desarrollo local con SQLite estándar
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )

def init_db():
    # En D1, las tablas se suelen crear vía migraciones de wrangler, 
    # pero esto es útil para desarrollo local.
    if ENVIRONMENT != "production":
        SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
