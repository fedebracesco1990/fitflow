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
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Nota:** Para obtener los datos del usuario después del registro, use `GET /auth/session`.

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
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Nota:** Para obtener los datos del usuario después del login, use `GET /auth/session`.

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
  "message": "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
}
```

> **Nota de Seguridad:** Este endpoint siempre retorna el mismo mensaje para evitar enumeration attacks (revelar si un email existe en el sistema).

> **Desarrollo:** En modo development, la respuesta incluye `_devOnly.resetLink` para testing.

---

## POST /auth/reset-password

Restablece la contraseña usando el token recibido.

**Request Body:**

| Campo       | Tipo   | Requerido | Descripción                                                            |
| ----------- | ------ | --------- | ---------------------------------------------------------------------- |
| token       | string | ✅        | Token de recuperación                                                  |
| userId      | string | ✅        | UUID del usuario                                                       |
| newPassword | string | ✅        | Nueva contraseña (min 8 chars, mayúscula, minúscula, número, especial) |

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
