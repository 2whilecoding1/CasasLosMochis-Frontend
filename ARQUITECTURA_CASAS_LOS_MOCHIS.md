# 🏠 ARQUITECTURA TÉCNICA - CASAS LOS MOCHIS
## Plataforma Inmobiliaria (Catálogo + CRM)

**Versión:** 1.0 MVP  
**Fecha:** Abril 2026  
**Stack:** React + Vite + Tailwind | Node.js/Express | PostgreSQL

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Aplicación](#arquitectura-de-aplicación)
4. [Base de Datos](#base-de-datos)
5. [Almacenamiento de Imágenes](#almacenamiento-de-imágenes)
6. [API REST](#api-rest)
7. [Autenticación](#autenticación)
8. [Deployment](#deployment)
9. [Costos Estimados](#costos-estimados)

---

## 🎯 VISIÓN GENERAL

**Casas Los Mochis** es una plataforma inmobiliaria con dos capas:

### Capa Pública (Catálogo)
- Listado de propiedades en venta y renta
- Filtros avanzados (precio, tipo, ubicación, características)
- Vista detallada de cada propiedad
- Galería de fotos interactiva
- Formulario de contacto por correo/WhatsApp

### Capa Privada (CRM)
- Dashboard para propietarios/agentes
- Gestión de propiedades
- Seguimiento de clientes (leads)
- Historial de interacciones
- Contratos de venta y renta
- Reportes de actividad

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
```
React 18 + Vite
├── Tailwind CSS (estilos)
├── shadcn/ui (componentes base)
├── Zustand (estado global)
├── TanStack Query/React Query (caché de datos)
├── React Router v6 (navegación)
├── Leaflet (mapas)
├── React Hook Form (formularios)
├── Zod (validación)
├── Axios (cliente HTTP)
└── SweetAlert2 (modales/notificaciones)
```

### Backend
```
Node.js 18+
├── Express.js (servidor HTTP)
├── PostgreSQL (base de datos)
├── JWT (autenticación)
├── Sharp (procesamiento de imágenes)
├── Multer (manejo de uploads)
├── Cors (seguridad)
├── Dotenv (variables de entorno)
├── Joi/Zod (validación)
├── Winston (logging)
└── Nodemon (desarrollo)
```

### Base de Datos
```
PostgreSQL 13+
├── PostGIS (geolocalización - opcional)
├── Full Text Search (búsqueda mejorada)
├── JSON/JSONB (metadatos flexibles)
└── Índices personalizados (búsqueda rápida)
```

---

## 🏗️ ARQUITECTURA DE APLICACIÓN

### Estructura Frontend

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Catalog.jsx (lista de propiedades)
│   │   ├── PropertyDetail.jsx (detalle individual)
│   │   ├── Login.jsx
│   │   └── CRM/
│   │       ├── Dashboard.jsx
│   │       ├── PropertiesManager.jsx
│   │       ├── LeadsList.jsx
│   │       ├── LeadDetail.jsx
│   │       ├── Interactions.jsx
│   │       ├── Contracts.jsx
│   │       └── Reports.jsx
│   │
│   ├── components/
│   │   ├── Catalog/
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── PropertyGallery.jsx
│   │   ├── Forms/
│   │   │   ├── ContactForm.jsx
│   │   │   ├── PropertyForm.jsx
│   │   │   └── LeadForm.jsx
│   │   └── Common/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   └── useLeads.js
│   │
│   ├── stores/
│   │   ├── authStore.js (Zustand)
│   │   └── filterStore.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── propertiesService.js
│   │   └── leadsService.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Estructura Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── properties.js
│   │   ├── images.js
│   │   ├── leads.js
│   │   ├── interactions.js
│   │   ├── contracts.js
│   │   └── auth.js
│   │
│   ├── controllers/
│   │   ├── propertyController.js
│   │   ├── imageController.js
│   │   ├── leadController.js
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   │
│   ├── utils/
│   │   ├── imageProcessor.js (Sharp)
│   │   └── logger.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── db/
│   │   ├── migrations/
│   │   └── schema.sql
│   │
│   ├── uploads/
│   │   ├── properties/
│   │   └── agents/
│   │
│   └── index.js
│
├── .env.example
└── package.json
```

---

## 💾 BASE DE DATOS

### Tablas Principales

- **users** - Propietarios/agentes
- **properties** - Catálogo de propiedades
- **property_images** - Fotos
- **leads** - Clientes (CRM)
- **interactions** - Historial de contactos
- **rent_contracts** - Contratos de renta
- **sales_contracts** - Contratos de venta
- **amenities** - Equipamiento

Ver **schema.sql** para detalles completos.

---

## 🖼️ ALMACENAMIENTO DE IMÁGENES

### Estrategia: Filesystem Local + Cloudflare CDN

**Estructura:**
```
backend/uploads/
├── properties/
│   ├── 123-original.jpg
│   ├── 123-main.webp
│   └── 123-thumb.webp
└── agents/
    └── user-456-avatar.webp
```

**Tamaños por propiedad:** 25-40 MB (8 fotos optimizadas)  
**Costo:** ~$10-15/mes para 1000 propiedades

**Optimización con Sharp:**
- Original: máx 2000x2000px, WebP 75% quality
- Thumbnail: 300x300px, WebP 80% quality

---

## 🔌 API REST - PRINCIPALES ENDPOINTS

```
# Autenticación
POST   /api/auth/login
POST   /api/auth/register

# Propiedades (público)
GET    /api/properties?tipo=casa&ciudad=Los%20Mochis&precio_max=500000
GET    /api/properties/:id
POST   /api/properties (autenticado)
PUT    /api/properties/:id
DELETE /api/properties/:id

# Imágenes
POST   /api/images (subir fotos)
DELETE /api/images/:imageId

# CRM - Clientes
GET    /api/leads
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id

# Interacciones
GET    /api/leads/:leadId/interactions
POST   /api/interactions
PUT    /api/interactions/:id

# Contratos
POST   /api/contracts/rent
POST   /api/contracts/sale
GET    /api/contracts/:id
PUT    /api/contracts/:id
```

---

## 🔐 AUTENTICACIÓN

- JWT con tokens de acceso (15 min) y refresh (7 días)
- Contraseñas hasheadas con bcrypt
- Roles: admin, propietario, agente

---

## 🚀 DEPLOYMENT

**Frontend:** Vercel (gratis)  
**Backend:** Railway ($7-15/mes)  
**Base de datos:** Railway (incluida)  
**CDN:** Cloudflare (gratis)  

---

## 📊 COSTOS MENSUALES

| Servicio | Costo |
|----------|-------|
| Servidor + BD | $7-15 |
| Dominio | $1-3 |
| Total | **$10-20 USD/mes** |

---

**Estado:** Listo para Desarrollo  
**Versión:** 1.0 MVP
