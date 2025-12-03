# Auth Controller

Endpoints para autenticación y gestión de sesiones.

**Ruta base:** `/auth`

---

## Endpoints

| Método | Ruta                    | Descripción                   | Autenticación |
| ------ | ----------------------- | ----------------------------- | ------------- |
| POST   | `/auth/register`        | Registrar nuevo usuario       | Público       |
| POST   | `/auth/login`           | Iniciar sesión                | Público       |
| POST   | `/auth/refresh`         | Renovar tokens                | Refresh Token |
| GET    | `/auth/session`         | Verificar sesión              | JWT           |
| POST   | `/auth/logout`          | Cerrar sesión                 | JWT           |
| POST   | `/auth/forgot-password` | Solicitar reset de contraseña | Público       |
| POST   | `/auth/reset-password`  | Restablecer contraseña        | Público       |

---

## POST /auth/register

Registra un nuevo usuario en el sistema.

**Request Body:**

| Campo    | Tipo   | Requerido | Descripción                   |
| -------- | ------ | --------- | ----------------------------- |
| email    | string | ✅        | Email único del usuario       |
| password | string | ✅        | Contraseña (min 8 caracteres) |
| name     | string | ✅        | Nombre completo               |
| phone    | string | ❌        | Teléfono de contacto          |

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

---

## POST /auth/login

Inicia sesión con credenciales.

**Request Body:**

| Campo    | Tipo   | Requerido | Descripción       |
| -------- | ------ | --------- | ----------------- |
| email    | string | ✅        | Email del usuario |
| password | string | ✅        | Contraseña        |

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

**Errores:**

| Código | Descripción            |
| ------ | ---------------------- |
| 401    | Credenciales inválidas |
| 403    | Usuario inactivo       |

---

## POST /auth/refresh

Renueva los tokens de acceso usando el refresh token.

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## GET /auth/session

Verifica si la sesión actual es válida.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": "authenticated",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## POST /auth/logout

Cierra la sesión del usuario (invalida refresh token).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:** 200 OK (sin contenido)

---

## POST /auth/forgot-password

Solicita un token para restablecer la contraseña.

**Request Body:**

| Campo | Tipo   | Requerido | Descripción       |
| ----- | ------ | --------- | ----------------- |
| email | string | ✅        | Email del usuario |

**Response (200):**

```json
{
  "message": "Si el email existe, recibirás instrucciones"
}
```

> **Nota:** El envío real de email no está implementado. El token se guarda en la base de datos.

---

## POST /auth/reset-password

Restablece la contraseña usando el token recibido.

**Request Body:**

| Campo    | Tipo   | Requerido | Descripción           |
| -------- | ------ | --------- | --------------------- |
| token    | string | ✅        | Token de recuperación |
| password | string | ✅        | Nueva contraseña      |

**Response (200):**

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

**Errores:**

| Código | Descripción               |
| ------ | ------------------------- |
| 400    | Token inválido o expirado |
