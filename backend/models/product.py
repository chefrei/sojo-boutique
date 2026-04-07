from __future__ import annotations
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship
from decimal import Decimal

if TYPE_CHECKING:
    from .category import Category

class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    description: str = Field(nullable=False)
    price: Decimal = Field(default=0.0, decimal_places=2)
    stock: int = Field(default=0)
    image_url: Optional[str] = Field(default=None)
    
    # Llave foránea a categoría
    category_id: int = Field(foreign_key="category.id")
    category: "Category" = Relationship(
        sa_relationship=sa_relationship("Category", back_populates="products")
    )
