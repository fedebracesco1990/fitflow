# FitFlow

Aplicación full-stack con **Angular 20** y **NestJS 11** + MySQL.

## Stack

| Frontend   | Backend   | Base de Datos |
| ---------- | --------- | ------------- |
| Angular 20 | NestJS 11 | MySQL 8.0     |
| NGXS       | TypeORM   | Docker        |
| SCSS       | JWT Auth  |               |

## Requisitos

- Node.js >= 20.19.0
- Docker Desktop
- Git

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Iniciar MySQL
npm run docker:up
npm run db:wait

# 3. Iniciar backend (los datos se cargan automáticamente)
npm run start:backend

# 4. Iniciar frontend (Terminal 2)
npm run start:frontend
```

**URLs:**

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api

## Estructura

```
fitflow/
├── frontend/          # Angular 20
├── backend/           # NestJS 11
│   └── src/database/seeders/  # Seed automático
├── docker/            # Configuración MySQL
├── docs/              # Documentación
├── package.json       # Scripts raíz (monorepo)
└── docker-compose.yml
```

## Documentación

| Documento                                            | Descripción                            |
| ---------------------------------------------------- | -------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                 | Diagramas de arquitectura del sistema  |
| [COMMANDS.md](./COMMANDS.md)                         | Todos los comandos y referencia rápida |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)               | Guía de desarrollo backend             |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)             | Guía de desarrollo frontend            |
| [FRONTEND_CORE.md](./FRONTEND_CORE.md)               | Documentación del módulo Core          |
| [AI_DEVELOPMENT_GUIDE.md](./AI_DEVELOPMENT_GUIDE.md) | Guía para desarrollo asistido por IA   |

### Documentación Técnica

| Documento                                                   | Descripción                              |
| ----------------------------------------------------------- | ---------------------------------------- |
| [Session Management](./technical/session-management.md)     | Sistema de gestión de sesiones con JWT   |
| [PWA & Service Workers](./technical/pwa-service-workers.md) | Configuración PWA y offline              |
| [WebSocket Real-time](./technical/websocket-tiempo-real.md) | Sistema de notificaciones en tiempo real |
| [Offline Sync](./technical/sincronizacion-offline.md)       | Sincronización de datos offline          |

## Comandos Principales

```bash
npm run dev:backend      # Docker + Backend (día a día)
npm run start:all        # Frontend + Backend
npm run build            # Build completo
npm run lint:fix         # Lint con auto-fix
```

Ver todos los comandos en [COMMANDS.md](./COMMANDS.md).

## Usuarios de Prueba

Se crean automáticamente al iniciar el backend:

| Rol     | Email                | Password    | Estado   |
| ------- | -------------------- | ----------- | -------- |
| ADMIN   | admin@fitflow.com    | Admin123!   | Activo   |
| TRAINER | trainer@fitflow.com  | Trainer123! | Activo   |
| USER    | user1@fitflow.com    | User123!    | Activo   |
| USER    | user2@fitflow.com    | User123!    | Activo   |
| USER    | inactive@fitflow.com | User123!    | Inactivo |

## Autores

- Federico Bracesco
- Bruno Huber
- Joaquin Sena
