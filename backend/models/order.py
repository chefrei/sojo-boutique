from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship
from enum import Enum
from decimal import Decimal
from datetime import datetime

from .product import Product

if TYPE_CHECKING:
    from .user import User
    from .payment import Payment

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    REFUNDED = "refunded"

class OrderItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int = Field(default=1)
    unit_price: Decimal = Field(decimal_places=2)

    # Relaciones
    order: "Order" = Relationship(
        sa_relationship=sa_relationship("Order", back_populates="items")
    )
    product: Product = Relationship(
        sa_relationship=sa_relationship("Product")
    )

    @property
    def product_name(self) -> Optional[str]:
        return self.product.name if self.product else None

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    reference: Optional[str] = Field(default=None, unique=True, index=True)
    total_price: Decimal = Field(default=0.0, decimal_places=2)
    amount_paid: Decimal = Field(default=0.0, decimal_places=2)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    user: "User" = Relationship(
        sa_relationship=sa_relationship("User", back_populates="orders")
    )
    items: List[OrderItem] = Relationship(
        sa_relationship=sa_relationship("OrderItem", back_populates="order")
    )
    payments: List["Payment"] = Relationship(
        sa_relationship=sa_relationship("Payment", back_populates="order")
    )
