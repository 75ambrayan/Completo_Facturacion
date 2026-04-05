# FacturaPY — Sistema de Facturación Electrónica Perú

Sistema completo de facturación electrónica con integración SUNAT, consulta de RUC/DNI (RENIEC), canje de boleta a factura y notas de crédito.

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Edita .env con tus tokens
npm run dev        # http://localhost:3001

# 2. Frontend (otra terminal)
cd frontend
npm install
npm start          # http://localhost:3000
```

### Opción 2: Docker

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

---

## 🗄️ Base de Datos (SQLite)

La BD se crea automáticamente en `data/facturacion.db`. Tablas:

| Tabla | Descripción |
|-------|-------------|
| `configuracion` | RUC empresa, series, tokens API |
| `categorias` | Categorías de productos |
| `productos` | Catálogo de productos/servicios |
| `clientes` | Clientes con DNI/RUC |
| `comprobantes` | Boletas (03), Facturas (01), NC (07) |
| `comprobante_items` | Líneas de detalle |
| `sunat_log` | Log de comunicación SUNAT |

---

## 📋 Funcionalidades

### ✅ Comprobantes
- **Boletas de Venta** (Serie B001) — para consumidor final con DNI
- **Facturas** (Serie F001) — requiere RUC del cliente
- **Notas de Crédito** (Serie BC01) — anulación/devolución
- **Canje Boleta → Factura** — con validación de RUC

### ✅ Consulta RENIEC / SUNAT
Usa múltiples APIs con fallback automático:
1. [apisperu.com](https://dniruc.apisperu.com) (gratis, token requerido)
2. [apis.net.pe](https://apis.net.pe) (gratis, token requerido)
3. Factiluz (alternativa)

### ✅ Facturación Electrónica SUNAT
Soporta dos proveedores:
- **Nubefact** (recomendado) — [nubefact.com](https://nubefact.com)
- **Facturalo.pe** — [facturalo.pe](https://facturalo.pe)

---

## 🔑 Configuración de Tokens

### Para consulta DNI/RUC (RENIEC)
```env
# Registrate gratis en https://dniruc.apisperu.com
APISPERU_TOKEN=tu_jwt_token

# O en https://apis.net.pe
APISNETPE_TOKEN=apis-token-xxxx.yyyy
```

### Para Facturación Electrónica (SUNAT)
```env
# Nubefact - crea cuenta en https://nubefact.com
NUBEFACT_TOKEN=tu_token_nubefact
NUBEFACT_RUC=20123456789
```

---

## 🌐 API REST del Backend

```bash
# Consultas RENIEC/SUNAT
GET  /api/consulta/dni/:dni
GET  /api/consulta/ruc/:ruc

# Comprobantes
GET  /api/comprobantes             # listar (filtros: tipo, estado, desde, hasta, q)
GET  /api/comprobantes/:id         # detalle con items
POST /api/comprobantes             # crear boleta/factura
POST /api/comprobantes/:id/emitir  # enviar a SUNAT
POST /api/comprobantes/:id/canjear # canje boleta → factura
POST /api/comprobantes/:id/nota-credito  # anular

# Catálogo
GET  /api/categorias
POST /api/categorias
GET  /api/productos
POST /api/productos

# Configuración
GET  /api/configuracion
POST /api/configuracion
```

---

## 📦 Estructura del Proyecto

```
facturacion/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server + rutas
│   │   ├── database.js           # SQLite schema + seed
│   │   ├── controllers/
│   │   │   ├── comprobantes.controller.js
│   │   │   └── otros.controller.js
│   │   └── services/
│   │       └── sunat.service.js  # APIs DNI/RUC + Nubefact
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.js                # UI completa React
│       └── services/api.js       # Cliente HTTP
└── docker-compose.yml
```

---

## 💡 Modo Demo

Sin tokens configurados, el sistema funciona en **modo demo**:
- Las consultas RUC/DNI devuelven datos de ejemplo
- Los comprobantes se marcan como `ACEPTADO` localmente sin ir a SUNAT
- Perfecto para desarrollo y testing

---

## 📝 Notas importantes

- **Ambiente beta** vs **producción**: En configuración puedes alternar. En beta se usa la URL de pruebas de SUNAT.
- **IGV**: Configurado al 18% por defecto, modificable en configuración.
- **Unidades de medida SUNAT**: NIU (unidad), ZZ (unidad no habitual), KGM (kilogramo), LTR (litro), HUR (hora), etc.
- El sistema calcula automáticamente base imponible, IGV y totales según si el producto es gravado o exonerado.
