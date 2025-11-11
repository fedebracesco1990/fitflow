# 👥 Usuarios de Prueba - FitFlow

## 📋 Credenciales de Desarrollo

### 🔐 Formato de Contraseñas

Todas las contraseñas siguen el patrón: `Role123!`

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial

---

## 👤 Usuario ADMIN

**Rol:** Administrador del sistema  
**Email:** `admin@fitflow.com`  
**Password:** `Admin123!`  
**Estado:** Activo ✅

### Permisos:

- ✅ Ver todos los usuarios
- ✅ Ver perfiles de ADMIN, TRAINER y USER
- ✅ Crear nuevos usuarios
- ✅ Actualizar cualquier usuario
- ✅ Eliminar usuarios (soft delete)
- ✅ Asignar roles
- ✅ Gestión completa del sistema

---

## 👤 Usuario TRAINER

**Rol:** Entrenador  
**Nombre:** Carlos Pérez - Entrenador  
**Email:** `trainer@fitflow.com`  
**Password:** `Trainer123!`  
**Estado:** Activo ✅

### Permisos:

- ✅ Ver listado de usuarios con rol USER
- ✅ Ver perfiles de usuarios USER
- ✅ Ver y editar su propio perfil
- ✅ Cambiar su propia contraseña
- ❌ NO puede ver perfiles de ADMIN o TRAINER
- ❌ NO puede crear, actualizar o eliminar usuarios

---

## 👤 Usuario USER #1

**Rol:** Usuario regular  
**Nombre:** Juan García  
**Email:** `user1@fitflow.com`  
**Password:** `User123!`  
**Estado:** Activo ✅

### Permisos:

- ✅ Ver su propio perfil
- ✅ Editar su propio perfil
- ✅ Cambiar su propia contraseña
- ❌ NO puede ver otros perfiles
- ❌ NO puede ver listado de usuarios

---

## 👤 Usuario USER #2

**Rol:** Usuario regular  
**Nombre:** María López  
**Email:** `user2@fitflow.com`  
**Password:** `User123!`  
**Estado:** Activo ✅

### Permisos:

- ✅ Ver su propio perfil
- ✅ Editar su propio perfil
- ✅ Cambiar su propia contraseña
- ❌ NO puede ver otros perfiles
- ❌ NO puede ver listado de usuarios

---

## 👤 Usuario INACTIVO

**Rol:** Usuario regular  
**Nombre:** Usuario Inactivo  
**Email:** `inactive@fitflow.com`  
**Password:** `User123!`  
**Estado:** Inactivo ❌

### Notas:

- Este usuario NO puede iniciar sesión
- Útil para probar validaciones de usuarios inactivos
- Se usa para testing de soft delete

---

## 🧪 Endpoints Principales

### 1. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@fitflow.com",
  "password": "Admin123!"
}
```

### 2. Registro

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "password": "Password123!"
}
```

### 3. Ver Mi Perfil

```http
GET http://localhost:3000/api/users/profile/me
Authorization: Bearer {token}
```

### 4. Listar Usuarios (ADMIN o TRAINER)

```http
GET http://localhost:3000/api/users
Authorization: Bearer {token}
```

### 5. Actualizar Mi Perfil

```http
PATCH http://localhost:3000/api/users/profile/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Nombre"
}
```

---

## 🔑 Matriz de Permisos

| Acción                |   ADMIN    |    TRAINER     | USER |
| --------------------- | :--------: | :------------: | :--: |
| Registrarse           |     ✅     |       ✅       |  ✅  |
| Login                 |     ✅     |       ✅       |  ✅  |
| Ver su perfil         |     ✅     |       ✅       |  ✅  |
| Editar su perfil      |     ✅     |       ✅       |  ✅  |
| Cambiar su contraseña |     ✅     |       ✅       |  ✅  |
| Listar usuarios       | ✅ (todos) | ✅ (solo USER) |  ❌  |
| Ver perfil USER       |     ✅     |       ✅       |  ❌  |
| Ver perfil TRAINER    |     ✅     |       ❌       |  ❌  |
| Ver perfil ADMIN      |     ✅     |       ❌       |  ❌  |
| Crear usuarios        |     ✅     |       ❌       |  ❌  |
| Actualizar usuarios   |     ✅     |       ❌       |  ❌  |
| Asignar roles         |     ✅     |       ❌       |  ❌  |
| Eliminar usuarios     |     ✅     |       ❌       |  ❌  |

---

## 📝 Notas Importantes

### Seguridad

- ⚠️ **NUNCA uses estas contraseñas en producción**
- ⚠️ Cambia todas las credenciales antes de deploy
- ⚠️ Las contraseñas están hasheadas con bcrypt (10 rounds)
- ⚠️ Los tokens JWT expiran en 15 minutos (900 segundos)
- ⚠️ Los refresh tokens expiran en 7 días (604800 segundos)

### Base de Datos

- El campo `password` tiene `select: false` en la entidad
- El campo `refreshToken` tiene `select: false` en la entidad
- Los `id` son UUID v4 generados automáticamente
- Soft delete usa el campo `isActive: false`

### Testing

1. Primero prueba con el usuario **USER** para ver las restricciones
2. Luego prueba con **TRAINER** para ver acceso a usuarios USER
3. Finalmente prueba con **ADMIN** para ver acceso completo

---

## 🚀 Cómo Crear los Usuarios

### Método 1: Script de Seed (Recomendado)

```bash
# Asegurarte que el backend está corriendo
npm run start:backend

# En otra terminal
node scripts/seed-users.js

# Verificar
npm run db:verify
```

### Método 2: Endpoint de Registro

Usa Postman, Thunder Client o curl para hacer POST a `/api/auth/register` con los datos de cada usuario.

### Método 3: MySQL Directo

```bash
# Conectar a MySQL
docker exec -it fitflow-mysql mysql -u devuser -pdevpassword123

# Usar la base de datos
USE fit_flow_db;

# Ver usuarios
SELECT id, name, email, role, isActive FROM users;

# Salir
EXIT;
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que la base de datos esté corriendo: `npm run db:health`
2. Verifica que las variables de entorno estén configuradas
3. Verifica que el backend esté en modo desarrollo
4. Revisa los logs de la consola: `npm run docker:logs`

**Base de datos:** `fit_flow_db`  
**Puerto Backend:** `3000`  
**Prefijo API:** `/api`
