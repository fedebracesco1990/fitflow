# Payments Controller

Endpoints para registro y gestión de pagos.

**Ruta base:** `/payments`

---

## Endpoints

| Método | Ruta                                 | Descripción                        | Roles       |
| ------ | ------------------------------------ | ---------------------------------- | ----------- |
| POST   | `/payments`                          | Registrar pago                     | ADMIN       |
| POST   | `/payments/with-membership-update`   | Registrar pago y renovar membresía | ADMIN       |
| GET    | `/payments`                          | Listar pagos                       | ADMIN       |
| GET    | `/payments/current-month`            | Pagos del mes                      | ADMIN       |
| GET    | `/payments/membership/:membershipId` | Pagos por membresía                | ADMIN       |
| GET    | `/payments/user/:userId`             | Pagos por usuario                  | ADMIN, USER |
| GET    | `/payments/:id`                      | Obtener pago                       | ADMIN       |
| PATCH  | `/payments/:id`                      | Actualizar pago                    | ADMIN       |
| DELETE | `/payments/:id`                      | Eliminar pago                      | ADMIN       |

---

## POST /payments

Registra un nuevo pago.

**Roles:** `ADMIN`

**Request Body:**

| Campo             | Tipo   | Requerido | Descripción                                                                     |
| ----------------- | ------ | --------- | ------------------------------------------------------------------------------- |
| membershipId      | UUID   | ✅        | ID de la membresía                                                              |
| amount            | number | ✅        | Monto del pago                                                                  |
| paymentMethod     | string | ✅        | Método (cash, card, transfer, other)                                            |
| paymentDate       | date   | ✅        | Fecha del pago. Debe ser ≤ hoy, ≥ hoy−90 días y dentro del período de cobertura |
| coverageStartDate | date   | ✅        | Inicio del período cubierto por el pago                                         |
| coverageEndDate   | date   | ✅        | Fin del período cubierto (posterior al inicio)                                  |
| reference         | string | ❌        | Referencia/comprobante (max 100 caracteres)                                     |
| notes             | string | ❌        | Notas adicionales                                                               |

**Response (201):**

```json
{
  "id": "uuid",
  "membershipId": "uuid",
  "registeredById": "uuid",
  "amount": 5000,
  "paymentMethod": "cash",
  "paymentDate": "2024-01-01",
  "reference": null,
  "notes": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## POST /payments/with-membership-update

Registra un pago y, en la misma transacción, renueva la membresía asociada: la pasa a `active`, actualiza `startDate`/`endDate` con el período de cobertura del pago y, opcionalmente, cambia su tipo de membresía. Si algo falla, no se guarda ni el pago ni el cambio de membresía.

**Roles:** `ADMIN`

**Request Body:** los mismos campos que `POST /payments`, más:

| Campo               | Tipo | Requerido | Descripción                                           |
| ------------------- | ---- | --------- | ----------------------------------------------------- |
| newMembershipTypeId | UUID | ❌        | Nuevo tipo de membresía a asignar (debe estar activo) |

**Response (201):** El pago creado (mismo formato que `POST /payments`)

**Errores:**

| Código | Descripción                                          |
| ------ | ---------------------------------------------------- |
| 404    | Membresía o tipo de membresía no encontrado/inactivo |

---

## GET /payments

Lista todos los pagos con paginación.

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
      "amount": 5000,
      "paymentMethod": "cash",
      "paymentDate": "2024-01-01",
      "membership": {
        "id": "uuid",
        "user": { "name": "Juan", "email": "..." }
      },
      "registeredBy": { "name": "Admin" }
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

## GET /payments/current-month

Lista pagos del mes actual.

**Roles:** `ADMIN`

**Response (200):** Array de pagos del mes

---

## GET /payments/membership/:membershipId

Lista pagos de una membresía específica.

**Roles:** `ADMIN`

**Response (200):** Array de pagos

---

## GET /payments/user/:userId

Lista pagos de un usuario.

**Roles:** `ADMIN`, `USER`

> USER solo puede ver sus propios pagos

**Response (200):** Array de pagos del usuario

---

## PATCH /payments/:id

Actualiza un pago.

**Roles:** `ADMIN`

**Request Body:**

| Campo         | Tipo   | Descripción                                          |
| ------------- | ------ | ---------------------------------------------------- |
| amount        | number | Monto                                                |
| paymentMethod | string | Método de pago                                       |
| paymentDate   | date   | Fecha. Mismas validaciones que en POST (si se envía) |
| reference     | string | Referencia                                           |
| notes         | string | Notas                                                |

**Response (200):** Pago actualizado

---

## DELETE /payments/:id

Elimina un pago.

**Roles:** `ADMIN`

**Response:** 204 No Content
