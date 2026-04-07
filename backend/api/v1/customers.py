from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List, Optional
import uuid
from decimal import Decimal

from db import get_session
from models.user import User, UserRole
from models.customer import CustomerProfile
from models.order import Order, OrderStatus
from models.payment import Payment
from schemas.customer import CustomerRead, CustomerCreate, CustomerUpdate
from api.deps import get_current_admin_user
from core.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[CustomerRead])
def get_customers(
    *, session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user)
):
    users = session.exec(select(User).where(User.role == UserRole.CLIENT).offset(offset).limit(limit)).all()
    
    customers_out = []
    for user in users:
        compras = session.exec(select(func.count(Order.id)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one() or 0
        ultima_compra = session.exec(select(func.max(Order.created_at)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one()
        
        total_orders = session.exec(select(func.sum(Order.total_price)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one() or Decimal("0.0")
        total_paid = session.exec(select(func.sum(Payment.amount)).where(Payment.user_id == user.id)).one() or Decimal("0.0")
        deuda = total_orders - total_paid
        
        profile = user.customer_profile
        
        customers_out.append(CustomerRead(
            id=user.id,
            name=user.full_name,
            email=user.email if not "no-email" in user.email else "",
            phone=profile.phone if profile else "",
            address=profile.address if profile else "",
            city=profile.city if profile else "",
            state=profile.state if profile else "",
            postalCode=profile.postal_code if profile else "",
            status="active" if user.is_active else "inactive",
            notes=profile.notes if profile else "",
            identificationType=profile.identification_type if profile else "",
            identificationNumber=profile.identification_number if profile else "",
            compras=compras,
            ultimaCompra=ultima_compra.isoformat() if ultima_compra else None,
            deuda=deuda
        ))
        
    return customers_out

@router.get("/{id}", response_model=CustomerRead)
def get_customer(
    *, session: Session = Depends(get_session),
    id: int,
    current_admin: User = Depends(get_current_admin_user)
):
    user = session.get(User, id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    compras = session.exec(select(func.count(Order.id)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one() or 0
    ultima_compra = session.exec(select(func.max(Order.created_at)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one()
    total_orders = session.exec(select(func.sum(Order.total_price)).where(Order.user_id == user.id).where(Order.status == OrderStatus.DELIVERED)).one() or Decimal("0.0")
    total_paid = session.exec(select(func.sum(Payment.amount)).where(Payment.user_id == user.id)).one() or Decimal("0.0")
    deuda = total_orders - total_paid
    
    profile = user.customer_profile
    return CustomerRead(
        id=user.id,
        name=user.full_name,
        email=user.email if not "no-email" in user.email else "",
        phone=profile.phone if profile else "",
        address=profile.address if profile else "",
        city=profile.city if profile else "",
        state=profile.state if profile else "",
        postalCode=profile.postal_code if profile else "",
        status="active" if user.is_active else "inactive",
        notes=profile.notes if profile else "",
        identificationType=profile.identification_type if profile else "",
        identificationNumber=profile.identification_number if profile else "",
        compras=compras,
        ultimaCompra=ultima_compra.isoformat() if ultima_compra else None,
        deuda=deuda
    )

@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(
    *, session: Session = Depends(get_session),
    customer_in: CustomerCreate,
    current_admin: User = Depends(get_current_admin_user)
):
    email_to_use = customer_in.email
    if not email_to_use:
        email_to_use = f"no-email-{uuid.uuid4().hex[:8]}@sojoboutique.com"
    else:
        existing = session.exec(select(User).where(User.email == email_to_use)).first()
        if existing:
            raise HTTPException(status_code=400, detail="El correo ya está registrado.")
            
    new_user = User(
        email=email_to_use,
        full_name=customer_in.name,
        hashed_password=get_password_hash(uuid.uuid4().hex),
        role=UserRole.CLIENT,
        is_active=(customer_in.status == "active")
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    new_profile = CustomerProfile(
        user_id=new_user.id,
        phone=customer_in.phone,
        address=customer_in.address,
        city=customer_in.city,
        state=customer_in.state,
        postal_code=customer_in.postalCode,
        notes=customer_in.notes,
        identification_type=customer_in.identificationType,
        identification_number=customer_in.identificationNumber
    )
    session.add(new_profile)
    session.commit()
    
    return get_customer(session=session, id=new_user.id, current_admin=current_admin)

@router.patch("/{id}", response_model=CustomerRead)
def update_customer(
    *, session: Session = Depends(get_session),
    id: int,
    customer_in: CustomerUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    user = session.get(User, id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    if customer_in.name is not None:
        user.full_name = customer_in.name
    if customer_in.status is not None:
        user.is_active = (customer_in.status == "active")
    if customer_in.email is not None:
        if customer_in.email == "" and not "no-email" in user.email:
            user.email = f"no-email-{uuid.uuid4().hex[:8]}@sojoboutique.com"
        elif customer_in.email != "":
            existing = session.exec(select(User).where(User.email == customer_in.email).where(User.id != id)).first()
            if existing:
                raise HTTPException(status_code=400, detail="El correo ya está registrado por otro usuario.")
            user.email = customer_in.email
            
    session.add(user)
    
    profile = user.customer_profile
    if not profile:
        profile = CustomerProfile(user_id=user.id)
        
    if customer_in.phone is not None:
        profile.phone = customer_in.phone
    if customer_in.address is not None:
        profile.address = customer_in.address
    if customer_in.city is not None:
        profile.city = customer_in.city
    if customer_in.state is not None:
        profile.state = customer_in.state
    if customer_in.postalCode is not None:
        profile.postal_code = customer_in.postalCode
    if customer_in.notes is not None:
        profile.notes = customer_in.notes
    if customer_in.identificationType is not None:
        profile.identification_type = customer_in.identificationType
    if customer_in.identificationNumber is not None:
        profile.identification_number = customer_in.identificationNumber
        
    session.add(profile)
    session.commit()
    
    return get_customer(session=session, id=id, current_admin=current_admin)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    *, session: Session = Depends(get_session),
    id: int,
    current_admin: User = Depends(get_current_admin_user)
):
    user = session.get(User, id)
    if not user or user.role != UserRole.CLIENT:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    order_count = session.exec(select(func.count(Order.id)).where(Order.user_id == user.id)).one()
    if order_count > 0:
        raise HTTPException(status_code=400, detail="No se puede eliminar un cliente con pedidos (historial asociado).")
        
    session.delete(user)
    session.commit()
