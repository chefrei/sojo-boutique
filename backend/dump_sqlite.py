import sqlite3
import os
from pathlib import Path

# Rutas absolutas
backend_dir = Path(r"c:\Users\Cheche\Documents\prg\sojo-boutique\backend")
db_path = backend_dir / "backend_database.db"
sql_path = backend_dir / "seed.sql"

def dump():
    if not db_path.exists():
        print(f"Error: No se encontró el archivo {db_path}")
        return

    print(f"Exportando {db_path} a SQL de forma robusta...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Obtener nombres de tablas en orden de dependencia manual
    # Para evitar errores de Foreign Key en D1
    tables = ["user", "category", "product", "order", "orderitem", "payment"]
    
    with open(sql_path, "w", encoding="utf-8") as f:
        # Desactivar FK temporalmente para la creación masiva
        f.write("PRAGMA foreign_keys = OFF;\n")
        
        # 1. DROP y CREATE de todas las tablas
        for table in tables:
            f.write(f"DROP TABLE IF EXISTS \"{table}\";\n")
            cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table}'")
            create_sql = cursor.fetchone()[0]
            f.write(f"{create_sql};\n")
            
        # 2. INSERT de todos los datos
        for table in tables:
            cursor.execute(f"SELECT * FROM \"{table}\"")
            rows = cursor.fetchall()
            if not rows:
                continue
                
            cursor.execute(f"PRAGMA table_info(\"{table}\")")
            cols = [col[1] for col in cursor.fetchall()]
            col_names = ", ".join([f"\"{c}\"" for c in cols])
            
            for row in rows:
                # Formatear valores
                vals = []
                for v in row:
                    if v is None: 
                        vals.append("NULL")
                    elif isinstance(v, (int, float)): 
                        vals.append(str(v))
                    else: 
                        safe_val = str(v).replace("'", "''")
                        vals.append(f"'{safe_val}'")
                
                val_str = ", ".join(vals)
                f.write(f"INSERT INTO \"{table}\" ({col_names}) VALUES ({val_str});\n")
        
        # 3. CREATE INDEXES
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL")
        for (index_sql,) in cursor.fetchall():
            f.write(f"{index_sql};\n")
            
        f.write("PRAGMA foreign_keys = ON;\n")
        
    conn.close()
    print(f"¡Éxito! Archivo generado en: {sql_path}")

if __name__ == "__main__":
    dump()
