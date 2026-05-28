# ProxDeep — Frontend Build de Producción (Demo Estático)

Esta carpeta contiene el frontend de ProxDeep compilado y listo para subir a S3 u otro hosting estático.

## 📦 Contenido

```
proxdeep-dist/
├── index.html              ← Punto de entrada principal
├── _redirects              ← Regla SPA para Netlify/Cloudflare Pages
└── assets/
    ├── index-*.css         ← Estilos compilados (TailwindCSS purificado)
    └── index.demo-*.js     ← Bundle JavaScript completo (React + toda la app)
```

## 🚀 Subir a AWS S3

### 1. Crear bucket S3

```bash
aws s3 mb s3://proxdeep-frontend --region us-east-1
```

### 2. Habilitar Static Website Hosting

```bash
aws s3 website s3://proxdeep-frontend \
  --index-document index.html \
  --error-document index.html
```

> **IMPORTANTE:** El `error-document` también debe ser `index.html` para que el routing de React funcione (SPA routing).

### 3. Subir archivos

```bash
aws s3 sync . s3://proxdeep-frontend \
  --exclude "*.md" \
  --exclude "_redirects" \
  --cache-control "max-age=31536000,immutable" \
  --exclude "index.html"

# El index.html NO debe tener caché agresivo
aws s3 cp index.html s3://proxdeep-frontend/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"
```

### 4. Política de bucket (hacerlo público)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::proxdeep-frontend/*"
  }]
}
```

## 🌐 Con CloudFront (HTTPS)

Si usas CloudFront, configura el **Custom Error Response**:

| HTTP Error Code | Response Path | HTTP Response Code |
|---|---|---|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

## 🎭 Modo Demo

Esta build incluye **datos de demostración precargados** — no requiere backend:

- ✅ Home page completa
- ✅ Catálogo de 9 SMLs (mock)
- ✅ Login/Register funcional (acepta cualquier credencial)
- ✅ Dashboard con métricas y propuesta demo
- ✅ Diagnóstico / Arquitecto de Infraestructura
- ✅ Workspace con chat playground (respuestas locales)
- ✅ Bot asistente flotante
- ✅ Completamente responsive (móvil, tablet, desktop)

## 🔧 Para conectar a backend real

1. Edita `client/.env.demo` → cambia `VITE_DEMO_MODE=false`
2. Agrega `VITE_API_URL=https://tu-backend.com/api`
3. Ejecuta el build de nuevo: `cd client && npm run build -- --config vite.config.demo.js --mode demo`
