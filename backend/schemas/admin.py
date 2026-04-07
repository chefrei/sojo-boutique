from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from .user import UserRead
from .product import ProductRead

class DashboardStats(BaseModel):
    total_sales: Decimal
    total_collected: Decimal
    total_receivable: Decimal
    order_count: int
    customer_count: int

class UserWithBalance(UserRead):
    total_orders: Decimal
    total_paid: Decimal
    balance: Decimal

class PaymentCreate(BaseModel):
    user_id: int
    order_id: Optional[int] = None
    amount: Decimal
    method: str
    notes: Optional[str] = None

class PaymentRead(BaseModel):
    id: int
    user_id: int
    order_id: Optional[int]
    amount: Decimal
    method: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
