# FitFlow - Angular 20 + NestJS

Aplicación full-stack moderna con Angular 20 en el frontend y NestJS en el backend, utilizando MySQL como base de datos.

## 🚀 Características

- ✨ **Angular 20.3.7** con TypeScript 5.8 y SCSS
- 🚀 **NestJS 11.0.1** con TypeORM 0.3.27
- 🗄️ **MySQL 8.0** con Docker Compose
- 📦 **Versiones exactas** de dependencias (sin ^ ni ~)
- 🎨 **ESLint 9 + Prettier 3.3** configurados
- 🔧 **Husky 9.1.7** para hooks de Git
- 🐳 **Docker Compose** para desarrollo local
- 📱 **Angular PWA** configurado
- 🔄 **Hot Reload** en frontend y backend
- 🧪 **Testing** configurado con Jest y Karma

## 📁 Estructura del Proyecto

```
fitflow/
├── .git/
├── .husky/                        # Git hooks
│   └── pre-commit                 # Ejecuta lint-staged
├── .vscode/                       # Configuración VS Code
│   └── settings.json
├── backend/                       # API NestJS
│   ├── src/
│   │   ├── app.module.ts         # Configuración TypeORM
│   │   └── main.ts               # Configuración CORS
│   ├── test/
│   ├── eslint.config.mjs         # ESLint flat config
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── docker/                        # Configuraciones Docker
│   └── mysql/
│       ├── init.sql              # Script inicialización DB
│       └── my.cnf                # Configuración MySQL
├── docs/                          # Documentación
├── frontend/                      # Aplicación Angular
│   ├── src/
│   ├── angular.json
│   ├── eslint.config.js          # ESLint config
│   ├── package.json
│   └── tsconfig.json
├── scripts/                       # Scripts de utilidad
│   └── seed-users.js             # Crear usuarios de prueba
├── .env                          # Variables de entorno
├── .gitignore
├── .lintstagedrc.json            # Configuración lint-staged
├── .prettierignore
├── .prettierrc                   # Configuración Prettier
├── docker-compose.yml            # Docker MySQL
├── package.json                  # Scripts raíz
├── README.md                     # Este archivo
├── QUICK_START.md                # Inicio rápido
├── INSTALLATION.md               # Guía de instalación
├── RUNNING.md                    # Guía de ejecución
└── USUARIOS.md                   # Credenciales de prueba
```

## 🛠️ Requisitos Previos

- **Node.js**: >= 20.19.0
- **npm**: >= 10.0.0
- **Git para Windows**: Última versión
- **Docker Desktop**: (Opcional pero recomendado)
- **VS Code**: (Recomendado)

## ⚡ Inicio Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/fitflow.git
cd fitflow

# 2. Instalar todas las dependencias
npm run install:all

# 3. Iniciar base de datos y esperar
npm run docker:up
npm run db:wait

# 4. Iniciar backend (en otra terminal)
npm run start:backend

# 5. Crear usuarios de prueba (en otra terminal)
node scripts/seed-users.js
```

Acceder a:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **MySQL**: localhost:3306

**Ver guía completa:** [QUICK_START.md](./QUICK_START.md)

## 📦 Stack Tecnológico

### Frontend

| Tecnología     | Versión | Descripción           |
| -------------- | ------- | --------------------- |
| Angular Core   | 20.3.7  | Framework principal   |
| TypeScript     | 5.8.2   | Lenguaje tipado       |
| SCSS           | -       | Preprocesador CSS     |
| RxJS           | 7.8.1   | Programación reactiva |
| Service Worker | 20.3.7  | PWA support           |

### Backend

| Tecnología | Versión | Descripción            |
| ---------- | ------- | ---------------------- |
| NestJS     | 11.0.1  | Framework Node.js      |
| TypeORM    | 0.3.27  | ORM para base de datos |
| MySQL2     | 3.15.3  | Driver MySQL           |
| TypeScript | 5.8.2   | Lenguaje tipado        |

### Herramientas de Desarrollo

| Herramienta | Versión | Descripción           |
| ----------- | ------- | --------------------- |
| ESLint      | 9.14.0  | Linter de código      |
| Prettier    | 3.3.3   | Formateador de código |
| Husky       | 9.1.7   | Git hooks             |
| lint-staged | 15.2.10 | Pre-commit hooks      |
| Docker      | -       | Contenedores          |

### Base de Datos

| Tecnología     | Versión | Descripción              |
| -------------- | ------- | ------------------------ |
| MySQL          | 8.0     | Base de datos relacional |
| Docker Compose | -       | Orquestación             |

## 🎯 Scripts Principales

### Instalación

```bash
npm run install:all      # Instalar todas las dependencias
npm run clean:all        # Limpiar node_modules y Docker
```

### Desarrollo

```bash
npm run start:all        # Iniciar frontend + backend
npm run start:frontend   # Solo frontend (puerto 4200)
npm run start:backend    # Solo backend (puerto 3000)
npm run dev:backend      # Docker + Backend
```

### Build

```bash
npm run build            # Build completo
npm run build:frontend   # Build solo frontend
npm run build:backend    # Build solo backend
```

### Calidad de Código

```bash
npm run lint             # Lint todo el proyecto
npm run lint:fix         # Lint con corrección automática
npm run format           # Formatear código
npm run format:check     # Verificar formato
```

### Testing

```bash
npm run test             # Tests de todo el proyecto
npm run test:frontend    # Tests de frontend
npm run test:backend     # Tests de backend
```

### Docker y Base de Datos

```bash
npm run docker:up          # Iniciar MySQL
npm run docker:down        # Detener MySQL
npm run docker:down:volumes # Detener y eliminar datos
npm run docker:logs        # Ver logs de MySQL
npm run docker:restart     # Reiniciar MySQL
npm run db:wait            # Esperar MySQL (35s)
npm run db:status          # Ver bases de datos
npm run db:verify          # Ver usuarios creados
npm run db:reset           # Reset completo
```

### Scripts de Desarrollo

```bash
# Crear usuarios de prueba
node scripts/seed-users.js
```

## 🔐 Variables de Entorno

El archivo `.env` en la raíz contiene:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=fit_flow_db
MYSQL_USER=devuser
MYSQL_PASSWORD=devpassword123

# Backend Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=devuser
DB_PASSWORD=devpassword123
DB_DATABASE=fit_flow_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# JWT Configuration
JWT_SECRET=c6768ae65bd3a9b0b1d83de3ece14815466fb5f9e9c4e40bdf81545932fee4e95a1d199246d3a392f15e82f3da1de27e8ced83ef07d5f278eeefea556c1c85eb
JWT_ACCESS_TOKEN_EXPIRATION=900
JWT_REFRESH_SECRET=otra-clave-secreta-diferente-para-refresh-tokens-tambien-muy-larga
JWT_REFRESH_TOKEN_EXPIRATION=604800

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200
```

⚠️ **Importante**: No commitear `.env` con credenciales reales.

## 🎨 Estándares de Código

### Prettier (Formateo automático)

- **Print Width**: 100 caracteres
- **Tab Width**: 2 espacios
- **Single Quotes**: Sí
- **Semicolons**: Sí
- **Trailing Comma**: es5
- **End of Line**: lf

### ESLint (Reglas)

- **TypeScript Strict**: Habilitado
- **No explicit any**: Error
- **Prettier Integration**: Habilitado

### Git Hooks (Husky)

- **Pre-commit**: Ejecuta lint-staged
  - Formatea archivos con Prettier
  - Aplica ESLint con fix

## 📚 Documentación

- **[QUICK_START.md](./QUICK_START.md)**: Guía de inicio rápido (5 minutos)
- **[INSTALLATION.md](./INSTALLATION.md)**: Guía detallada de instalación paso a paso
- **[RUNNING.md](./RUNNING.md)**: Guía completa de ejecución y comandos útiles
- **[USUARIOS.md](./USUARIOS.md)**: Credenciales de prueba y permisos

## 🐛 Solución de Problemas Comunes

### Error: Puerto en uso

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :4200
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <PID> /F
```

### Error: MySQL no conecta

```bash
# Verificar que Docker está corriendo
docker ps

# Ver logs de MySQL
npm run docker:logs

# Reiniciar contenedor
npm run docker:restart
```

### Error: Dependencias desactualizadas

```bash
# Reinstalar todo desde cero
npm run clean:all
npm run install:all
```

## 🚀 Flujo de Trabajo

### Crear nueva funcionalidad

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar
npm run start:all

# 3. Lint y formateo (automático en commit)
npm run lint:fix
npm run format

# 4. Commit (Husky ejecuta verificaciones)
git add .
git commit -m "feat: implementar nueva funcionalidad"

# 5. Push
git push origin feature/nueva-funcionalidad
```

### Generar código

**Backend (NestJS):**

```bash
cd backend
nest generate resource users  # CRUD completo
nest generate service auth
nest generate controller health
```

**Frontend (Angular):**

```bash
cd frontend
ng generate component pages/home
ng generate service services/api
ng generate module modules/shared
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, no afecta código
- `refactor:` Refactorización de código
- `test:` Agregar o corregir tests
- `chore:` Tareas de mantenimiento

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Federico Bracesco
- Bruno Huber
- Joaquin Sena
