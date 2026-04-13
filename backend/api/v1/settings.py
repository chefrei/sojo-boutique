from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db import get_session
from models.settings import Settings
from models.user import User
from schemas.settings import SettingsRead, SettingsUpdate
from api.deps import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=SettingsRead)
def get_settings(session: Session = Depends(get_session)):
    settings = session.exec(select(Settings)).first()
    if not settings:
        # Create default if not exists
        settings = Settings()
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return settings

@router.patch("/", response_model=SettingsRead)
def update_settings(
    *, 
    session: Session = Depends(get_session),
    settings_in: SettingsUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    settings = session.exec(select(Settings)).first()
    if not settings:
        settings = Settings()
        session.add(settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
