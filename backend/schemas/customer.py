from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from decimal import Decimal

class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    status: str = "active"
    notes: Optional[str] = None
    identificationType: Optional[str] = None
    identificationNumber: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    identificationType: Optional[str] = None
    identificationNumber: Optional[str] = None

class CustomerRead(CustomerBase):
    id: int
    compras: int = 0
    ultimaCompra: Optional[str] = None
    deuda: Decimal = Decimal("0.0")

    class Config:
        from_attributes = True
