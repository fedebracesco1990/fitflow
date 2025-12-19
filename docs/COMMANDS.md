# FitFlow - Comandos y Referencia Rápida

## Inicio Rápido

```bash
# Primera vez
npm run install:all
npm run docker:up
npm run db:wait
npm run start:backend    # Datos se cargan automáticamente

# Día a día
npm run dev:backend      # Docker + Backend
npm run start:frontend   # Frontend (opcional)
```

**URLs:**

- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api

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
| `npm run dev:backend`    | Docker + Backend (más usado)   |
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

| Comando                       | Descripción                    |
| ----------------------------- | ------------------------------ |
| `npm run docker:up`           | Iniciar MySQL                  |
| `npm run docker:down`         | Detener MySQL (mantiene datos) |
| `npm run docker:down:volumes` | Detener y borrar datos         |
| `npm run docker:logs`         | Ver logs de MySQL              |
| `npm run docker:restart`      | Reiniciar MySQL                |
| `npm run db:wait`             | Esperar MySQL (35s)            |
| `npm run db:status`           | Ver bases de datos             |
| `npm run db:health`           | Estado del contenedor          |
| `npm run db:verify`           | Ver usuarios creados           |
| `npm run db:reset`            | Reset completo                 |

---

## Scripts por Proyecto

### Frontend (`cd frontend`)

```bash
npm run dev            # Desarrollo (puerto 4200)
npm start              # Producción con serve (para Railway)
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
npm run docker:down:volumes
npm run docker:up
npm run db:wait
npm run start:backend    # Datos se cargan automáticamente
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
netstat -ano | findstr :3000
netstat -ano | findstr :4200
taskkill /PID <PID> /F
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

```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=fit_flow_db
MYSQL_USER=devuser
MYSQL_PASSWORD=devpassword123

# Backend
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=devuser
DB_PASSWORD=devpassword123
DB_DATABASE=fit_flow_db

# JWT
JWT_SECRET=tu-secret-key
JWT_ACCESS_TOKEN_EXPIRATION=900
JWT_REFRESH_TOKEN_EXPIRATION=604800
```
