from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from db import get_session
from models.user import User
from models.product import Product
from models.cart import CartItem
from schemas.cart import CartItemCreate, CartItemUpdate, CartItemRead
from api.deps import get_current_active_user

router = APIRouter()

def _format_cart_item(item: CartItem, session: Session) -> dict:
    product = session.get(Product, item.product_id)
    if not product:
        return None
    return {
        "id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "quantity": item.quantity,
        "name": product.name,
        "price": product.price,
        "image_url": product.image_url
    }

@router.get("/", response_model=List[CartItemRead])
def get_cart(
    *, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    items = session.exec(select(CartItem).where(CartItem.user_id == current_user.id)).all()
    
    result = []
    for item in items:
        fmt = _format_cart_item(item, session)
        if fmt:
            result.append(fmt)
            
    return result

@router.post("/", response_model=CartItemRead)
def add_to_cart(
    *, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    item_in: CartItemCreate
):
    # Verificar que el producto exista
    product = session.get(Product, item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    # Verificar si ya existe en el carrito
    existing_item = session.exec(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .where(CartItem.product_id == item_in.product_id)
    ).first()
    
    if existing_item:
        existing_item.quantity += item_in.quantity
        session.add(existing_item)
        session.commit()
        session.refresh(existing_item)
        return _format_cart_item(existing_item, session)
        
    new_item = CartItem(
        user_id=current_user.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity
    )
    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    return _format_cart_item(new_item, session)

@router.put("/{product_id}", response_model=CartItemRead)
def update_cart_item(
    *, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    product_id: int,
    item_in: CartItemUpdate
):
    item = session.exec(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .where(CartItem.product_id == product_id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")
        
    if item_in.quantity <= 0:
        session.delete(item)
        session.commit()
        raise HTTPException(status_code=400, detail="Use DELETE para remover items")
        
    item.quantity = item_in.quantity
    session.add(item)
    session.commit()
    session.refresh(item)
    return _format_cart_item(item, session)

@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    *, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    items = session.exec(select(CartItem).where(CartItem.user_id == current_user.id)).all()
    for item in items:
        session.delete(item)
    session.commit()
    return None

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    *, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    product_id: int
):
    item = session.exec(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .where(CartItem.product_id == product_id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")
        
    session.delete(item)
    session.commit()
    return None
