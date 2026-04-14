from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship as sa_relationship

if TYPE_CHECKING:
    from .user import User

class CustomerProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    customer_id: Optional[str] = Field(default=None, unique=True, index=True)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    notes: Optional[str] = None
    identification_type: Optional[str] = None
    identification_number: Optional[str] = None
    
    user: "User" = Relationship(back_populates="customer_profile")
