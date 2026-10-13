# FitFlow

Aplicación web para la gestión de gimnasios: socios, membresías y pagos, rutinas y planes semanales, registro de entrenamientos y progreso, control de acceso por QR, notificaciones push y reportes. Funciona como PWA, con modo offline para los entrenamientos.

**Roles:** administrador, entrenador y socio.

## Stack

| Frontend                | Backend                     | Infraestructura                |
| ----------------------- | --------------------------- | ------------------------------ |
| Angular 20 (standalone) | NestJS 11                   | MySQL 8.0 (Docker)             |
| NGXS                    | TypeORM                     | Mailpit (emails de desarrollo) |
| PWA + Dexie (offline)   | JWT + Passport              | Firebase Cloud Messaging       |
| Chart.js, socket.io     | socket.io, pdfmake, exceljs |                                |

## Inicio rápido

Requisitos: Node.js 20.19 o superior y Docker Desktop.

```bash
npm run install:all
cp .env.example .env    # en cmd: copy; completar JWT_SECRET y JWT_REFRESH_SECRET
npm run dev             # MySQL + Mailpit + backend + frontend
```

| Servicio | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost:4200     |
| API      | http://localhost:3000/api |
| Mailpit  | http://localhost:8025     |

En desarrollo el backend carga datos de prueba. Usuario administrador: `admin@fitflow.com` / `Admin123!` (los demás están en [docs/README.md](docs/README.md#usuarios-de-prueba)).

## Documentación

- [Comandos y variables de entorno](docs/COMMANDS.md)
- [Arquitectura](docs/ARCHITECTURE.md) y [flujos de usuario](docs/USER_FLOWS.md)
- [Modelo de datos](docs/DATABASE_SCHEMA.md) y [diccionario de datos](docs/DATA_DICTIONARY.md)
- [API del backend](docs/backend-api/README.md), por módulo
- Guías de desarrollo: [backend](docs/BACKEND_GUIDE.md) y [frontend](docs/FRONTEND_GUIDE.md)
- [Manuales de usuario](docs/user_manuals/)
- [Plan de pruebas](docs/plan_de_pruebas.md)

## Autores

- Federico Bracesco
- Bruno Huber
- Joaquin Sena
