from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from db import get_session
from models.user import User
from models.product import Product
from models.wishlist import Wishlist
from api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[int])
def get_wishlist(
    *, session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna los IDs de los productos en la lista de deseos del usuario.
    """
    statement = select(Wishlist.product_id).where(Wishlist.user_id == current_user.id)
    items = session.exec(statement).all()
    return items

@router.post("/toggle/{product_id}")
def toggle_wishlist_item(
    *, session: Session = Depends(get_session),
    product_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Agrega o elimina un producto de la lista de deseos.
    """
    # Verificar que el producto exista
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    statement = select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id)
    existing_item = session.exec(statement).first()
    
    if existing_item:
        session.delete(existing_item)
        session.commit()
        return {"action": "removed", "productId": product_id}
    else:
        new_item = Wishlist(user_id=current_user.id, product_id=product_id)
        session.add(new_item)
        session.commit()
        return {"action": "added", "productId": product_id}

@router.get("/check/{product_id}")
def check_wishlist_item(
    *, session: Session = Depends(get_session),
    product_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Verifica si un producto está en la lista de deseos.
    """
    statement = select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id)
    item = session.exec(statement).first()
    return {"inWishlist": item is not None}
