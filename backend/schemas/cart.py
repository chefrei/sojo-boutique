from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

# Este esquema simula lo que el frontend espera en `CartItem` (cart-context.tsx)
class CartProductRead(BaseModel):
    id: int
    name: str
    price: Decimal
    image_url: Optional[str] = None

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemRead(CartItemBase):
    id: int
    user_id: int
    # Campos combinados o extraídos para conveniencia del frontend
    # Aunque estrictamente CartItem no los tiene directamente, los agregaremos al responder
    name: str
    price: Decimal
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True
