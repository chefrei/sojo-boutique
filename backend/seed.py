from sqlmodel import Session, select
from app.db import engine, init_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.payment import Payment
from app.core.security import get_password_hash
from decimal import Decimal

def seed_data():
    init_db()
    with Session(engine) as session:
        # 1. Crear Usuario Admin
        admin_user = session.exec(select(User).where(User.email == "admin@sojaboutique.com")).first()
        if not admin_user:
            admin_user = User(
                email="admin@sojaboutique.com",
                full_name="Admin Soho",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            session.add(admin_user)
            print("Usuario admin creado.")

        # 2. Crear Categorías
        categories_data = [
            {"name": "Prendas", "slug": "prendas"},
            {"name": "Accesorios", "slug": "accesorios"},
            {"name": "Perfumes", "slug": "perfumes"},
        ]
        
        db_categories = {}
        for cat in categories_data:
            db_cat = session.exec(select(Category).where(Category.slug == cat["slug"])).first()
            if not db_cat:
                db_cat = Category(**cat)
                session.add(db_cat)
                session.commit()
                session.refresh(db_cat)
            db_categories[cat["slug"]] = db_cat

        # 3. Crear Productos de ejemplo (tomados de los mocks del frontend)
        products_data = [
            {
                "name": "Vestido Floral Primavera",
                "price": Decimal("89.99"),
                "description": "Vestido ligero con estampado floral, ideal para la temporada.",
                "image_url": "/placeholder.svg?height=400&width=300",
                "category_id": db_categories["prendas"].id,
                "stock": 10
            },
            {
                "name": "Collar Perlas Elegance",
                "price": Decimal("45.50"),
                "description": "Collar de perlas cultivadas con broche de plata.",
                "image_url": "/placeholder.svg?height=400&width=300",
                "category_id": db_categories["accesorios"].id,
                "stock": 5
            },
            {
                "name": "Perfume Rosa Silvestre",
                "price": Decimal("75.00"),
                "description": "Fragancia floral con notas de rosa y jazmín.",
                "image_url": "/placeholder.svg?height=400&width=300",
                "category_id": db_categories["perfumes"].id,
                "stock": 15
            }
        ]

        for prod in products_data:
            existing_prod = session.exec(select(Product).where(Product.name == prod["name"])).first()
            if not existing_prod:
                db_prod = Product(**prod)
                session.add(db_prod)
        
        # 4. Crear Cliente con Deuda (Módulo contable)
        maria_user = session.exec(select(User).where(User.email == "maria@ejemplo.com")).first()
        if not maria_user:
            maria_user = User(
                email="maria@ejemplo.com",
                full_name="María González",
                hashed_password=get_password_hash("cliente123"),
                role=UserRole.CLIENT
            )
            session.add(maria_user)
            session.commit()
            session.refresh(maria_user)

        # Crear pedido para María
        order_maria = session.exec(select(Order).where(Order.user_id == maria_user.id)).first()
        if not order_maria:
            order_maria = Order(
                user_id=maria_user.id,
                total_price=Decimal("150.00"),
                amount_paid=Decimal("50.00"),
                payment_status=PaymentStatus.PARTIAL,
                status=OrderStatus.PENDING
            )
            session.add(order_maria)
            session.commit()
            session.refresh(order_maria)

            # Registrar el pago parcial
            payment_maria = Payment(
                user_id=maria_user.id,
                order_id=order_maria.id,
                amount=Decimal("50.00"),
                method="Zelle",
                notes="Abono inicial"
            )
            session.add(payment_maria)
            session.commit()

        print("Base de datos poblada con éxito. Deuda cargada para Maria.")

if __name__ == "__main__":
    seed_data()
