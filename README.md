# Sojo Boutique (White-Label Platform)

Sistema de gestión, catálogo y toma de pedidos con panel administrativo premium, ahora evolucionado a una plataforma de **Marca Blanca** (White-Label) totalmente personalizable.

## ✨ Nuevas Características Premium

- **Personalización de Marca Blanca**: Cambia el logo, nombre del negocio, colores de la interfaz (Primario/Acento) y tipografías de Google Fonts directamente desde el panel administrativo.
- **Inteligencia de Negocios (Reportes)**:
  - **Estado de Cuenta (Kardex)**: Historial cronológico detallado por cliente con cálculo de saldos acumulados.
  - **Resumen Financiero**: Análisis consolidado de ventas vs. recaudación por rangos de fechas.
- **Exportación Universal**: Generación de reportes dinámicos en PDF y CSV con identidad corporativa inyectada automáticamente.

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

---

**Cuentas Muestra (Admin):**
- Correo: `admin@sojaboutique.com`
- Clave: `admin123`