from pydantic import BaseModel
from typing import Optional

class SettingsRead(BaseModel):
    id: int
    business_name: str
    slogan: Optional[str]
    rif: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    email: Optional[str]
    primary_color: str
    accent_color: str
    heading_font: str
    body_font: str
    logo_url: Optional[str]

class SettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    slogan: Optional[str] = None
    rif: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    heading_font: Optional[str] = None
    body_font: Optional[str] = None
    logo_url: Optional[str] = None
