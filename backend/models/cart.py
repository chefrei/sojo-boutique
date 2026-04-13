from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    product_id: int = Field(foreign_key="product.id")
    quantity: int = Field(default=1)
    
    # Podríamos añadir relationships si es necesario
    # producto = Relationship(...)
