from sqlmodel import SQLModel, Field
from typing import Optional

class Settings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    business_name: str = Field(default="Soho Boutique")
    slogan: Optional[str] = Field(default="Tu destino de moda exclusivo")
    rif: Optional[str] = Field(default="J-00000000-0")
    phone: Optional[str] = Field(default="+58 000-0000000")
    address: Optional[str] = Field(default="Caracas, Venezuela")
    email: Optional[str] = Field(default="contacto@sohoboutique.com")
    
    # Estética
    primary_color: str = Field(default="350 65% 65%")  # HSL format for CSS variables
    accent_color: str = Field(default="15 75% 75%")
    heading_font: str = Field(default="Great Vibes")
    body_font: str = Field(default="Mona Sans")
    logo_url: Optional[str] = Field(default="/images/logo.png")
