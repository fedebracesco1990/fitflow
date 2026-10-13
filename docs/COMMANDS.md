# FitFlow - Comandos y Referencia Rápida

## Inicio Rápido

```bash
# Primera vez
npm run install:all
cp .env.example .env     # en cmd: copy; completar JWT_SECRET y JWT_REFRESH_SECRET
npm run dev              # MySQL + Mailpit + backend + frontend (el seed carga datos de prueba)

# Día a día
npm run dev
```

**URLs:**

- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api
- Mailpit (emails de desarrollo): http://localhost:8025

Los scripts funcionan igual en Windows, macOS y Linux.

---

## Scripts del Proyecto Raíz

### Instalación y Limpieza

| Comando               | Descripción                                       |
| --------------------- | ------------------------------------------------- |
| `npm run install:all` | Instalar dependencias (raíz + frontend + backend) |
| `npm run clean:all`   | Limpiar node_modules, dist y Docker               |

### Desarrollo

| Comando                  | Descripción                    |
| ------------------------ | ------------------------------ |
| `npm run dev`            | Docker + Backend + Frontend    |
| `npm run dev:backend`    | Docker + Backend               |
| `npm run start:backend`  | Solo backend                   |
| `npm run start:frontend` | Solo frontend                  |
| `npm run start:all`      | Frontend + Backend en paralelo |

### Build

| Comando                  | Descripción    |
| ------------------------ | -------------- |
| `npm run build`          | Build completo |
| `npm run build:frontend` | Solo frontend  |
| `npm run build:backend`  | Solo backend   |

### Calidad de Código

| Comando                | Descripción            |
| ---------------------- | ---------------------- |
| `npm run lint`         | Lint completo          |
| `npm run lint:fix`     | Lint con auto-fix      |
| `npm run format`       | Formatear con Prettier |
| `npm run format:check` | Verificar formato      |

### Docker y Base de Datos

| Comando                       | Descripción                                           |
| ----------------------------- | ----------------------------------------------------- |
| `npm run docker:up`           | Iniciar MySQL y Mailpit, y esperar a que estén listos |
| `npm run docker:down`         | Detener MySQL (mantiene datos)                        |
| `npm run docker:down:volumes` | Detener y borrar datos                                |
| `npm run docker:logs`         | Ver logs de MySQL                                     |
| `npm run docker:restart`      | Reiniciar MySQL                                       |
| `npm run db:wait`             | Esperar a que MySQL esté listo (healthcheck)          |
| `npm run db:status`           | Ver bases de datos                                    |
| `npm run db:health`           | Estado del contenedor                                 |
| `npm run db:verify`           | Ver usuarios creados                                  |
| `npm run db:verify:count`     | Contar usuarios                                       |
| `npm run db:reset`            | Reset completo (**borra los datos**)                  |

---

## Scripts por Proyecto

### Frontend (`cd frontend`)

```bash
npm run dev            # Desarrollo (puerto 4200)
npm start              # Sirve el build de producción ($PORT, 4200 por defecto)
npm run build          # Build producción
npm run lint           # ESLint
npm run lint:fix       # ESLint con fix
```

### Backend (`cd backend`)

```bash
npm run start:dev      # Desarrollo con hot reload
npm run build          # Build
npm run lint           # ESLint
npm run lint:fix       # ESLint con fix
```

---

## Generación de Código

### Frontend (Angular)

```bash
cd frontend
ng g c features/[feature]/pages/[name]    # Componente
ng g s core/services/[name]               # Servicio
ng g guard core/guards/[name]             # Guard
```

### Backend (NestJS)

```bash
cd backend
nest g res modules/[name]                 # CRUD completo
nest g s modules/[name]/[name]            # Servicio
nest g co modules/[name]/[name]           # Controller
```

---

## Usuarios de Prueba

### Credenciales

| Rol          | Email                | Password    |
| ------------ | -------------------- | ----------- |
| **ADMIN**    | admin@fitflow.com    | Admin123!   |
| **TRAINER**  | trainer@fitflow.com  | Trainer123! |
| **USER**     | user1@fitflow.com    | User123!    |
| **USER**     | user2@fitflow.com    | User123!    |
| **INACTIVO** | inactive@fitflow.com | User123!    |

> Solo en desarrollo: el seed no corre con `NODE_ENV=production`, así que estos usuarios no existen en producción.

### Permisos

| Acción                         |  ADMIN   |   TRAINER    | USER |
| ------------------------------ | :------: | :----------: | :--: |
| Ver su perfil                  |    ✅    |      ✅      |  ✅  |
| Editar su perfil               |    ✅    |      ✅      |  ✅  |
| Listar usuarios                | ✅ todos | ✅ solo USER |  ❌  |
| Crear/Editar/Eliminar usuarios |    ✅    |      ❌      |  ❌  |

---

## Workflows Comunes

### Reset Completo de BD

```bash
npm run docker:down:volumes   # borra los datos
npm run docker:up             # espera a que MySQL esté listo
npm run start:backend         # el seed vuelve a cargar los datos de prueba
```

### Nueva Feature

```bash
git checkout -b feature/nombre

# Backend
cd backend && nest g res modules/nombre && cd ..

# Frontend
cd frontend && ng g c features/nombre/pages/list && cd ..

npm run lint:fix
git add . && git commit -m "feat: descripción"
git push origin feature/nombre
```

---

## Troubleshooting

### Puerto en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :3000
kill <PID>
```

### MySQL no conecta

```bash
npm run docker:logs      # Ver logs
npm run db:health        # Ver estado
npm run docker:restart   # Reiniciar
```

### Reinstalar todo

```bash
npm run clean:all
npm run install:all
```

---

## Variables de Entorno (.env)

Todas las variables están documentadas en [`.env.example`](../.env.example), en la raíz del repo. El `.env` de la raíz lo leen tanto `docker-compose` como el backend.

| Grupo               | Variables                                                                                                   | Obligatorias                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| MySQL (Docker)      | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`                                     | Sí, para `docker-compose`           |
| Base de datos       | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL`, `DB_SYNCHRONIZE`, `DB_LOGGING` | Host, usuario, clave y base         |
| Aplicación          | `NODE_ENV`, `PORT`, `FRONTEND_URL`, `ALLOWED_ORIGINS`                                                       | No (tienen valor por defecto)       |
| JWT                 | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`           | Los dos secretos (32+ caracteres)   |
| QR de acceso        | `QR_JWT_SECRET`, `QR_JWT_EXPIRES_IN`                                                                        | No                                  |
| Notificaciones push | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`                                      | No (sin ellas no hay push)          |
| Email               | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`                          | No (sin `SMTP_HOST` solo se loguea) |

Para generar un secreto:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
