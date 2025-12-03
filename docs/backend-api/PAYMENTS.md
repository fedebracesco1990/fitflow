# Payments Controller

Endpoints para registro y gestión de pagos.

**Ruta base:** `/payments`

---

## Endpoints

| Método | Ruta                                 | Descripción         | Roles       |
| ------ | ------------------------------------ | ------------------- | ----------- |
| POST   | `/payments`                          | Registrar pago      | ADMIN       |
| GET    | `/payments`                          | Listar pagos        | ADMIN       |
| GET    | `/payments/current-month`            | Pagos del mes       | ADMIN       |
| GET    | `/payments/membership/:membershipId` | Pagos por membresía | ADMIN       |
| GET    | `/payments/user/:userId`             | Pagos por usuario   | ADMIN, USER |
| GET    | `/payments/:id`                      | Obtener pago        | ADMIN       |
| PATCH  | `/payments/:id`                      | Actualizar pago     | ADMIN       |
| DELETE | `/payments/:id`                      | Eliminar pago       | ADMIN       |

---

## POST /payments

Registra un nuevo pago.

**Roles:** `ADMIN`

**Request Body:**

| Campo         | Tipo   | Requerido | Descripción                          |
| ------------- | ------ | --------- | ------------------------------------ |
| membershipId  | UUID   | ✅        | ID de la membresía                   |
| amount        | number | ✅        | Monto del pago                       |
| paymentMethod | string | ✅        | Método (cash, card, transfer, other) |
| paymentDate   | date   | ❌        | Fecha del pago (default: hoy)        |
| reference     | string | ❌        | Referencia/comprobante               |
| notes         | string | ❌        | Notas adicionales                    |

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

## GET /payments

Lista todos los pagos.

**Roles:** `ADMIN`

**Response (200):**

```json
[
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
]
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

| Campo         | Tipo   | Descripción    |
| ------------- | ------ | -------------- |
| amount        | number | Monto          |
| paymentMethod | string | Método de pago |
| paymentDate   | date   | Fecha          |
| reference     | string | Referencia     |
| notes         | string | Notas          |

**Response (200):** Pago actualizado

---

## DELETE /payments/:id

Elimina un pago.

**Roles:** `ADMIN`

**Response:** 204 No Content
