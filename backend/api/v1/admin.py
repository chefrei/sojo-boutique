from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List, Optional
from decimal import Decimal
from db import get_session
from models.user import User, UserRole
from models.product import Product
from models.order import Order, PaymentStatus, OrderStatus
from models.payment import Payment
from schemas.admin import DashboardStats, UserWithBalance, PaymentCreate, PaymentRead
from schemas.order import OrderRead, OrderUpdate, OrderTableOut
from api.deps import get_current_admin_user

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    *, session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    total_sales = session.exec(select(func.sum(Order.total_price)).where(Order.status == OrderStatus.DELIVERED)).one() or Decimal("0.0")
    total_collected = session.exec(select(func.sum(Payment.amount))).one() or Decimal("0.0")
    total_receivable = total_sales - total_collected
    order_count = session.exec(select(func.count(Order.id)).where(Order.status == OrderStatus.DELIVERED)).one()
    customer_count = session.exec(select(func.count(User.id)).where(User.role == UserRole.CLIENT)).one()
    
    return {
        "total_sales": total_sales,
        "total_collected": total_collected,
        "total_receivable": total_receivable,
        "order_count": order_count,
        "customer_count": customer_count
    }

@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def register_payment(
    *, session: Session = Depends(get_session),
    payment_in: PaymentCreate,
    current_admin: User = Depends(get_current_admin_user)
):
    # Validar que el cliente tenga deuda antes de permitir el pago (Recomendación de pruebas.md)
    total_orders = session.exec(
        select(func.sum(Order.total_price))
        .where(Order.user_id == payment_in.user_id)
        .where(Order.status == OrderStatus.DELIVERED)
    ).one() or Decimal("0.0")
    
    total_paid = session.exec(
        select(func.sum(Payment.amount))
        .where(Payment.user_id == payment_in.user_id)
    ).one() or Decimal("0.0")
    
    balance = total_orders - total_paid
    
    if balance <= 0:
        raise HTTPException(
            status_code=400, 
            detail="El cliente no tiene deuda pendiente. No se puede registrar un pago."
        )

    # 1. Crear el registro del pago con referencia autogenerada
    count = session.exec(select(func.count(Payment.id))).one()
    generated_ref = f"REC-{(count + 1):06d}"

    db_payment = Payment(
        user_id=payment_in.user_id,
        order_id=payment_in.order_id,
        amount=payment_in.amount,
        method=payment_in.method,
        notes=payment_in.notes,
        reference=generated_ref
    )
    session.add(db_payment)
    
    # 2. Si el pago es para un pedido específico, actualizamos el estado del pedido
    if payment_in.order_id:
        db_order = session.get(Order, payment_in.order_id)
        if not db_order:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
            
        db_order.amount_paid += payment_in.amount
        
        if db_order.amount_paid >= db_order.total_price:
            db_order.payment_status = PaymentStatus.PAID
        elif db_order.amount_paid > 0:
            db_order.payment_status = PaymentStatus.PARTIAL
        else:
            db_order.payment_status = PaymentStatus.PENDING
            
        session.add(db_order)
        
    session.commit()
    session.refresh(db_payment)
    return db_payment

@router.get("/debtors", response_model=List[UserWithBalance])
def get_debtors(
    *, session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    # Esta es una consulta simplificada. En una app real se optimizaría.
    users = session.exec(select(User).where(User.role == UserRole.CLIENT)).all()
    debtors = []
    
    for user in users:
        total_orders = session.exec(select(func.sum(Order.total_price)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one() or Decimal("0.0")
        total_paid = session.exec(select(func.sum(Payment.amount)).where(Payment.user_id == user.id)).one() or Decimal("0.0")
        balance = total_orders - total_paid
        
        if balance > 0:
            debtors.append({
                **user.model_dump(),
                "total_orders": total_orders,
                "total_paid": total_paid,
                "balance": balance
            })
            
    return debtors

# --- GESTIÓN DE PEDIDOS ---

@router.get("/orders", response_model=List[OrderTableOut])
def get_all_orders(
    *, session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user),
    offset: int = 0,
    limit: int = 100
):
    orders = session.exec(select(Order).offset(offset).limit(limit).order_by(Order.created_at.desc())).all()
    
    result = []
    for order in orders:
        product_names = []
        for item in order.items:
            product = session.get(Product, item.product_id)
            if product:
                product_names.append(product.name)

        status_mapping = {
            OrderStatus.PENDING: "Pendiente",
            OrderStatus.PAID: "Pendiente",
            OrderStatus.SHIPPED: "En Proceso",
            OrderStatus.DELIVERED: "Completado",
            OrderStatus.CANCELLED: "Cancelado"
        }
        
        result.append(OrderTableOut(
            id=order.reference or f"PED-{order.id:06d}",
            db_id=order.id,
            fecha=order.created_at.strftime("%Y-%m-%d"),
            cliente=order.user.full_name if order.user else "Cliente Desconocido",
            total=float(order.total_price),
            estado=status_mapping.get(order.status, order.status),
            productos=product_names
        ))
    return result

@router.patch("/orders/{id}", response_model=OrderRead)
def update_order_status(
    *, session: Session = Depends(get_session),
    id: int,
    order_in: OrderUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    db_order = session.get(Order, id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    order_data = order_in.model_dump(exclude_unset=True)
    for key, value in order_data.items():
        setattr(db_order, key, value)
        
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order
