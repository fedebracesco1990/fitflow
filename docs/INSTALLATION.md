# Guía de Instalación Completa - FitFlow

Esta guía proporciona instrucciones paso a paso para configurar el entorno de desarrollo de FitFlow en Windows.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Herramientas](#instalación-de-herramientas)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

## ✅ Requisitos Previos

### Software Requerido

#### 1. Node.js 20.19.0 o superior

Descarga desde: https://nodejs.org/

```cmd
# Verificar instalación
node --version  # Debe mostrar v20.19.0 o superior
npm --version   # Debe mostrar v10.0.0 o superior
```

#### 2. Git para Windows

Descarga desde: https://git-scm.com/download/win

**Configuración durante la instalación:**

- ✅ Selecciona "Use Git and optional Unix tools from the command prompt"
- ✅ Configura line endings como "Checkout Windows-style, commit Unix-style"
- ✅ Usa MinTTY como terminal

```cmd
# Verificar instalación
git --version
```

#### 3. Editor de Código (VS Code recomendado)

Descarga desde: https://code.visualstudio.com/

**Extensiones recomendadas:**

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Angular Language Service** (Angular.ng-template)
- **Error Lens** (usernamehw.errorlens)
- **GitLens** (eamodio.gitlens)

#### 4. Docker Desktop (Opcional pero muy recomendado)

Descarga desde: https://www.docker.com/products/docker-desktop

**Requisitos:**

- Windows 10/11 Pro, Enterprise, o Education
- WSL2 habilitado
- Virtualización habilitada en BIOS

**Configuración recomendada:**

- Asignar al menos 2GB de RAM a Docker
- Habilitar "Use WSL 2 based engine"

---

## 🔧 Instalación de Herramientas

### Paso 1: Configurar PowerShell

Ejecuta PowerShell **como Administrador**:

```powershell
# Permitir ejecución de scripts
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Verificar
Get-ExecutionPolicy -List
```

### Paso 2: Configurar Git

```cmd
# Configurar nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Configurar line endings para Windows
git config --global core.autocrlf true

# Verificar configuración
git config --list
```

### Paso 3: Instalar CLIs Globales

```cmd
# Instalar Angular CLI (versión exacta)
npm install -g @angular/cli@20.3.7

# Instalar NestJS CLI (versión exacta)
npm install -g @nestjs/cli@11.0.10

# Verificar instalaciones
ng version
nest --version
```

### Paso 4: Configurar npm

```cmd
# Configurar npm para usar versiones exactas (sin ^ ni ~)
npm config set save-exact true

# Verificar configuración
npm config get save-exact  # Debe mostrar "true"
```

---

## 📦 Configuración del Proyecto

### Paso 1: Clonar Repositorio

```cmd
# Crear carpeta de proyectos (opcional)
mkdir C:\Proyectos
cd C:\Proyectos

# Clonar el repositorio
git clone https://github.com/tu-usuario/fitflow.git
cd fitflow
```

### Paso 2: Instalar Todas las Dependencias

**Opción A - Script automático (Recomendado):**

```cmd
# Desde la raíz del proyecto
npm run install:all
```

Este comando instalará automáticamente:

1. Dependencias de la raíz
2. Dependencias del frontend
3. Dependencias del backend

**Opción B - Manual:**

```cmd
# Instalar dependencias raíz
npm install

# Instalar dependencias frontend
cd frontend
npm install
cd ..

# Instalar dependencias backend
cd backend
npm install
cd ..
```

**⚠️ Si encuentras errores de peer dependencies:**

```cmd
# Usar legacy peer deps
cd frontend
npm install --legacy-peer-deps
cd ..

cd backend
npm install --legacy-peer-deps
cd ..
```

### Paso 3: Configurar Variables de Entorno

Crea el archivo `.env` en la **raíz del proyecto**:

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
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:4200
```

**⚠️ IMPORTANTE:**

- No commitear el archivo `.env` al repositorio
- Cambiar las contraseñas en producción
- El archivo `.env` ya está en `.gitignore`

### Paso 4: Verificar Archivos de Configuración

Asegúrate de que existen estos archivos en la raíz:

```cmd
# Verificar archivos
dir .prettierrc
dir .prettierignore
dir .lintstagedrc.json
dir .env
dir docker-compose.yml
```

Si falta alguno, revisa el repositorio o créalos según la documentación.

### Paso 5: Configurar Husky (Git Hooks)

```cmd
# Inicializar Husky (solo primera vez)
npm run prepare

# Verificar que existe
dir .husky\pre-commit
```

El hook `pre-commit` ejecutará automáticamente lint-staged antes de cada commit.

---

## 🗄️ Configuración de Base de Datos

### Opción A: Usar Docker (Recomendado)

#### Paso 1: Iniciar Docker Desktop

1. Abre Docker Desktop
2. Espera a que esté completamente iniciado (ícono verde)

#### Paso 2: Iniciar MySQL

```cmd
# Desde la raíz del proyecto
npm run docker:up

# Esperar unos segundos y verificar
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE       STATUS         PORTS                    NAMES
abc123...      mysql:8.0   Up 30 seconds  0.0.0.0:3306->3306/tcp   fitflow-mysql
```

#### Paso 3: Ver logs

```cmd
npm run docker:logs
```

Busca el mensaje:

```
[Server] /usr/sbin/mysqld: ready for connections.
```

### Opción B: MySQL Local (Sin Docker)

Si prefieres instalar MySQL localmente:

#### Paso 1: Descargar e Instalar MySQL

1. Descarga MySQL Community Server: https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador
3. Durante la instalación:
   - Tipo de instalación: **Developer Default**
   - Configuración: **Development Computer**
   - Puerto: **3306**
   - Contraseña root: **rootpassword123** (o la que prefieras)

#### Paso 2: Crear Base de Datos y Usuario

Abre **MySQL Command Line Client** o cualquier cliente MySQL:

```sql
-- Conectar como root
mysql -u root -p

-- Crear base de datos
CREATE DATABASE fit_flow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'devuser'@'localhost' IDENTIFIED BY 'devpassword123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON fit_flow_db.* TO 'devuser'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'devuser';

-- Salir
EXIT;
```

#### Paso 3: Actualizar .env

Si usaste contraseñas diferentes, actualiza el archivo `.env`.

---

## ✅ Verificación

### Paso 1: Verificar Compilación

```cmd
# Build completo
npm run build
```

Si no hay errores:
✅ Frontend compilado en `frontend/dist/`
✅ Backend compilado en `backend/dist/`

### Paso 2: Verificar Backend

```cmd
# Iniciar backend
npm run start:backend
```

Deberías ver:

```
[Nest] INFO [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO [TypeOrmModule] Database connection established
Backend running on http://localhost:3000/api
```

**Si ves este mensaje, ¡la conexión a la base de datos funciona!** ✅

Presiona `Ctrl+C` para detener.

### Paso 3: Verificar Frontend

Abre **otra terminal**:

```cmd
# Iniciar frontend
npm run start:frontend
```

Deberías ver:

```
Angular Live Development Server is listening on localhost:4200
√ Compiled successfully.
```

Abre tu navegador en: http://localhost:4200

Deberías ver la página de inicio de Angular.

### Paso 4: Verificar Husky y Lint-staged

```cmd
# Crear un cambio de prueba
echo // test >> backend\src\main.ts

# Agregar al staging
git add backend\src\main.ts

# Intentar commit
git commit -m "test: verificar husky"
```

Deberías ver que se ejecuta **lint-staged** y formatea el código automáticamente.

Si funciona:

```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications...
✔ Cleaning up...
```

Deshacer el commit de prueba:

```cmd
git reset HEAD~1
```

### Paso 5: Verificar Docker

```cmd
# Ver contenedores corriendo
docker ps

# Conectar a MySQL
docker exec -it fitflow-mysql mysql -u devuser -p
# Contraseña: devpassword123

# Dentro de MySQL:
SHOW DATABASES;
USE fit_flow_db;
SHOW TABLES;
EXIT;
```

---

## 🐛 Solución de Problemas

### Problema 1: "ng no se reconoce como comando"

**Causa**: Angular CLI no está instalado globalmente o no está en el PATH.

**Solución:**

```cmd
# Reinstalar Angular CLI
npm uninstall -g @angular/cli
npm cache clean --force
npm install -g @angular/cli@20.3.7

# Reiniciar terminal
```

### Problema 2: "nest no se reconoce como comando"

**Solución:**

```cmd
npm install -g @nestjs/cli@11.0.10
```

### Problema 3: Error de permisos en PowerShell

**Causa**: Política de ejecución de scripts restrictiva.

**Solución:**

```powershell
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Problema 4: Puerto 3306 ya en uso

**Causa**: MySQL local o otro servicio usando el puerto.

**Solución A - Cambiar puerto en docker-compose.yml:**

```yaml
ports:
  - '3307:3306' # Cambiar puerto del host
```

Luego actualizar `.env`:

```env
DB_PORT=3307
```

**Solución B - Detener MySQL local:**

```cmd
# Ver qué usa el puerto
netstat -ano | findstr :3306

# Detener servicio MySQL local
net stop MySQL80  # (o el nombre de tu servicio)
```

### Problema 5: Husky hooks no funcionan en Windows

**Causa**: Git no encuentra bash o problemas con line endings.

**Solución:**

```cmd
# Verificar que Git está en el PATH
where git

# Configurar Git correctamente
git config core.autocrlf true

# Reinstalar Husky
npm uninstall husky
npm install --save-exact husky@9.1.7
npm run prepare
```

### Problema 6: Error "ETARGET No matching version found"

**Causa**: Versión de paquete no existe en npm.

**Solución:**

```cmd
# Verificar versiones disponibles
npm view @angular/build versions --json
npm view @nestjs/config versions --json

# Actualizar package.json con versiones correctas
# Luego reinstalar
npm run reinstall:all
```

### Problema 7: Error de conexión a MySQL con Docker

**Solución:**

1. Verificar que Docker está corriendo:

```cmd
docker ps
```

2. Ver logs del contenedor:

```cmd
npm run docker:logs
```

3. Reiniciar contenedor:

```cmd
npm run docker:down
npm run docker:up
```

4. Verificar variables de entorno en `.env`

5. Esperar más tiempo (MySQL tarda ~30 segundos en estar listo)

### Problema 8: Warnings de dependencias deprecadas

**Ejemplos:**

```
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@3.0.2
npm warn deprecated glob@7.2.3
```

**Causa**: Dependencias transitivas de Angular CLI.

**Solución (Opcional)**:

Agregar `overrides` en `frontend/package.json`:

```json
{
  "overrides": {
    "glob": "10.3.10",
    "rimraf": "5.0.5",
    "inflight": "npm:@aashutoshrathi/inflight@1.0.1"
  }
}
```

⚠️ **Nota**: Estos warnings no afectan la funcionalidad. Puedes ignorarlos.

### Problema 9: "Module not found" en Angular

**Solución:**

```cmd
cd frontend
rmdir /s /q node_modules .angular
npm install
```

### Problema 10: Build falla con errores de TypeScript

**Solución:**

```cmd
# Limpiar cachés
cd frontend
rmdir /s /q .angular
cd ..

cd backend
rmdir /s /q dist
cd ..

# Reinstalar todo
npm run reinstall:all
```

---

## 🎯 Próximos Pasos

Una vez completada la instalación exitosamente:

1. ✅ Lee la [Guía de Ejecución](./RUNNING.md)
2. ✅ Familiarízate con los scripts en `package.json`
3. ✅ Revisa la estructura del código en `/frontend` y `/backend`
4. ✅ Crea tu primera entidad en el backend
5. ✅ Crea tu primer componente en el frontend

---

## 📞 Soporte Adicional

Si encuentras problemas no listados aquí:

1. **Revisa los logs completos** del error
2. **Busca en los issues** del repositorio
3. **Abre un nuevo issue** con:
   - Versión de Node.js (`node --version`)
   - Sistema operativo y versión
   - Error completo con stack trace
   - Pasos para reproducir el problema

## 📚 Recursos Útiles

- [Documentación de Angular](https://angular.dev)
- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [Documentación de Docker](https://docs.docker.com)
- [Documentación de MySQL](https://dev.mysql.com/doc/)

---

**¡Felicitaciones!** 🎉 Si llegaste hasta aquí sin errores, tu entorno está configurado correctamente.

Siguiente paso: [Ejecutar el Proyecto](./RUNNING.md)
