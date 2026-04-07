from __future__ import annotations
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship

if TYPE_CHECKING:
    from .product import Product

class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    slug: str = Field(index=True, unique=True, nullable=False)
    description: Optional[str] = Field(default=None)

    # Relación con productos
    products: List["Product"] = Relationship(
        sa_relationship=sa_relationship("Product", back_populates="category")
    )
