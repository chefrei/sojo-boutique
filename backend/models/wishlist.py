from __future__ import annotations
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship
from datetime import datetime

from .user import User
from .product import Product

class Wishlist(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    user: "User" = Relationship(
        sa_relationship=sa_relationship("User", backref="wishlist_items")
    )
    product: "Product" = Relationship(
        sa_relationship=sa_relationship("Product")
    )
