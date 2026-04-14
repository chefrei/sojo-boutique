from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select, func
from typing import List
from db import get_session
from models.user import User
from models.product import Product
from models.order import Order, OrderItem, OrderStatus
from schemas.order import OrderCreate, OrderRead
from api.deps import get_current_active_user
from decimal import Decimal
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    *, session: Session = Depends(get_session),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user)
):
    # Determinar el usuario destino del pedido
    target_user_id = current_user.id
    if current_user.role == "admin" and order_in.user_id is not None:
        target_user = session.get(User, order_in.user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        target_user_id = order_in.user_id

    # 1. Crear la orden base
    count = session.exec(select(func.count(Order.id))).one()
    generated_ref = f"PED-{(count + 1):06d}"
    
    db_order = Order(user_id=target_user_id, total_price=Decimal("0.0"), reference=generated_ref)
    session.add(db_order)
    session.flush() # Para obtener el ID del pedido
    
    total_price = Decimal("0.0")
    order_items = []
    
    # 2. Procesar los items
    for item_in in order_in.items:
        product = session.get(Product, item_in.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item_in.product_id} no encontrado")
        
        # Allow negative stock to track orders that need to be requested from suppliers
        # The stock check below is removed per business logic
        # if product.stock < item_in.quantity:
        #     raise HTTPException(
        #         status_code=400, 
        #         detail=f"Stock insuficiente para {product.name}. Disponible: {product.stock}"
        #     )
            
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
    # Usamos selectinload para cargar relaciones de forma eficiente
    statement = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .order_by(Order.created_at.desc())
    )
    orders = session.exec(statement).all()
    return orders

@router.get("/{id}", response_model=OrderRead)
def read_order(
    *, session: Session = Depends(get_session),
    id: int,
    current_user: User = Depends(get_current_active_user)
):
    statement = (
        select(Order)
        .where(Order.id == id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    order = session.exec(statement).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    # Verificar que el pedido pertenezca al usuario (o sea admin)
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")
    
    return order

@router.put("/{id}/cancel", response_model=OrderRead)
def cancel_order(
    *, session: Session = Depends(get_session),
    id: int,
    current_user: User = Depends(get_current_active_user)
):
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    # Si es cliente, verificar que el pedido sea suyo
    if current_user.role != "admin":
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes permiso para cancelar este pedido")
        
        # Reglas para clientes:
        if order.status != OrderStatus.PENDING:
            raise HTTPException(status_code=400, detail="El pedido ya no puede ser cancelado porque no está pendiente")
        
        # Debe haber pasado menos de 1 hora
        time_diff = datetime.utcnow() - order.created_at
        if time_diff > timedelta(hours=1):
            raise HTTPException(status_code=400, detail="El tiempo de gracia para cancelar el pedido (1 hora) ha expirado")
            
    # Reglas para el admin:
    if current_user.role == "admin":
        if order.status == OrderStatus.DELIVERED:
            raise HTTPException(status_code=400, detail="No se puede cancelar un pedido que ya fue entregado")

    # Si ya está cancelado, simplemente lo retornamos
    if order.status == OrderStatus.CANCELLED:
        return order

    # Restaurar el stock
    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    for item in items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock += item.quantity
            session.add(product)

    # Cambiar estado
    order.status = OrderStatus.CANCELLED
    session.add(order)
    
    session.commit()
    session.refresh(order)
    return order
