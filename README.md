# BatterySense

Plataforma de monitoreo de bancos de baterías desarrollada por **TRISO**.

## Descripción

BatterySense es un MVP comercial para monitoreo de bancos de baterías que permite:
- Visualizar voltaje, corriente, temperatura y humedad
- Monitorear el estado de celdas individuales
- Gestionar alarmas por umbral
- Exportar datos en CSV

---

## Contexto del Negocio

### ¿Qué es un banco de baterías?

Es un conjunto de baterías conectadas que sirven como **respaldo de energía**. Cuando se corta la luz, el banco entra en acción y mantiene todo funcionando.

### ¿Quiénes son los clientes?

| Tipo de cliente | Para qué | Ejemplo |
|-----------------|----------|---------|
| **Data centers** | Que los servidores no se apaguen nunca | MercadoLibre, bancos |
| **Telecomunicaciones** | Que las antenas sigan funcionando | Claro, Movistar (cada torre celular tiene uno) |
| **Hospitales** | Equipos médicos críticos | Quirófanos, terapia intensiva |
| **Industrias** | Que no se corte la producción | Fábricas con procesos continuos |
| **Edificios corporativos** | Ascensores, sistemas de seguridad | Oficinas, shoppings |

### ¿Pueden tener más de un banco?

Sí, es muy común:
- Un data center puede tener **un banco por sala** de servidores
- Una empresa de telecom tiene **un banco por cada torre celular** (cientos o miles)
- Un hospital puede tener **bancos separados** para quirófanos, terapia, etc.

### El negocio de BatterySense

TRISO vende el **sistema de monitoreo** para que estas empresas:
1. Sepan si las baterías están funcionando bien
2. Reciban alertas si algo falla (antes de que se corte todo)
3. Puedan predecir cuándo cambiar baterías (mantenimiento preventivo)

---

## MODO PROTOTIPO (Solo Frontend)

Este proyecto está configurado para funcionar **sin backend**. Toda la autenticación y datos están simulados para demostración.

### Iniciar el Prototipo

```bash
cd batterysense-front
npm install
npm run dev
```

Abrir `http://localhost:5173`

### NO se necesita:
- ❌ Backend
- ❌ Base de datos MySQL
- ❌ Variables de entorno del servidor

---

## Tecnologías

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router DOM
- Lucide React (iconos)

### Backend (opcional, no requerido para prototipo)
- Node.js + Express
- MySQL
- JWT (autenticación)
- BCrypt (hash de contraseñas)

## Estructura del Proyecto

```
BATTERYSENSE/
├── batterysense-front/          # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   └── Sidebar.jsx      # Menú lateral
│   │   ├── core/
│   │   │   ├── contexts/        # Context API (Auth)
│   │   │   └── routes/          # Rutas protegidas
│   │   ├── features/
│   │   │   └── auth/            # Módulo de autenticación
│   │   └── pages/               # Páginas/Vistas
│   │       ├── Dashboard.jsx    # Dashboard V1
│   │       ├── DashboardV2.jsx  # Dashboard V2 (moderno)
│   │       ├── DashboardV3.jsx  # Dashboard V3 (compacto)
│   │       ├── DashboardV4.jsx  # Dashboard V4 (dark mode)
│   │       ├── ConfiguracionPage.jsx
│   │       ├── UsuariosPage.jsx
│   │       └── ClientesPage.jsx
│   └── package.json
│
├── batterysense-back/           # Backend Express
│   ├── src/
│   │   ├── config/              # Configuración DB
│   │   ├── controllers/         # Controladores
│   │   ├── middleware/          # Middlewares (auth)
│   │   ├── routes/              # Rutas API
│   │   ├── helpers/             # Funciones auxiliares
│   │   └── server.js            # Entrada principal
│   ├── database/
│   │   ├── schema.sql           # Schema de la BD
│   │   └── add_users.sql        # Script para agregar usuarios
│   └── package.json
│
└── README.md
```

## Instalación

### Modo Prototipo (Recomendado para demo)

Solo necesitás el frontend:

```bash
cd batterysense-front
npm install
npm run dev
```

Abrir `http://localhost:5173` y listo.

---

### Modo Completo (Con Backend - Opcional)

<details>
<summary>Click para ver instrucciones del backend</summary>

#### 1. Base de Datos

1. Abrir MySQL Workbench
2. Ejecutar el archivo `batterysense-back/database/schema.sql`
3. (Opcional) Ejecutar `batterysense-back/database/add_users.sql` para usuarios adicionales

#### 2. Backend

```bash
cd batterysense-back
npm install
npm run dev
```

El servidor corre en `http://localhost:3001`

#### 3. Variables de Entorno (Backend)

Crear archivo `.env` en `batterysense-back/`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2020admin
DB_NAME=batterysense
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

#### 4. Frontend

```bash
cd batterysense-front
npm install
npm run dev
```

</details>

---

## Cuentas de Acceso

### Usuarios de Prueba

| Email | Contraseña | Rol | Permisos |
|-------|------------|-----|----------|
| `admin@batterysense.com` | `Admin123!` | Administrador | Acceso total |
| `tecnico@batterysense.com` | `Admin123!` | Técnico | Dashboard + Configuración |
| `cliente@empresa.com` | `Admin123!` | Cliente | Solo Dashboard |

### Roles y Permisos

#### Cliente
- Ver dashboards (V1, V2, V3, V4)
- Exportar datos CSV
- Solo visualización de sus propios datos

#### Técnico
- Todo lo del Cliente
- Configuración de umbrales de alarmas
- Ajuste de parámetros de monitoreo

#### Administrador
- Todo lo del Técnico
- Gestión de usuarios
- Gestión de clientes/instalaciones
- Acceso a todas las instalaciones

---

## Funcionalidades

### Dashboard
- **Voltaje**: Monitoreo en tiempo real por banco y celda
- **Temperatura**: Control de temperatura ambiente
- **Corriente**: Medición de corriente del banco
- **Humedad**: Nivel de humedad del ambiente
- **Alarmas**: Alertas visuales por umbral (crítico, advertencia, normal)
- **Celdas**: Estado individual de cada celda

### Versiones del Dashboard
| Versión | Ruta | Descripción |
|---------|------|-------------|
| V1 | `/dashboard` | Vista original básica |
| V2 | `/dashboard-v2` | Vista moderna mejorada |
| V3 | `/dashboard-v3` | Vista compacta |
| V4 | `/dashboard-v4` | Vista dark mode |

### Exportación CSV
Disponible en Dashboard V2. Genera un archivo con:
- Resumen de bancos
- Detalle de celdas
- Alarmas activas

### Configuración (Técnico/Admin)
- Umbrales de voltaje (mín, máx, advertencia)
- Umbrales de temperatura
- Umbrales de corriente
- Umbrales de humedad

### Gestión de Usuarios (Admin)
- Crear/editar/eliminar usuarios
- Asignar roles
- Activar/desactivar cuentas

### Gestión de Clientes (Admin)
- Ver todas las instalaciones
- Estadísticas por cliente
- Cantidad de bancos y sensores

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/check-email` | Verificar si email existe |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/auth/refresh` | Renovar token |
| GET | `/api/auth/me` | Obtener usuario actual |

---

## Datos del Sistema

### Escala Estimada (Primer Año)
- Hasta 100 sensores por banco
- Entre 1 y 15 bancos por cliente
- Aproximadamente 5 clientes

### Frecuencia de Datos
- JSON cada 15 minutos desde concentradores
- Envío inmediato en caso de alarma/evento

---

## Desarrollo

### Scripts Disponibles

**Frontend:**
```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Preview build
```

**Backend:**
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

---

## Roadmap

- [ ] Integración con Ubidots
- [ ] Integración con ThinkSpeak
- [ ] Gráficos históricos avanzados
- [ ] Notificaciones por email
- [ ] App móvil

---

## Soporte

Desarrollado por **TRISO**

Para soporte técnico contactar al equipo de desarrollo.
