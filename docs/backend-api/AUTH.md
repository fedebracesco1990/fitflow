# Auth Controller

Endpoints para autenticación y gestión de sesiones.

**Ruta base:** `/auth`

---

## Endpoints

| Método | Ruta                    | Descripción                   | Autenticación |
| ------ | ----------------------- | ----------------------------- | ------------- |
| POST   | `/auth/register`        | Registrar nuevo usuario       | JWT (ADMIN)   |
| POST   | `/auth/login`           | Iniciar sesión                | Público       |
| POST   | `/auth/refresh`         | Renovar tokens                | Refresh Token |
| GET    | `/auth/session`         | Verificar sesión              | JWT           |
| POST   | `/auth/logout`          | Cerrar sesión                 | JWT           |
| POST   | `/auth/forgot-password` | Solicitar reset de contraseña | Público       |
| POST   | `/auth/reset-password`  | Restablecer contraseña        | Público       |

> **Rate limiting:** `POST /auth/login`, `POST /auth/forgot-password` y `POST /auth/reset-password` están limitados a **5 requests cada 15 minutos por IP**. Al superar el límite se responde `429 Too Many Requests`. El resto de la API usa el límite global (60 requests por minuto por IP).

> **Sesión y rol:** en cada request autenticado con access token, el `role` y el `email` del usuario se leen desde la base de datos (no desde el token). Un cambio de rol o la desactivación del usuario se aplican de inmediato, sin esperar a que expire el token.

---

## POST /auth/register

Registra un nuevo usuario en el sistema. Solo puede usarlo un administrador.

**Headers:**

```
Authorization: Bearer <access_token de un ADMIN>
```

**Request Body:**

| Campo    | Tipo   | Requerido | Descripción                                                     |
| -------- | ------ | --------- | --------------------------------------------------------------- |
| email    | string | ✅        | Email único del usuario                                         |
| password | string | ✅        | Contraseña (8-50 chars, mayúscula, minúscula, número, especial) |
| name     | string | ✅        | Nombre completo (2-100 caracteres)                              |

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Nota:** Los tokens devueltos corresponden al usuario recién creado (no al administrador que hizo la request).

**Errores:**

| Código | Descripción            |
| ------ | ---------------------- |
| 401    | No autenticado         |
| 403    | El usuario no es ADMIN |
| 409    | El usuario ya existe   |

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

| Código | Descripción                                          |
| ------ | ---------------------------------------------------- |
| 401    | Credenciales inválidas                               |
| 401    | Usuario inactivo                                     |
| 401    | Cuenta bloqueada temporalmente por intentos fallidos |
| 429    | Demasiados intentos (rate limiting)                  |

---

## POST /auth/refresh

Renueva los tokens de acceso usando el refresh token. El refresh token se envía en el header `Authorization` (no en el body).

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Request Body:** ninguno

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores:**

| Código | Descripción                                                              |
| ------ | ------------------------------------------------------------------------ |
| 401    | Refresh token inválido, expirado o ya invalidado (por logout o rotación) |

> **Nota:** Cada refresh rota el refresh token: el anterior deja de ser válido.

**Configuración de Tokens:**

| Token Type    | Duración | Descripción                                     |
| ------------- | -------- | ----------------------------------------------- |
| Access Token  | 45 min   | Token de acceso para requests autenticados      |
| Refresh Token | 7 días   | Token para renovar access token automáticamente |

> **Nota:** El frontend renueva automáticamente el access token 5 minutos antes de su expiración mediante `TokenRefreshService`.

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

> **Nota:** `email` y `role` se obtienen de la base de datos en cada request, por lo que un cambio de rol se refleja inmediatamente.

---

## POST /auth/logout

Cierra la sesión del usuario. El refresh token se invalida en el servidor (se borra de la base de datos), por lo que no puede volver a usarse en `/auth/refresh`.

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

**Errores:**

| Código | Descripción                         |
| ------ | ----------------------------------- |
| 429    | Demasiados intentos (rate limiting) |

> **Nota de Seguridad:** Este endpoint siempre retorna el mismo mensaje para evitar enumeration attacks (revelar si un email existe en el sistema).

> **Desarrollo:** En modo development, la respuesta incluye `_devOnly.resetLink` para testing.

> **Email:** el backend envía el enlace (válido por 1 hora) por SMTP, configurado con `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `MAIL_FROM`. Sirve cualquier proveedor SMTP (Gmail con contraseña de aplicación, Resend, etc.). En desarrollo, `docker-compose` levanta **Mailpit**: los emails quedan en `http://localhost:8025` y no se envía nada real. Si `SMTP_HOST` está vacío, el email no se envía y solo se registra en el log.

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

| Código | Descripción                         |
| ------ | ----------------------------------- |
| 400    | Token inválido o expirado           |
| 429    | Demasiados intentos (rate limiting) |
