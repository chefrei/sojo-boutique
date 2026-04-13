import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request
from fastapi.responses import JSONResponse

router = APIRouter()

# La ruta base de nuestro backend
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
# La ruta destino en el frontend para poder servir los archivos de manera estática
FRONTEND_PUBLIC_DIR = BACKEND_DIR.parent / "frontend" / "public"
UPLOAD_DIR = FRONTEND_PUBLIC_DIR / "images" / "productos"

# Aseguramos que la carpeta existe localmente
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass # Podría fallar en entornos de solo lectura, lo manejamos después

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_image(request: Request, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo proporcionado no es una imagen."
        )

    # Generar un nombre único para evitar colisiones
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # 🌩️ INTENTO DE CARGA A CLOUDFLARE R2
    # En Cloudflare Workers, los bindings se pasan en el scope de ASGI
    env = request.scope.get("env")
    r2_bucket = getattr(env, "R2_BUCKET", None) if env else None

    if r2_bucket:
        try:
            content = await file.read()
            # En Python Workers, el binding de R2 tiene el método .put()
            await r2_bucket.put(unique_filename, content, {
                "httpMetadata": {"contentType": file.content_type}
            })
            
            # Ajusta esta URL según tu dominio de R2 o dominio personalizado
            # Por ahora devolvemos una URL relativa o una placeholder
            image_url = f"/images/productos/{unique_filename}" 
            return {"filename": unique_filename, "image_url": image_url, "storage": "r2"}
        except Exception as e:
             print(f"Error subiendo a R2: {e}")
             # Si falla R2, intentamos local por si acaso

    # 📁 CARGA A DISCO LOCAL (FALLBACK / DESARROLLO)
    file_path = UPLOAD_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fallo al guardar la imagen (Local): {str(e)}"
        )

    # URL absoluta apuntando al servidor FastAPI para que el frontend
    # pueda ver las imágenes inmediatamente sin reiniciar Next.js
    image_url = f"http://127.0.0.1:8000/images/productos/{unique_filename}"
    
    return {"filename": unique_filename, "image_url": image_url, "storage": "local"}
