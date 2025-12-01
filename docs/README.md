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

# 3. Iniciar backend (Terminal 1)
npm run start:backend

# 4. Crear usuarios de prueba (Terminal 2)
node scripts/seed-users.js

# 5. Iniciar frontend (opcional)
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
├── docker/            # Configuración MySQL
├── docs/              # Documentación
├── scripts/           # Scripts de utilidad
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
| [AI_DEVELOPMENT_GUIDE.md](./AI_DEVELOPMENT_GUIDE.md) | Guía para desarrollo asistido por IA   |

## Comandos Principales

```bash
npm run dev:backend      # Docker + Backend (día a día)
npm run start:all        # Frontend + Backend
npm run build            # Build completo
npm run lint:fix         # Lint con auto-fix
```

Ver todos los comandos en [COMMANDS.md](./COMMANDS.md).

## Usuarios de Prueba

| Rol     | Email               | Password    |
| ------- | ------------------- | ----------- |
| ADMIN   | admin@fitflow.com   | Admin123!   |
| TRAINER | trainer@fitflow.com | Trainer123! |
| USER    | user1@fitflow.com   | User123!    |

## Autores

- Federico Bracesco
- Bruno Huber
- Joaquin Sena
