from __future__ import annotations
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship
from decimal import Decimal
from datetime import datetime

if TYPE_CHECKING:
    from .user import User
    from .order import Order

class Payment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    order_id: Optional[int] = Field(default=None, foreign_key="order.id")
    reference: Optional[str] = Field(default=None, unique=True, index=True)
    
    amount: Decimal = Field(decimal_places=2)
    method: str = Field(index=True) # Zelle, Efectivo, Pago Movil, etc.
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    user: "User" = Relationship(
        sa_relationship=sa_relationship("User", back_populates="payments")
    )
    order: Optional["Order"] = Relationship(
        sa_relationship=sa_relationship("Order", back_populates="payments")
    )
