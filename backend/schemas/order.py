from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from models.order import OrderStatus, PaymentStatus

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    id: int
    unit_price: Decimal
    product_name: Optional[str] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_price: Decimal
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    user_id: Optional[int] = None  # Solo usado por admins para asignar a un cliente

class OrderRead(OrderBase):
    id: int
    user_id: int
    amount_paid: Decimal
    created_at: datetime
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None

class OrderTableOut(BaseModel):
    id: str
    db_id: int
    fecha: str
    cliente: str
    total: float
    estado: str
    productos: List[str]

