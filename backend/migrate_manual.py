from sqlalchemy import create_engine, text, inspect
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR}/backend_database.db"
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as con:
        print("Verificando integridad de tablas...")
        
        # Lista de misiones (Tabla, Columna, Tipo)
        tasks = [
            ("product", "sku", "VARCHAR"),
            ("order", "reference", "VARCHAR"),
            ("payment", "reference", "VARCHAR"),
            ("customerprofile", "customer_id", "VARCHAR"),
            ("customerprofile", "identification_type", "VARCHAR"),
            ("customerprofile", "identification_number", "VARCHAR"),
        ]
        
        for table, col, col_type in tasks:
            try:
                # SQLite no tiene 'IF NOT EXISTS' para columnas directamente en ALTER, 
                # así que intentamos y capturamos el error si ya existe.
                con.execute(text(f"ALTER TABLE \"{table}\" ADD COLUMN {col} {col_type}"))
                con.commit()
                print(f"Campo '{col}' añadido a tabla '{table}'")
            except Exception as e:
                # Ignorar si la columna ya existe
                if "duplicate column name" in str(e).lower():
                    pass
                else:
                    print(f"Nota: No se pudo añadir {col} a {table}: {e}")
            
        print("Sincronización de base de datos completada.")

if __name__ == "__main__":
    migrate()
