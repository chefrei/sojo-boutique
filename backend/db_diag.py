from sqlmodel import Session, select
import sys
import os
import json

# Añadir el directorio actual al path para importar db y modelos
sys.path.append(os.getcwd())

try:
    from db import engine
    from models import User, Product, Category, Order, CustomerProfile
    
    def check_db():
        with Session(engine) as session:
            try:
                users = session.exec(select(User)).all()
                products = session.exec(select(Product)).all()
                categories = session.exec(select(Category)).all()
                orders = session.exec(select(Order)).all()
                profiles = session.exec(select(CustomerProfile)).all()
                
                report = {
                    "users": [{"email": u.email, "role": u.role, "full_name": u.full_name} for u in users],
                    "products_count": len(products),
                    "categories": [{"id": c.id, "name": c.name} for c in categories],
                    "orders_count": len(orders),
                    "profiles": [{"phone": p.phone, "user_id": p.user_id} for p in profiles]
                }
                print(json.dumps(report, indent=2))
            except Exception as e:
                print(f"Error al consultar tablas: {e}")

    if __name__ == "__main__":
        check_db()
except ImportError as e:
    print(f"Error de importación: {e}")
except Exception as e:
    print(f"Error general: {e}")
