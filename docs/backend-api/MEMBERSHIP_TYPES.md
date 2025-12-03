# Membership Types Controller

Endpoints para gestión de tipos de membresía.

**Ruta base:** `/membership-types`

---

## Endpoints

| Método | Ruta                    | Descripción     | Roles |
| ------ | ----------------------- | --------------- | ----- |
| POST   | `/membership-types`     | Crear tipo      | ADMIN |
| GET    | `/membership-types`     | Listar tipos    | Todos |
| GET    | `/membership-types/:id` | Obtener tipo    | Todos |
| PATCH  | `/membership-types/:id` | Actualizar tipo | ADMIN |
| DELETE | `/membership-types/:id` | Eliminar tipo   | ADMIN |

---

## POST /membership-types

Crea un nuevo tipo de membresía.

**Roles:** `ADMIN`

**Request Body:**

| Campo           | Tipo   | Requerido | Descripción                 |
| --------------- | ------ | --------- | --------------------------- |
| name            | string | ✅        | Nombre único                |
| description     | string | ❌        | Descripción                 |
| price           | number | ✅        | Precio                      |
| durationDays    | number | ✅        | Duración en días            |
| gracePeriodDays | number | ❌        | Días de gracia (default: 0) |

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Mensual",
  "description": "Acceso completo por 30 días",
  "price": 5000,
  "durationDays": 30,
  "gracePeriodDays": 5,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /membership-types

Lista todos los tipos de membresía.

**Roles:** Todos los autenticados

**Query Parameters:**

| Param           | Tipo   | Default | Descripción       |
| --------------- | ------ | ------- | ----------------- |
| includeInactive | string | false   | Incluir inactivos |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Mensual",
    "price": 5000,
    "durationDays": 30,
    "gracePeriodDays": 5,
    "isActive": true
  }
]
```

---

## GET /membership-types/:id

Obtiene un tipo de membresía por ID.

**Roles:** Todos los autenticados

**Response (200):** Tipo de membresía

---

## PATCH /membership-types/:id

Actualiza un tipo de membresía.

**Roles:** `ADMIN`

**Request Body:**

| Campo           | Tipo    | Descripción    |
| --------------- | ------- | -------------- |
| name            | string  | Nombre         |
| description     | string  | Descripción    |
| price           | number  | Precio         |
| durationDays    | number  | Duración       |
| gracePeriodDays | number  | Días de gracia |
| isActive        | boolean | Estado         |

**Response (200):** Tipo actualizado

---

## DELETE /membership-types/:id

Elimina un tipo de membresía.

**Roles:** `ADMIN`

**Response:** 204 No Content
