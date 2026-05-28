# PlataformaIASoberana 🛡️🤖

**PlataformaIASoberana** es una estructura fundacional y código base inicial diseñado para una solución SaaS de **Nodos de IA Soberana**. Esta plataforma permite a clientes corporativos diagnosticar sus necesidades de Inteligencia Artificial de forma privada, explorar un catálogo de Small Language Models (SMLs) especializados, y recibir cotizaciones personalizadas de Nodos de IA para desplegar localmente (on-premises o nube privada dedicada), garantizando cero dependencia de nubes públicas y costos variables recurrentes.

---

## 🏗️ Arquitectura del Monorepo

El proyecto está organizado como un monorepo para facilitar el desarrollo rápido durante la hackathon:

```
PlataformaIASoberana/
├── docker-compose.yml     # Orquestación de contenedores (db, server, client)
├── .env.example           # Plantilla de variables de entorno
├── README.md              # Guía de instalación y uso
├── db/
│   └── init.sql           # Schema SQL y datos seed iniciales para PostgreSQL
├── server/                # API RESTful con Node.js / Express.js
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js       # Entrada principal
│       ├── config/        # Conexión al Pool de Base de Datos
│       ├── middleware/    # Autenticación JWT y validación de roles
│       ├── controllers/   # Lógicas de Auth, SMLs, Diagnósticos y Propuestas
│       └── routes/        # Definición de rutas Express
└── client/                # Aplicación Web React con Vite + Tailwind CSS
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── index.css      # Sistema de diseño, glassmorphism y micro-animaciones
        ├── main.jsx
        ├── App.jsx        # Enrutador de la aplicación
        ├── context/       # Estado de Autenticación Global (AuthContext)
        ├── components/    # Componentes reutilizables (Navbar, ProtectedRoute)
        └── pages/         # Páginas (Home, Login, Register, Dashboards, Wizard, Workspace)
```

---

## ⚡ Requisitos Previos

- **Docker** y **Docker Compose** instalados en tu sistema.

---

## 🚀 Instalación y Despliegue Rápido

1. **Clonar u Obtener el Código** dentro de tu espacio de trabajo.
2. **Crear el archivo `.env`** en la raíz (opcional para ejecución fuera de Docker, los contenedores ya configuran las variables internas por defecto en `docker-compose.yml`):
   ```bash
   cp .env.example .env
   ```
3. **Levantar la plataforma con Docker Compose**:
   ```bash
   docker-compose up --build
   ```
4. **Acceder a la Aplicación**:
   - **Frontend (Cliente React)**: [http://localhost:5173](http://localhost:5173)
   - **Backend (API Express)**: [http://localhost:5000](http://localhost:5000)
   - **Base de Datos (PostgreSQL)**: Puerto `5432`

---

## 🔑 Cuentas de Demostración (Seed Data)

La base de datos se inicializa automáticamente con dos perfiles de prueba para la demo de la hackathon:

### 👤 Perfil Cliente (Empresa)
- **Correo**: `client@acme.com`
- **Contraseña**: `password123`
- **Empresa**: Acme Corporation
- *Este usuario ya posee un diagnóstico y propuesta asociada listos para explorar en el panel.*

### 🛠️ Perfil Administrador
- **Correo**: `admin@soberana.ia`
- **Contraseña**: `password123`
- **Empresa**: Soberana AI Corp
- *Este usuario puede ver todos los diagnósticos, crear propuestas comerciales y gestionar el catálogo de SMLs.*

---

## 📡 Endpoints Clave de la API (Express)

Todos los endpoints (excepto Auth público) requieren la cabecera `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de nuevos clientes/administradores.
- `POST /api/auth/login` - Inicio de sesión y devolución de JWT.
- `POST /api/auth/logout` - Cierre de sesión ficticio.

### Usuarios (`/api/users`)
- `GET /api/users/me` - Retorna los detalles de sesión del usuario logueado.
- `GET /api/users` - Lista todos los usuarios registrados (Solo Administradores).

### Catálogo de Modelos (`/api/smls`)
- `GET /api/smls` - Retorna SMLs activos. (Si se agrega `?all=true` y es Admin, retorna todos).
- `POST /api/smls` - Crea un nuevo modelo en el catálogo (Solo Administradores).
- `PUT /api/smls/:id` - Edita un modelo (Solo Administradores).
- `DELETE /api/smls/:id` - Elimina un modelo del catálogo (Solo Administradores).

### Diagnósticos (`/api/client-needs`)
- `POST /api/client-needs` - Envía el diagnóstico multi-paso (Solo Clientes).
- `GET /api/client-needs` - Retorna los diagnósticos del cliente logueado (o todos si es Admin).
- `PUT /api/client-needs/:id/status` - Actualiza el estado del diagnóstico.

### Propuestas de Nodos (`/api/proposals`)
- `POST /api/proposals` - Genera una propuesta técnica/comercial ligada a un diagnóstico (Solo Administradores).
- `GET /api/proposals` - Lista propuestas activas asociadas.
- `PUT /api/proposals/:id/status` - Acepta o rechaza la propuesta (Client/Admin).
- `DELETE /api/proposals/:id` - Elimina una propuesta (Solo Administradores).

---

## 💎 Diseño Visual y Look Premium

El frontend cuenta con un diseño de interfaz de usuario de alto impacto y nivel empresarial:
- **Mesh de Fondo**: Degradados radiales y oscuros que evocan protección y privacidad.
- **Glassmorphism**: Contenedores translúcidos con desenfoque de fondo y bordes finos de luz.
- **Micro-Animaciones**: Estado pulsante de los Nodos Soberanos para denotar servicios en ejecución.
- **Tipografía Modernizada**: Fuentes `Outfit` e `Inter` integradas para mayor legibilidad y estilo tecnológico.
