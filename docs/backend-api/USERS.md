# Users Controller

Endpoints para gestión de usuarios y perfiles.

**Ruta base:** `/users`

---

## Endpoints

| Método | Ruta                         | Descripción           | Roles          |
| ------ | ---------------------------- | --------------------- | -------------- |
| POST   | `/users`                     | Crear usuario         | ADMIN          |
| GET    | `/users`                     | Listar usuarios       | ADMIN, TRAINER |
| GET    | `/users/:id`                 | Obtener usuario       | ADMIN, TRAINER |
| PATCH  | `/users/:id`                 | Actualizar usuario    | ADMIN          |
| DELETE | `/users/:id`                 | Eliminar usuario      | ADMIN          |
| GET    | `/users/profile/me`          | Mi perfil             | Todos          |
| PATCH  | `/users/profile/me`          | Actualizar mi perfil  | Todos          |
| PATCH  | `/users/profile/me/password` | Cambiar mi contraseña | Todos          |

---

## POST /users

Crea un nuevo usuario (solo admin).

**Roles:** `ADMIN`

**Request Body:**

| Campo    | Tipo    | Requerido | Descripción                |
| -------- | ------- | --------- | -------------------------- |
| email    | string  | ✅        | Email único                |
| password | string  | ✅        | Contraseña                 |
| name     | string  | ✅        | Nombre completo            |
| role     | string  | ❌        | Rol (admin, trainer, user) |
| phone    | string  | ❌        | Teléfono                   |
| isActive | boolean | ❌        | Estado activo              |

**Response (201):** Usuario creado

---

## GET /users

Lista todos los usuarios.

**Roles:** `ADMIN`, `TRAINER`

> TRAINER solo ve usuarios con rol USER

**Response (200):**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "phone": "123456789",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## GET /users/:id

Obtiene un usuario por ID.

**Roles:** `ADMIN`, `TRAINER`

**Parámetros:**

| Param | Tipo | Descripción    |
| ----- | ---- | -------------- |
| id    | UUID | ID del usuario |

**Response (200):** Usuario encontrado

---

## PATCH /users/:id

Actualiza un usuario.

**Roles:** `ADMIN`

**Request Body:**

| Campo    | Tipo    | Descripción |
| -------- | ------- | ----------- |
| name     | string  | Nombre      |
| phone    | string  | Teléfono    |
| role     | string  | Rol         |
| isActive | boolean | Estado      |

**Response (200):** Usuario actualizado

---

## DELETE /users/:id

Elimina un usuario.

**Roles:** `ADMIN`

**Response:** 204 No Content

---

## GET /users/profile/me

Obtiene el perfil del usuario autenticado.

**Roles:** Todos los autenticados

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Juan Pérez",
  "phone": "123456789",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## PATCH /users/profile/me

Actualiza el perfil del usuario autenticado.

**Roles:** Todos los autenticados

**Request Body:**

| Campo | Tipo   | Descripción |
| ----- | ------ | ----------- |
| name  | string | Nombre      |
| phone | string | Teléfono    |

**Response (200):** Perfil actualizado

---

## PATCH /users/profile/me/password

Cambia la contraseña del usuario autenticado.

**Roles:** Todos los autenticados

**Request Body:**

| Campo           | Tipo   | Requerido | Descripción       |
| --------------- | ------ | --------- | ----------------- |
| currentPassword | string | ✅        | Contraseña actual |
| newPassword     | string | ✅        | Nueva contraseña  |

**Response:** 204 No Content

**Errores:**

| Código | Descripción                  |
| ------ | ---------------------------- |
| 400    | Contraseña actual incorrecta |
