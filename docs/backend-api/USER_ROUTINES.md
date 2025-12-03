# User Routines Controller

Endpoints para asignación de rutinas a usuarios.

**Ruta base:** `/user-routines`

---

## Endpoints

| Método | Ruta                            | Descripción           | Roles          |
| ------ | ------------------------------- | --------------------- | -------------- |
| POST   | `/user-routines`                | Asignar rutina        | ADMIN, TRAINER |
| GET    | `/user-routines/my-week`        | Mi semana             | Todos          |
| GET    | `/user-routines/user/:userId`   | Rutinas de usuario    | ADMIN, TRAINER |
| GET    | `/user-routines/:id`            | Obtener asignación    | Todos          |
| PATCH  | `/user-routines/:id`            | Actualizar asignación | ADMIN, TRAINER |
| PATCH  | `/user-routines/:id/deactivate` | Desactivar asignación | ADMIN, TRAINER |
| DELETE | `/user-routines/:id`            | Eliminar asignación   | ADMIN, TRAINER |

---

## POST /user-routines

Asigna una rutina a un usuario para un día específico.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo     | Tipo   | Requerido | Descripción                                                          |
| --------- | ------ | --------- | -------------------------------------------------------------------- |
| userId    | UUID   | ✅        | ID del usuario                                                       |
| routineId | UUID   | ✅        | ID de la rutina                                                      |
| dayOfWeek | string | ✅        | Día (monday, tuesday, wednesday, thursday, friday, saturday, sunday) |
| startDate | date   | ❌        | Fecha de inicio                                                      |

**Response (201):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "routineId": "uuid",
  "dayOfWeek": "monday",
  "startDate": "2024-01-01",
  "isActive": true,
  "routine": {
    "id": "uuid",
    "name": "Rutina Full Body",
    "difficulty": "beginner",
    "estimatedDuration": 45
  }
}
```

---

## GET /user-routines/my-week

Obtiene las rutinas asignadas del usuario para la semana.

**Roles:** Todos los autenticados

**Response (200):**

```json
[
  {
    "id": "uuid",
    "dayOfWeek": "monday",
    "isActive": true,
    "routine": {
      "id": "uuid",
      "name": "Día de Pecho",
      "difficulty": "intermediate",
      "estimatedDuration": 50,
      "exercises": [
        {
          "id": "uuid",
          "order": 1,
          "sets": 4,
          "reps": 10,
          "exercise": {
            "id": "uuid",
            "name": "Press de Banca"
          }
        }
      ]
    }
  },
  {
    "id": "uuid",
    "dayOfWeek": "wednesday",
    "routine": { ... }
  }
]
```

---

## GET /user-routines/user/:userId

Lista todas las rutinas asignadas a un usuario.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Array de asignaciones con rutinas

---

## GET /user-routines/:id

Obtiene una asignación específica.

**Roles:** Todos los autenticados

**Response (200):** Asignación con rutina completa

---

## PATCH /user-routines/:id

Actualiza una asignación.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo     | Tipo    | Descripción      |
| --------- | ------- | ---------------- |
| dayOfWeek | string  | Día de la semana |
| startDate | date    | Fecha de inicio  |
| isActive  | boolean | Estado           |

**Response (200):** Asignación actualizada

---

## PATCH /user-routines/:id/deactivate

Desactiva una asignación (soft delete).

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Asignación con `isActive: false`

---

## DELETE /user-routines/:id

Elimina una asignación permanentemente.

**Roles:** `ADMIN`, `TRAINER`

**Response:** 204 No Content
