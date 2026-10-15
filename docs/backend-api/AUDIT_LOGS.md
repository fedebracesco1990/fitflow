# Audit Logs Controller

Endpoint de consulta del historial de auditoría de operaciones sobre entidades del sistema (alta, modificación y baja).

**Ruta base:** `/audit-logs`

---

## Endpoints

| Método | Ruta          | Descripción                                  | Roles |
| ------ | ------------- | -------------------------------------------- | ----- |
| GET    | `/audit-logs` | Historial de auditoría, paginado y filtrable | ADMIN |

---

## GET /audit-logs

Lista los registros de auditoría ordenados por fecha de creación descendente (más recientes primero). Incluye el usuario que realizó la acción (`performedBy`).

**Roles:** `ADMIN`

**Query Parameters:**

| Parámetro     | Tipo   | Default | Descripción                                                        |
| ------------- | ------ | ------- | ------------------------------------------------------------------ |
| page          | number | 1       | Página (entero, mínimo 1)                                          |
| limit         | number | 20      | Items por página (entero, 1-100)                                   |
| entity        | string | -       | Filtrar por nombre de entidad (coincidencia exacta, ej: `Payment`) |
| action        | enum   | -       | Filtrar por acción: `CREATE`, `UPDATE`, `DELETE`                   |
| performedById | UUID   | -       | Filtrar por el usuario que realizó la acción                       |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "action": "UPDATE",
      "entity": "Payment",
      "entityId": "payment-uuid",
      "performedById": "admin-uuid",
      "performedBy": {
        "id": "admin-uuid",
        "name": "Admin",
        "email": "admin@fitflow.com",
        "role": "admin",
        "resetPasswordExpires": null,
        "isActive": true,
        "createdAt": "2026-01-07T12:00:00.000Z",
        "updatedAt": "2026-01-07T12:00:00.000Z"
      },
      "details": {
        "before": {
          "amount": "1500.00",
          "paymentMethod": "cash",
          "paymentDate": "2026-02-01",
          "notes": null
        },
        "after": { "amount": 1800 }
      },
      "createdAt": "2026-02-06T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

| Campo         | Tipo   | Descripción                                                                                           |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| action        | enum   | `CREATE`, `UPDATE` o `DELETE`                                                                         |
| entity        | string | Nombre de la entidad afectada (ej: `Payment`)                                                         |
| entityId      | UUID   | ID del registro afectado (puede ser `null`)                                                           |
| performedById | UUID   | ID del usuario que realizó la acción (puede ser `null`)                                               |
| performedBy   | object | Usuario que realizó la acción, sin campos sensibles (password, tokens, bloqueo). `null` si se eliminó |
| details       | JSON   | Datos adicionales según la operación (ver tabla de acciones registradas)                              |
| createdAt     | Date   | Fecha del registro                                                                                    |

**Errores:**

| Código | Descripción                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| 400    | Query params inválidos (`action` fuera del enum, `performedById` no UUID, `limit` > 100, parámetros no permitidos) |
| 401    | No autenticado                                                                                                     |
| 403    | El usuario no tiene rol `ADMIN`                                                                                    |

---

## Acciones registradas

Los registros se crean desde el código mediante `AuditLogsService.log()`, que no está expuesto por HTTP. Actualmente solo el módulo de **Pagos** registra auditoría, y lo hace después de completar la operación:

| Operación                               | action   | entity    | details                                                                               |
| --------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------- |
| `POST /payments`                        | `CREATE` | `Payment` | `membershipId`, `amount`, `paymentMethod`, `paymentDate`                              |
| `POST /payments/with-membership-update` | `CREATE` | `Payment` | Igual que el anterior, más `source: "createWithMembershipUpdate"`                     |
| `PATCH /payments/:id` (actualización)   | `UPDATE` | `Payment` | `before` (`amount`, `paymentMethod`, `paymentDate`, `notes`) y `after` (body enviado) |
| `DELETE /payments/:id` (soft delete)    | `DELETE` | `Payment` | `membershipId`, `amount`, `paymentDate`                                               |

En todos los casos `entityId` es el ID del pago y `performedById` es el usuario autenticado que hizo la operación.

> Los eventos de autenticación (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `LOGOUT`, `PASSWORD_RESET_REQUEST`, `PASSWORD_RESET_SUCCESS`) se guardan aparte, en la tabla `auth_audit_logs` (entidad `AuthAuditLog` del módulo auth, con email, userId, IP y user agent), y **no** se exponen por este endpoint ni por ningún otro.

---

## Entidades

### AuditLog

Tabla `audit_logs`.

| Campo         | Tipo         | Nullable | Descripción                       |
| ------------- | ------------ | -------- | --------------------------------- |
| id            | UUID         | No       | ID único (PK)                     |
| action        | enum         | No       | `CREATE`, `UPDATE`, `DELETE`      |
| entity        | varchar(100) | No       | Nombre de la entidad afectada     |
| entityId      | UUID         | Sí       | ID del registro afectado          |
| performedById | UUID         | Sí       | FK a User (`ON DELETE SET NULL`)  |
| details       | JSON         | Sí       | Datos adicionales de la operación |
| createdAt     | Date         | No       | Fecha de creación                 |
