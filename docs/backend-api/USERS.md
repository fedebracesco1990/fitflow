# Users Controller

Endpoints para gestión de usuarios y perfiles.

**Ruta base:** `/users`

---

## Endpoints

| Método | Ruta                         | Descripción              | Roles          |
| ------ | ---------------------------- | ------------------------ | -------------- |
| POST   | `/users`                     | Crear usuario            | ADMIN          |
| GET    | `/users`                     | Listar usuarios          | ADMIN, TRAINER |
| GET    | `/users/low-attendance`      | Usuarios baja asistencia | ADMIN, TRAINER |
| GET    | `/users/inactive`            | Usuarios inactivos       | ADMIN, TRAINER |
| GET    | `/users/export`              | Exportar miembros        | ADMIN          |
| GET    | `/users/:id`                 | Obtener usuario          | ADMIN, TRAINER |
| PATCH  | `/users/:id`                 | Actualizar usuario       | ADMIN          |
| DELETE | `/users/:id`                 | Eliminar usuario         | ADMIN          |
| GET    | `/users/profile/me`          | Mi perfil                | Todos          |
| PATCH  | `/users/profile/me`          | Actualizar mi perfil     | Todos          |
| PATCH  | `/users/profile/me/password` | Cambiar mi contraseña    | Todos          |

---

## GET /users/low-attendance

Obtiene usuarios con baja asistencia en un período específico.

**Roles:** `ADMIN`, `TRAINER`

**Query Parameters:**

| Parámetro | Tipo   | Default | Descripción              |
| --------- | ------ | ------- | ------------------------ |
| month     | number | actual  | Mes a consultar (1-12)   |
| year      | number | actual  | Año a consultar          |
| minVisits | number | 8       | Umbral mínimo de visitas |

**Response (200):**

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "visitCount": 3,
      "lastAttendanceDate": "2026-01-15T10:30:00.000Z",
      "membershipStatus": "active"
    }
  ],
  "meta": {
    "total": 5,
    "month": 1,
    "year": 2026,
    "minVisitsThreshold": 8
  }
}
```

**Notas:**

- Retorna usuarios con menos de `minVisits` asistencias en el mes especificado
- `lastAttendanceDate` puede ser `null` si no hay registros
- `membershipStatus` muestra el estado de membresía activa (`active`, `grace_period`, o `null`)

---

## GET /users/inactive

Obtiene usuarios que no han asistido en los últimos X días.

**Roles:** `ADMIN`, `TRAINER`

**Query Parameters:**

| Parámetro          | Tipo   | Default | Descripción                      |
| ------------------ | ------ | ------- | -------------------------------- |
| daysSinceLastVisit | number | 7       | Días mínimos desde última visita |

**Response (200):**

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "lastAttendanceDate": "2026-01-03T10:30:00.000Z",
      "daysSinceLastVisit": 12,
      "membershipStatus": "active"
    }
  ],
  "meta": {
    "total": 5,
    "daysSinceLastVisitThreshold": 7
  }
}
```

**Notas:**

- Retorna usuarios con más de `daysSinceLastVisit` días sin asistir
- Ordenado por `lastAttendanceDate` ascendente (más inactivos primero)
- Solo incluye usuarios activos con rol `user`
- Usado por el widget de Alerta de Retención en el dashboard

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

Lista usuarios con paginación.

**Roles:** `ADMIN`, `TRAINER`

> TRAINER solo ve usuarios con rol USER

**Query Parameters:**

| Parámetro | Tipo   | Default | Descripción                    |
| --------- | ------ | ------- | ------------------------------ |
| page      | number | 1       | Número de página               |
| limit     | number | 20      | Elementos por página (max 100) |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "user",
      "phone": "123456789",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
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
| 401    | Contraseña actual incorrecta |
