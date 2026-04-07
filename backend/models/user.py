from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship
from enum import Enum

if TYPE_CHECKING:
    from .product import Product
    from .order import Order
    from .payment import Payment
    from .customer import CustomerProfile

class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    full_name: str = Field(index=True)
    hashed_password: str = Field(nullable=False)
    role: UserRole = Field(default=UserRole.CLIENT)
    is_active: bool = Field(default=True)

    # Relaciones
    orders: List["Order"] = Relationship(
        sa_relationship=sa_relationship("Order", back_populates="user")
    )
    payments: List["Payment"] = Relationship(
        sa_relationship=sa_relationship("Payment", back_populates="user")
    )
    customer_profile: Optional["CustomerProfile"] = Relationship(
        sa_relationship=sa_relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    )
