from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from db import get_session
from models.user import User, UserRole
from models.order import Order, OrderStatus
from models.payment import Payment
from api.deps import get_current_admin_user

router = APIRouter()

@router.get("/customers/{customer_id}/kardex")
def get_customer_kardex(
    *, 
    session: Session = Depends(get_session),
    customer_id: int,
    current_admin: User = Depends(get_current_admin_user)
):
    user = session.get(User, customer_id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Obtener todos los pedidos y pagos
    orders = session.exec(select(Order).where(Order.user_id == customer_id)).all()
    payments = session.exec(select(Payment).where(Payment.user_id == customer_id)).all()

    # Combinar y ordenar cronológicamente
    history = []
    for order in orders:
        history.append({
            "date": order.created_at,
            "type": "Cargos (Pedido)",
            "reference": order.reference or f"PED-{order.id:06d}",
            "amount": float(order.total_price),
            "is_credit": False
        })
    
    for payment in payments:
        history.append({
            "date": payment.created_at,
            "type": "Abono",
            "reference": payment.reference or f"REC-{payment.id:06d}",
            "amount": float(payment.amount),
            "is_credit": True
        })

    # Ordenar por fecha
    history.sort(key=lambda x: x["date"])

    # Calcular saldo acumulado
    balance = 0.0
    kardex = []
    for event in history:
        if event["is_credit"]:
            balance -= event["amount"]
        else:
            balance += event["amount"]
        
        kardex.append({
            **event,
            "dateFormatted": event["date"].strftime("%Y-%m-%d %H:%M"),
            "running_balance": round(balance, 2)
        })

    return {
        "customer_name": user.full_name,
        "current_balance": round(balance, 2),
        "transactions": kardex
    }

@router.get("/finance/summary")
def get_finance_summary(
    *, 
    session: Session = Depends(get_session),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin_user)
):
    try:
        # Parsing dates
        today = datetime.utcnow()
        start = datetime.fromisoformat(start_date) if start_date else (today - timedelta(days=30))
        end = datetime.fromisoformat(end_date) if end_date else (today + timedelta(days=1))
    except ValueError:
         raise HTTPException(status_code=400, detail="Formato de fecha inválido. Usar ISO format.")

    # Ventas totales en el rango
    orders_in_range = session.exec(
        select(Order).where(and_(Order.created_at >= start, Order.created_at <= end))
    ).all()
    
    total_sales = sum(o.total_price for o in orders_in_range)
    
    # Pagos totales en el rango
    payments_in_range = session.exec(
        select(Payment).where(and_(Payment.created_at >= start, Payment.created_at <= end))
    ).all()
    
    total_collected = sum(p.amount for p in payments_in_range)
    
    # Deuda pendiente total (no solo del rango, sino global para contexto)
    all_unpaid_orders = session.exec(select(Order).where(Order.amount_paid < Order.total_price)).all()
    total_receivable = sum(o.total_price - o.amount_paid for o in all_unpaid_orders)

    return {
        "period": f"{start.strftime('%Y-%m-%d')} a {end.strftime('%Y-%m-%d')}",
        "total_sales": float(total_sales),
        "total_collected": float(total_collected),
        "total_receivable": float(total_receivable),
        "order_count": len(orders_in_range),
        "payment_count": len(payments_in_range)
    }

@router.get("/finance/stats")
def get_finance_stats(
    *, session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Retorna estadísticas para el gráfico de barras del admin.
    Ventas vs Cobranza por mes para los últimos 6 meses.
    """
    today = datetime.utcnow()
    stats = []
    
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1, hour=0, minute=0, second=0)
        # Aproximación simple para fin de mes
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        sales = session.exec(
            select(func.sum(Order.total_price))
            .where(Order.created_at >= month_start, Order.created_at < month_end, Order.status == OrderStatus.DELIVERED)
        ).one() or 0
        
        collections = session.exec(
            select(func.sum(Payment.amount))
            .where(Payment.created_at >= month_start, Payment.created_at < month_end)
        ).one() or 0
        
        stats.append({
            "month": month_start.strftime("%b"),
            "ventas": float(sales),
            "recaudado": float(collections)
        })
        
    return stats

@router.get("/categories/stats")
def get_category_stats(
    *, session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Retorna distribución de ventas por categoría para el gráfico circular.
    """
    from models.category import Category
    from models.product import Product
    from models.order import OrderItem
    
    categories = session.exec(select(Category)).all()
    stats = []
    
    for cat in categories:
        # Sumar ventas de productos en esta categoría
        volume = session.exec(
            select(func.sum(OrderItem.unit_price * OrderItem.quantity))
            .join(Product)
            .where(Product.category_id == cat.id)
        ).one() or 0
        
        if volume > 0:
            stats.append({
                "name": cat.name,
                "value": float(volume)
            })
            
    return stats
