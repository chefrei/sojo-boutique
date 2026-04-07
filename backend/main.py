from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from db import init_db
from api.v1 import auth, products, admin, orders

# Configuración de compatibilidad para Cloudflare Workers
try:
    from workers import WorkerEntrypoint
    import asgi
    HAS_CLOUDFLARE_LIBS = True
except ImportError:
    HAS_CLOUDFLARE_LIBS = False

app = FastAPI(
    title="Soho Boutique API",
    description="Backend para el marketplace de Soho Boutique",
    version="0.1.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Soho Boutique", "status": "online"}

from api.v1 import auth, products, admin, orders, upload, customers

# Registro de routers v1
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Finance"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Uploads"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])

# Servir imágenes estáticas directamente desde el backend
# Esto evita la necesidad de reiniciar Next.js para ver imágenes nuevas
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public" / "images" / "productos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/images/productos", StaticFiles(directory=str(UPLOAD_DIR)), name="product-images")

# Puente ASGI oficial para Cloudflare Workers (solo se activa en la nube)
if HAS_CLOUDFLARE_LIBS:
    class Default(WorkerEntrypoint):
        async def fetch(self, request):
            return await asgi.fetch(app, request, self.env)
