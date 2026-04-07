from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from db import get_session
from models.product import Product
from models.category import Category
from schemas.product import ProductRead, ProductCreate, ProductUpdate, CategoryRead, CategoryCreate
from api.deps import get_current_admin_user

router = APIRouter()

# --- CATEGORÍAS ---

@router.get("/categories", response_model=List[CategoryRead])
def read_categories(
    *, session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=100, lte=100)
):
    categories = session.exec(select(Category).offset(offset).limit(limit)).all()
    return categories

@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    *, session: Session = Depends(get_session),
    category_in: CategoryCreate,
    current_admin: str = Depends(get_current_admin_user)
):
    # Verificar si el slug ya existe
    existing_category = session.exec(select(Category).where(Category.slug == category_in.slug)).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="El slug de la categoría ya existe.")
    
    db_category = Category.model_validate(category_in)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

# --- PRODUCTOS ---

@router.get("/", response_model=List[ProductRead])
def read_products(
    *, session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    statement = select(Product)
    if category_id:
        statement = statement.where(Product.category_id == category_id)
    if min_price:
        statement = statement.where(Product.price >= min_price)
    if max_price:
        statement = statement.where(Product.price <= max_price)
        
    products = session.exec(statement.offset(offset).limit(limit)).all()
    return products

@router.get("/{id}", response_model=ProductRead)
def read_product(
    *, session: Session = Depends(get_session),
    id: int
):
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    *, session: Session = Depends(get_session),
    product_in: ProductCreate,
    current_admin: str = Depends(get_current_admin_user)
):
    db_product = Product.model_validate(product_in)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product
    
@router.patch("/{id}", response_model=ProductRead)
def update_product(
    *, session: Session = Depends(get_session),
    id: int,
    product_in: ProductUpdate,
    current_admin: str = Depends(get_current_admin_user)
):
    db_product = session.get(Product, id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product_data = product_in.model_dump(exclude_unset=True)
    for key, value in product_data.items():
        setattr(db_product, key, value)
        
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    *, session: Session = Depends(get_session),
    id: int,
    current_admin: str = Depends(get_current_admin_user)
):
    db_product = session.get(Product, id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    session.delete(db_product)
    session.commit()
    return None
