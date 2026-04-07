# Sojo Boutique

Sistema de gestión, catálogo y toma de pedidos con panel administrativo premium.

## Cómo ejecutar el proyecto

Este proyecto está dividido en dos partes: el **Frontend** (Next.js) y el **Backend** (FastAPI). Debes ejecutar ambos simultáneamente en dos ventanas diferentes de la terminal para que el sistema funcione completo.

### 1. Ejecutar el Backend (Base de Datos y API)

Abre una terminal y ejecuta los siguientes comandos para activar el entorno de Python y encender el servidor:

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```
*El servidor del backend correrá en `http://localhost:8000`.*

### 2. Ejecutar el Frontend (Interfaz de Usuario)

Abre **una segunda terminal** y ejecuta los siguientes comandos para encender la aplicación de React/Next.js:

```bash
cd frontend
pnpm run dev
```
*(Si usas pnpm, puedes utilizar `pnpm dev`)*.

O para producción:
```bash
cd frontend
pnpm build
pnpm start
```

*El entorno gráfico correrá en `http://localhost:3000`.*

---

**Cuentas Muestra (Admin):**
- Correo: `admin@sojaboutique.com`
- Clave: `admin123`