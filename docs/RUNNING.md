# Guía de Ejecución del Proyecto - FitFlow

Esta guía explica cómo ejecutar FitFlow en diferentes modos y entornos, además de comandos útiles para el desarrollo diario.

## 📋 Tabla de Contenidos

1. [Desarrollo Local](#desarrollo-local)
2. [Gestión de Base de Datos](#gestión-de-base-de-datos)
3. [Usuarios de Prueba](#usuarios-de-prueba)
4. [Testing](#testing)
5. [Linting y Formateo](#linting-y-formateo)
6. [Generación de Código](#generación-de-código)
7. [Workflows Esenciales](#workflows-esenciales)

---

## 🚀 Desarrollo Local

### Inicio Rápido - Día a Día

```powershell
# Opción 1: Solo Backend (más común)
npm run dev:backend

# Opción 2: Frontend + Backend
npm run start:all
```

**Acceder a:**

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **MySQL**: localhost:3306

### Primera Vez / Después de Reset

```powershell
# Terminal 1: Reset de base de datos
npm run docker:down:volumes
npm run docker:up
npm run db:wait

# Terminal 2: Iniciar backend
npm run start:backend

# Terminal 1: Crear usuarios de prueba
node scripts/seed-users.js

# Verificar usuarios creados
npm run db:verify
```

### Ejecutar Servicios por Separado

#### Backend (Terminal 1)

```powershell
npm run start:backend

# O directamente
cd backend
npm run start:dev
```

**Características:**

- ✅ Hot reload activado
- ✅ TypeORM sincroniza automáticamente con synchronize: true
- ✅ Logs de queries SQL (si DB_LOGGING=true)
- ✅ Servidor en http://localhost:3000/api

**Mensajes esperados:**

```
[Nest] INFO [InstanceLoader] ConfigModule dependencies initialized
[Nest] INFO [TypeOrmModule] Database connection established
[Nest] INFO [RoutesResolver] AuthController {/api/auth}:
[Nest] INFO [RoutesResolver] Mapped {/api/auth/register, POST} route
[Nest] INFO [RoutesResolver] Mapped {/api/auth/login, POST} route
Backend running on http://localhost:3000/api
Environment: development
```

#### Frontend (Terminal 2)

```powershell
npm run start:frontend

# O directamente
cd frontend
npm start
```

**Características:**

- ✅ Hot reload activado
- ✅ Compilación incremental
- ✅ Servidor en http://localhost:4200

---

## 🗄️ Gestión de Base de Datos

### Scripts Disponibles

| Comando                       | Descripción                                     |
| ----------------------------- | ----------------------------------------------- |
| `npm run docker:up`           | Levantar MySQL                                  |
| `npm run docker:down`         | Detener MySQL (mantiene datos)                  |
| `npm run docker:down:volumes` | Detener y eliminar volúmenes (⚠️ borra datos)   |
| `npm run docker:logs`         | Ver logs de MySQL                               |
| `npm run docker:ps`           | Ver contenedores de FitFlow                     |
| `npm run db:wait`             | Esperar 35 segundos (para que MySQL esté listo) |
| `npm run db:status`           | Ver qué bases de datos existen                  |
| `npm run db:health`           | Ver estado de salud del contenedor              |
| `npm run db:verify`           | Ver usuarios creados                            |
| `npm run db:verify:count`     | Contar usuarios                                 |
| `npm run db:reset`            | Reset completo de base de datos                 |

### Crear Usuarios de Prueba

```powershell
# Asegurarte que el backend está corriendo
npm run start:backend

# En otra terminal
node scripts/seed-users.js

# Verificar
npm run db:verify
```

### Conectar a MySQL

#### Desde línea de comandos (Docker)

```powershell
# Conectar al contenedor
docker exec -it fitflow-mysql mysql -u devuser -pdevpassword123

# Comandos SQL útiles:
SHOW DATABASES;
USE fit_flow_db;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
EXIT;
```

#### Desde MySQL Workbench o DBeaver

**Configuración de conexión:**

- Host: `localhost`
- Puerto: `3306`
- Usuario: `devuser`
- Contraseña: `devpassword123`
- Base de datos: `fit_flow_db`

### Resetear Base de Datos

⚠️ **Esto eliminará todos los datos**:

```powershell
# Reset completo
npm run docker:down:volumes
npm run docker:up
npm run db:wait

# Iniciar backend (en otra terminal)
npm run start:backend

# Recrear usuarios (en otra terminal)
node scripts/seed-users.js
```

---

## 👥 Usuarios de Prueba

### Credenciales por Defecto

| Rol         | Email                | Password    | Estado      |
| ----------- | -------------------- | ----------- | ----------- |
| **ADMIN**   | admin@fitflow.com    | Admin123!   | Activo ✅   |
| **TRAINER** | trainer@fitflow.com  | Trainer123! | Activo ✅   |
| **USER**    | user1@fitflow.com    | User123!    | Activo ✅   |
| **USER**    | user2@fitflow.com    | User123!    | Activo ✅   |
| **USER**    | inactive@fitflow.com | User123!    | Inactivo ❌ |

**Ver documentación completa:** [USUARIOS.md](./USUARIOS.md)

---

## 🧪 Testing

### Tests del Backend

```powershell
# Tests unitarios
npm run test:backend

# Tests con coverage
cd backend
npm run test:cov

# Ver reporte de coverage
cd coverage
start lcov-report/index.html
```

### Tests del Frontend

```powershell
# Tests unitarios
npm run test:frontend

# Tests con coverage
cd frontend
npm run test -- --code-coverage

# Ver reporte
cd coverage
start index.html
```

---

## 🎨 Linting y Formateo

### ESLint

```powershell
# Lint completo
npm run lint

# Lint con fix automático
npm run lint:fix

# Solo frontend
npm run lint:frontend

# Solo backend
npm run lint:backend
```

### Prettier

```powershell
# Formatear todo
npm run format

# Solo verificar (no modifica)
npm run format:check
```

### Pre-commit Hooks

Los hooks se ejecutan automáticamente:

```powershell
# Hacer cambios
git add .

# Commit (se ejecuta lint-staged automáticamente)
git commit -m "feat: nueva funcionalidad"
```

---

## ⚡ Generación de Código

### Frontend (Angular)

```powershell
cd frontend

# Componente
ng generate component pages/home
ng g c components/header --skip-tests

# Servicio
ng generate service services/auth
ng g s services/api

# Módulo
ng generate module modules/shared --routing
ng g m modules/core

# Guard
ng generate guard guards/auth

# Interceptor
ng generate interceptor interceptors/auth
```

### Backend (NestJS)

```powershell
cd backend

# Recurso completo (CRUD)
nest generate resource workouts
nest g res exercises --no-spec

# Módulo
nest generate module health
nest g mo logger

# Controlador
nest generate controller health
nest g co api/v1

# Servicio
nest generate service email
nest g s notifications

# Guard
nest generate guard guards/roles
nest g gu guards/api-key

# Middleware
nest generate middleware middlewares/logger
```

---

## 📄 Workflows Esenciales

### 1. Inicio Diario

```powershell
# Si Docker ya está corriendo con datos
npm run docker:up

# Iniciar backend
npm run start:backend

# En otra terminal: iniciar frontend (opcional)
npm run start:frontend
```

### 2. Reset Completo de Base de Datos

```powershell
# 1. Reset
npm run docker:down:volumes
npm run docker:up

# 2. Esperar MySQL
npm run db:wait

# 3. Iniciar backend (en otra terminal)
npm run start:backend

# 4. Crear usuarios (en otra terminal)
node scripts/seed-users.js

# 5. Verificar
npm run db:verify
```

### 3. Nueva Funcionalidad

```powershell
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar con hot reload
npm run start:backend

# 3. Backend: Crear recurso
cd backend
nest generate resource workouts
cd ..

# 4. Frontend: Crear componente y servicio (opcional)
cd frontend
ng generate component pages/workouts
ng generate service services/workouts
cd ..

# 5. Formatear y lint
npm run lint:fix
npm run format

# 6. Tests
npm run test

# 7. Commit (Husky ejecuta automáticamente)
git add .
git commit -m "feat: agregar tracking de workouts"

# 8. Push
git push origin feature/nueva-funcionalidad
```

---

## 🛠 Solución de Problemas Comunes

### "Error: Connection lost"

```powershell
# Esperar más tiempo
npm run docker:down
npm run docker:up
npm run db:wait
timeout /t 10
npm run start:backend
```

### "Usuario ya existe" al hacer seed

```powershell
# Es normal, los usuarios ya existen
# Para recrearlos:
npm run docker:down:volumes
npm run docker:up
npm run db:wait
npm run start:backend
node scripts/seed-users.js
```

### Puerto en uso

```powershell
# Ver qué usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :4200

# Matar proceso
taskkill /PID <PID> /F
```

### Backend no conecta a MySQL

```powershell
# Ver logs
npm run docker:logs

# Verificar salud
npm run db:health

# Reiniciar
npm run docker:down
npm run docker:up
```

### Hot reload no funciona

```powershell
# Frontend
cd frontend
rmdir /s /q .angular node_modules
npm install

# Backend
cd backend
rmdir /s /q dist
```

---

## 🛠️ Comandos Útiles

### Información del Sistema

```powershell
# Versiones
node --version
npm --version
ng version
nest --version

# Ver estado de Docker
docker ps
npm run docker:ps

# Ver salud de MySQL
npm run db:health
```

### Limpieza

```powershell
# Limpiar todo
npm run clean:all

# Limpiar solo builds
rmdir /s /q frontend\dist
rmdir /s /q backend\dist
```

---

## 📚 Recursos Adicionales

- **[INSTALLATION.md](./INSTALLATION.md)**: Guía de instalación inicial
- **[USUARIOS.md](./USUARIOS.md)**: Credenciales y matriz de permisos
- **[README.md](./README.md)**: Visión general del proyecto

### Documentación Oficial

- [Angular CLI](https://angular.io/cli)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- [TypeORM](https://typeorm.io)
- [Docker](https://docs.docker.com)

---

## 📞 Soporte

¿Problemas o preguntas?

1. Revisa esta guía y [INSTALLATION.md](./INSTALLATION.md)
2. Busca en los [issues del repositorio](https://github.com/tu-usuario/fitflow/issues)
3. Abre un [nuevo issue](https://github.com/tu-usuario/fitflow/issues/new) con:
   - Comando que ejecutaste
   - Error completo
   - Output de `npm run db:health`
   - Output de `docker ps`

---

**¡Feliz desarrollo!** 🚀
