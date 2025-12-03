# Memberships Controller

Endpoints para gestión de membresías de usuarios.

**Ruta base:** `/memberships`

---

## Endpoints

| Método | Ruta                               | Descripción           | Roles       |
| ------ | ---------------------------------- | --------------------- | ----------- |
| POST   | `/memberships`                     | Crear membresía       | ADMIN       |
| GET    | `/memberships`                     | Listar membresías     | ADMIN       |
| GET    | `/memberships/expiring`            | Membresías por vencer | ADMIN       |
| GET    | `/memberships/user/:userId`        | Membresías de usuario | ADMIN       |
| GET    | `/memberships/user/:userId/active` | Membresía activa      | ADMIN, USER |
| GET    | `/memberships/:id`                 | Obtener membresía     | ADMIN       |
| PATCH  | `/memberships/:id`                 | Actualizar membresía  | ADMIN       |
| PATCH  | `/memberships/:id/cancel`          | Cancelar membresía    | ADMIN       |
| DELETE | `/memberships/:id`                 | Eliminar membresía    | ADMIN       |
| POST   | `/memberships/update-expired`      | Actualizar vencidas   | ADMIN       |

---

## POST /memberships

Crea una nueva membresía para un usuario.

**Roles:** `ADMIN`

**Request Body:**

| Campo            | Tipo   | Requerido | Descripción                 |
| ---------------- | ------ | --------- | --------------------------- |
| userId           | UUID   | ✅        | ID del usuario              |
| membershipTypeId | UUID   | ✅        | ID del tipo de membresía    |
| startDate        | date   | ❌        | Fecha inicio (default: hoy) |
| notes            | string | ❌        | Notas adicionales           |

**Response (201):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "membershipTypeId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "status": "active",
  "notes": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /memberships

Lista membresías con paginación.

**Roles:** `ADMIN`

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
      "userId": "uuid",
      "membershipTypeId": "uuid",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "status": "active",
      "user": { "id": "uuid", "name": "Juan", "email": "..." },
      "membershipType": { "id": "uuid", "name": "Mensual", "price": 5000 }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## GET /memberships/expiring

Lista membresías próximas a vencer.

**Roles:** `ADMIN`

**Query Parameters:**

| Param | Tipo   | Default | Descripción      |
| ----- | ------ | ------- | ---------------- |
| days  | number | 7       | Días para vencer |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "endDate": "2024-01-31",
    "status": "active",
    "user": { "id": "uuid", "name": "Juan", "email": "..." },
    "membershipType": { "id": "uuid", "name": "Mensual" }
  }
]
```

---

## GET /memberships/user/:userId

Lista todas las membresías de un usuario.

**Roles:** `ADMIN`

**Response (200):** Array de membresías del usuario

---

## GET /memberships/user/:userId/active

Obtiene la membresía activa de un usuario.

**Roles:** `ADMIN`, `USER`

> USER solo puede ver su propia membresía

**Response (200):** Membresía activa o null

---

## PATCH /memberships/:id/cancel

Cancela una membresía.

**Roles:** `ADMIN`

**Response (200):** Membresía con status `cancelled`

---

## POST /memberships/update-expired

Actualiza el estado de membresías vencidas.

**Roles:** `ADMIN`

**Response (200):**

```json
{
  "message": "5 membresías actualizadas a estado 'expired'"
}
```
