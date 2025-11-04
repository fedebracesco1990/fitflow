# Guía de Ejecución del Proyecto - FitFlow

Esta guía explica cómo ejecutar FitFlow en diferentes modos y entornos, además de comandos útiles para el desarrollo diario.

## 📋 Tabla de Contenidos

1. [Desarrollo Local](#desarrollo-local)
2. [Modo Producción](#modo-producción)
3. [Docker y Base de Datos](#docker-y-base-de-datos)
4. [Testing](#testing)
5. [Linting y Formateo](#linting-y-formateo)
6. [Comandos Útiles](#comandos-útiles)
7. [Generación de Código](#generación-de-código)
8. [Workflows Comunes](#workflows-comunes)

---

## 🚀 Desarrollo Local

### Inicio Rápido

```cmd
# Iniciar base de datos (si usas Docker)
npm run docker:up

# Esperar 10-15 segundos para que MySQL esté listo

# Iniciar frontend y backend simultáneamente
npm run start:all
```

**Acceder a:**

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **MySQL**: localhost:3306

**Credenciales MySQL:**

- Usuario: `devuser`
- Contraseña: `devpassword123`
- Base de datos: `fit_flow_db`

### Ejecutar Servicios por Separado

#### Terminal 1 - Backend

```cmd
npm run start:backend

# O directamente desde la carpeta backend
cd backend
npm run start:dev
```

**Características:**

- ✅ Hot reload activado (se reinicia automáticamente al guardar)
- ✅ Logs de debug en consola
- ✅ Servidor en http://localhost:3000/api

**Mensajes esperados:**

```
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [TypeOrmModule] Database connection established
Backend running on http://localhost:3000/api
```

#### Terminal 2 - Frontend

```cmd
npm run start:frontend

# O directamente desde la carpeta frontend
cd frontend
npm start
```

**Características:**

- ✅ Hot reload activado
- ✅ Compilación incremental
- ✅ Servidor en http://localhost:4200

**Mensajes esperados:**

```
√ Browser application bundle generation complete.
Initial Chunk Files | Names         |  Raw Size
main.js             | main          | 123.45 kB |

Angular Live Development Server is listening on localhost:4200
√ Compiled successfully.
```

### Modo Debug

#### Backend (NestJS)

```cmd
cd backend
npm run start:debug
```

El debugger estará escuchando en el puerto **9229**.

**Conectar con VS Code:**

Crea/edita `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true,
      "stopOnEntry": false,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Luego:

1. Inicia el backend en modo debug
2. En VS Code: `F5` o Run → Start Debugging
3. Coloca breakpoints en tu código

#### Frontend (Angular)

**Opción 1 - Chrome DevTools:**

1. Abre http://localhost:4200
2. Presiona `F12`
3. Pestaña "Sources"
4. Busca tus archivos TypeScript
5. Coloca breakpoints

**Opción 2 - Angular DevTools:**

1. Instala extensión: [Angular DevTools](https://angular.io/guide/devtools)
2. Abre http://localhost:4200
3. `F12` → Pestaña "Angular"
4. Inspecciona componentes y dependencias

---

## 📦 Modo Producción

### Build para Producción

```cmd
# Build completo (frontend + backend)
npm run build

# Outputs:
# - frontend/dist/browser/
# - backend/dist/
```

**Build individual:**

```cmd
# Solo frontend
npm run build:frontend

# Solo backend
npm run build:backend
```

### Verificar Build

```cmd
# Ver tamaño de los archivos
cd frontend/dist/browser
dir

# Ver archivos del backend
cd ../../backend/dist
dir
```

### Ejecutar Build de Producción

#### Backend

```cmd
cd backend
npm run start:prod

# O directamente
node dist/main.js
```

**Variables de entorno para producción:**

Crea `.env.production` en la raíz:

```env
NODE_ENV=production
BACKEND_PORT=3000

# Base de datos producción
DB_HOST=tu-servidor-mysql.com
DB_PORT=3306
DB_USERNAME=prod_user
DB_PASSWORD=tu_password_seguro_aqui
DB_DATABASE=fitflow_prod
DB_SYNCHRONIZE=false  # ⚠️ IMPORTANTE: false en producción
DB_LOGGING=false

FRONTEND_URL=https://tu-dominio.com
```

#### Frontend

Necesitas un servidor web para servir los archivos estáticos:

**Opción 1 - serve (desarrollo local):**

```cmd
cd frontend/dist/browser
npx serve -s -p 8080
```

**Opción 2 - http-server:**

```cmd
npm install -g http-server
cd frontend/dist/browser
http-server -p 8080 -c-1
```

**Opción 3 - Nginx (producción real):**

Configuración básica de Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/fitflow/frontend/dist/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🐳 Docker y Base de Datos

### Comandos Docker

```cmd
# Iniciar MySQL
npm run docker:up

# Iniciar en primer plano (ver logs en tiempo real)
docker-compose up

# Detener MySQL
npm run docker:down

# Ver logs
npm run docker:logs

# Reiniciar MySQL
npm run docker:restart

# Detener y eliminar volúmenes (⚠️ borra datos)
docker-compose down -v
```

### Conectar a MySQL

#### Desde línea de comandos (Docker)

```cmd
# Conectar al contenedor
docker exec -it fitflow-mysql mysql -u devuser -p
# Contraseña: devpassword123

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

#### Desde código (verificar conexión)

El backend ya está configurado para conectarse. Verifica en los logs:

```
[Nest] INFO [TypeOrmModule] Database connection established
```

### Migraciones TypeORM

```cmd
cd backend

# Generar migración automática (basada en entidades)
npm run migration:generate -- -n CreateUsersTable

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver migraciones ejecutadas
npm run typeorm migration:show
```

### Resetear Base de Datos

⚠️ **Esto eliminará todos los datos**:

```cmd
# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar con datos limpios
npm run docker:up

# Esperar 15 segundos
timeout /t 15

# Ejecutar migraciones (si las tienes)
cd backend
npm run migration:run
```

---

## 🧪 Testing

### Tests del Frontend

```cmd
# Ejecutar todos los tests (watch mode)
npm run test:frontend

# Tests con coverage
cd frontend
npm run test -- --code-coverage

# Tests sin watch (CI)
npm run test -- --no-watch --browsers=ChromeHeadless
```

**Ver reporte de coverage:**

```cmd
cd frontend/coverage
start index.html
```

### Tests del Backend

```cmd
# Tests unitarios
npm run test:backend

# Tests con coverage
cd backend
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests en modo watch
npm run test:watch

# Test específico
npm test -- --testNamePattern="AppController"
```

**Ver reporte de coverage:**

```cmd
cd backend/coverage
start lcov-report/index.html
```

### Tests de Todo el Proyecto

```cmd
# Ejecutar todos los tests
npm run test
```

---

## 🎨 Linting y Formateo

### ESLint

```cmd
# Lint completo (ambos proyectos)
npm run lint

# Lint con fix automático
npm run lint:fix

# Solo frontend
npm run lint:frontend
npm run lint:fix:frontend

# Solo backend
npm run lint:backend
npm run lint:fix:backend
```

**Ejecutar directamente:**

```cmd
# Frontend
cd frontend
npx eslint "src/**/*.ts"
npx eslint "src/**/*.ts" --fix

# Backend
cd backend
npx eslint "{src,apps,libs,test}/**/*.ts"
npx eslint "{src,apps,libs,test}/**/*.ts" --fix
```

### Prettier

```cmd
# Formatear todo el código
npm run format

# Solo verificar formato (no modifica archivos)
npm run format:check
```

**Formatear específicamente:**

```cmd
# Solo frontend
cd frontend
npm run format

# Solo backend
cd backend
npm run format

# Archivos específicos
npx prettier --write "src/app/app.component.ts"
```

### Pre-commit Hooks (Husky + lint-staged)

Los hooks se ejecutan **automáticamente** al hacer commit:

```cmd
# Hacer cambios
# ...

# Agregar al staging
git add .

# Commit (se ejecuta lint-staged automáticamente)
git commit -m "feat: nueva funcionalidad"
```

**Qué hace lint-staged:**

1. Detecta archivos en staging
2. Ejecuta Prettier para formatear
3. Si hay errores, el commit se cancela
4. Si todo OK, el commit se completa

**Saltar hooks (solo emergencias):**

```cmd
git commit -m "fix: urgente" --no-verify
```

⚠️ **No recomendado**: Úsalo solo en casos excepcionales.

---

## 🛠️ Comandos Útiles

### Gestión de Dependencias

```cmd
# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencia específica
cd frontend
npm install --save-exact @angular/core@20.3.8

# Instalar nueva dependencia
npm install --save-exact nueva-dependencia@1.2.3

# Instalar dependencia de desarrollo
npm install --save-exact --save-dev nueva-dev-dependencia@1.0.0

# Eliminar dependencia
npm uninstall nombre-paquete
```

### Limpieza del Proyecto

```cmd
# Limpiar todo (desde la raíz)
npm run clean:all

# Limpiar y reinstalar
npm run reinstall:all

# Limpiar builds
rmdir /s /q frontend\dist
rmdir /s /q backend\dist
rmdir /s /q frontend\.angular

# Limpiar cachés de npm
npm cache clean --force
```

### Análisis de Bundle (Frontend)

```cmd
cd frontend

# Generar estadísticas
npm run build -- --stats-json

# Analizar con webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/browser/stats.json
```

### Información del Sistema

```cmd
# Versiones instaladas
node --version
npm --version
ng version
nest --version

# Ver paquetes instalados
npm list --depth=0

# Ver dependencias de un paquete
npm list @angular/core
```

---

## ⚡ Generación de Código

### Frontend (Angular)

```cmd
cd frontend

# Generar componente
ng generate component pages/home
ng g c pages/login --skip-tests

# Generar servicio
ng generate service services/auth
ng g s services/api --skip-tests

# Generar módulo
ng generate module modules/shared --routing
ng g m modules/core

# Generar guard
ng generate guard guards/auth

# Generar interceptor
ng generate interceptor interceptors/auth

# Generar pipe
ng generate pipe pipes/format-date

# Generar directiva
ng generate directive directives/highlight
```

**Atajos:**

- `ng g c` = `ng generate component`
- `ng g s` = `ng generate service`
- `ng g m` = `ng generate module`

### Backend (NestJS)

```cmd
cd backend

# Generar módulo completo (CRUD)
nest generate resource users
nest g resource auth --no-spec

# Generar módulo
nest generate module users
nest g mo auth

# Generar controlador
nest generate controller users
nest g co health

# Generar servicio
nest generate service users
nest g s email

# Generar guard
nest generate guard guards/auth
nest g gu guards/roles

# Generar interceptor
nest generate interceptor interceptors/logging

# Generar middleware
nest generate middleware middlewares/logger

# Generar filter
nest generate filter filters/http-exception

# Generar pipe
nest generate pipe pipes/validation
```

**Atajos:**

- `nest g` = `nest generate`
- `nest g res` = `nest generate resource`

---

## 🔄 Workflows Comunes

### Agregar Nueva Funcionalidad

```cmd
# 1. Crear rama
git checkout -b feature/user-profile

# 2. Iniciar servidores en desarrollo
npm run start:all

# 3. Backend: Crear recurso
cd backend
nest generate resource profile

# 4. Frontend: Crear componente y servicio
cd ../frontend
ng generate component pages/profile
ng generate service services/profile

# 5. Desarrollar y probar localmente
# (Hacer cambios en el código)

# 6. Verificar calidad de código
cd ..
npm run lint:fix
npm run format

# 7. Ejecutar tests
npm run test

# 8. Commit (lint-staged se ejecuta automáticamente)
git add .
git commit -m "feat: agregar perfil de usuario"

# 9. Push
git push origin feature/user-profile

# 10. Crear Pull Request en GitHub
```

### Trabajar con Base de Datos

```cmd
# 1. Crear entidad
cd backend/src/users/entities
# Crear user.entity.ts

# 2. Generar migración
cd ../..
npm run migration:generate -- -n CreateUsersTable

# 3. Revisar migración generada
# Editar src/migrations/*-CreateUsersTable.ts

# 4. Ejecutar migración
npm run migration:run

# 5. Verificar en MySQL
cd ../..
docker exec -it fitflow-mysql mysql -u devuser -p
```

### Deploy a Producción

```cmd
# 1. Asegurar que estás en main/master
git checkout main
git pull origin main

# 2. Ejecutar tests
npm run test

# 3. Build de producción
npm run build

# 4. Verificar builds
dir frontend\dist\browser
dir backend\dist

# 5. Tag de versión
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 6. Deploy según tu plataforma
# (Heroku, AWS, Azure, DigitalOcean, etc.)
```

### Actualizar Dependencias

```cmd
# 1. Ver dependencias desactualizadas
npm outdated
cd frontend && npm outdated
cd ../backend && npm outdated
cd ..

# 2. Actualizar package.json manualmente
# (Cambiar versiones)

# 3. Reinstalar todo
npm run reinstall:all

# 4. Probar que todo funciona
npm run start:all
npm run lint
npm run test
npm run build

# 5. Commit
git add .
git commit -m "chore: actualizar dependencias"
```

---

## 🐛 Solución de Problemas Comunes

### Puerto en Uso

```cmd
# Ver qué proceso usa el puerto
netstat -ano | findstr :4200
netstat -ano | findstr :3000
netstat -ano | findstr :3306

# Matar proceso
taskkill /PID <PID> /F
```

### Hot Reload No Funciona

**Frontend:**

```cmd
cd frontend
rmdir /s /q .angular node_modules
npm install
```

**Backend:**

```cmd
cd backend
rmdir /s /q dist
```

### Error de CORS

Verifica `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### MySQL No Conecta

```cmd
# 1. Verificar que Docker está corriendo
docker ps

# 2. Ver logs
npm run docker:logs

# 3. Reiniciar
npm run docker:restart

# 4. Verificar .env
type .env
```

### Build Falla

```cmd
# Limpiar todo y reinstalar
npm run clean:all
npm run reinstall:all
npm run build
```

---

## 📚 Recursos Adicionales

- [Angular CLI Commands](https://angular.io/cli)
- [NestJS CLI Commands](https://docs.nestjs.com/cli/overview)
- [TypeORM CLI](https://typeorm.io/using-cli)
- [Docker Commands](https://docs.docker.com/engine/reference/commandline/cli/)
- [npm Commands](https://docs.npmjs.com/cli/v10/commands)

---

## 📞 Soporte

¿Problemas o preguntas?

1. Revisa esta guía y [INSTALLATION.md](./INSTALLATION.md)
2. Busca en los [issues del repositorio](https://github.com/tu-usuario/fitflow/issues)
3. Abre un [nuevo issue](https://github.com/tu-usuario/fitflow/issues/new)

---

**¡Feliz desarrollo!** 🚀
