from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from db import get_session
from models.user import User
from models.product import Product
from models.order import Order, OrderItem
from schemas.order import OrderCreate, OrderRead
from api.deps import get_current_active_user
from decimal import Decimal

router = APIRouter()

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    *, session: Session = Depends(get_session),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user)
):
    # 1. Crear la orden base
    db_order = Order(user_id=current_user.id, total_price=Decimal("0.0"))
    session.add(db_order)
    session.flush() # Para obtener el ID del pedido
    
    total_price = Decimal("0.0")
    order_items = []
    
    # 2. Procesar los items
    for item_in in order_in.items:
        product = session.get(Product, item_in.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item_in.product_id} no encontrado")
        
        if product.stock < item_in.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente para {product.name}. Disponible: {product.stock}"
            )
            
        # Calcular precio
        item_total = product.price * item_in.quantity
        total_price += item_total
        
        # Descontar stock (según lo propuesto en el plan de manejo de stock automático)
        product.stock -= item_in.quantity
        
        # Crear OrderItem
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item_in.quantity,
            unit_price=product.price
        )
        order_items.append(db_item)
        session.add(db_item)
        session.add(product)
        
    # 3. Actualizar precio total y guardar
    db_order.total_price = total_price
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    
    return db_order

@router.get("/me", response_model=List[OrderRead])
def read_my_orders(
    *, session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    statement = select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    orders = session.exec(statement).all()
    return orders

@router.get("/{id}", response_model=OrderRead)
def read_order(
    *, session: Session = Depends(get_session),
    id: int,
    current_user: User = Depends(get_current_active_user)
):
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    # Verificar que el pedido pertenezca al usuario (o sea admin)
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")
        
    return order
