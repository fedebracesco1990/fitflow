# User Routines Controller

> ⚠️ **DEPRECADO - Febrero 2026**
>
> Este módulo está **obsoleto**. La asignación de rutinas ahora se realiza a través de **Programas**.
>
> **Ver documentación actual:** [PROGRAMS.md](./PROGRAMS.md)
>
> El flujo actual es:
>
> 1. Crear Programa con Rutinas → `POST /programs`
> 2. Asignar Programa a Usuario → `POST /programs/assign`
> 3. Usuario ve sus rutinas → `GET /programs/my-program`
>
> Los endpoints de este archivo pueden seguir funcionando por compatibilidad,
> pero se recomienda migrar a la API de Programas.

---

Endpoints para asignación de rutinas a usuarios (legacy).

**Ruta base:** `/user-routines`

---

## Endpoints

| Método | Ruta                            | Descripción                  | Roles          |
| ------ | ------------------------------- | ---------------------------- | -------------- |
| POST   | `/user-routines`                | Asignar rutina               | ADMIN, TRAINER |
| POST   | `/user-routines/bulk`           | Asignación masiva            | ADMIN, TRAINER |
| GET    | `/user-routines/my-week`        | Mi semana                    | Todos          |
| GET    | `/user-routines/today`          | Rutina del día con historial | Todos          |
| GET    | `/user-routines/user/:userId`   | Rutinas de usuario           | ADMIN, TRAINER |
| GET    | `/user-routines/:id`            | Obtener asignación           | Todos          |
| PATCH  | `/user-routines/:id`            | Actualizar asignación        | ADMIN, TRAINER |
| PATCH  | `/user-routines/:id/deactivate` | Desactivar asignación        | ADMIN, TRAINER |
| DELETE | `/user-routines/:id`            | Eliminar asignación          | ADMIN, TRAINER |

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

## POST /user-routines/bulk

Asigna una rutina a múltiples usuarios en una sola operación. Envía notificaciones push a los usuarios asignados.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo       | Tipo  | Requerido | Descripción                  |
| ----------- | ----- | --------- | ---------------------------- |
| routineId   | UUID  | ✅        | ID de la rutina a asignar    |
| assignments | array | ✅        | Lista de asignaciones        |
| startDate   | date  | ✅        | Fecha de inicio (YYYY-MM-DD) |

**Estructura de assignments:**

| Campo     | Tipo   | Requerido | Descripción    |
| --------- | ------ | --------- | -------------- |
| userId    | UUID   | ✅        | ID del usuario |
| dayOfWeek | string | ✅        | Día de semana  |

**Ejemplo Request:**

```json
{
  "routineId": "550e8400-e29b-41d4-a716-446655440000",
  "assignments": [
    { "userId": "user-1-uuid", "dayOfWeek": "monday" },
    { "userId": "user-2-uuid", "dayOfWeek": "monday" },
    { "userId": "user-3-uuid", "dayOfWeek": "wednesday" }
  ],
  "startDate": "2026-01-10"
}
```

**Response (201):**

```json
{
  "success": true,
  "totalAssigned": 3,
  "totalNotifications": 3,
  "errors": []
}
```

**Response con errores parciales:**

```json
{
  "success": true,
  "totalAssigned": 2,
  "totalNotifications": 2,
  "errors": ["Rutina ya asignada a Juan Pérez el monday"]
}
```

---

## GET /user-routines/my-week

Obtiene las rutinas asignadas del usuario para la semana.

**Roles:** Todos los autenticados

**Response (200):**

```json
{
  "monday": [...],
  "tuesday": [...],
  ...
}
```

---

## GET /user-routines/today

Obtiene la rutina del día actual con ejercicios enriquecidos con datos de la última sesión (pesos, reps, sets). Ideal para precargar valores cuando el usuario va a entrenar.

**Roles:** Todos los autenticados

**Response (200):**

```json
{
  "userRoutine": {
    "id": "uuid",
    "dayOfWeek": "friday",
    "startDate": "2026-01-01",
    "isActive": true
  },
  "routine": {
    "id": "uuid",
    "name": "Día de Pecho",
    "description": "Rutina enfocada en pectorales",
    "difficulty": "intermediate",
    "estimatedDuration": 50
  },
  "exercises": [
    {
      "id": "uuid",
      "routineId": "uuid",
      "exerciseId": "uuid",
      "exercise": {
        "id": "uuid",
        "name": "Press de Banca",
        "description": "Ejercicio compuesto para pecho",
        "muscleGroupId": "uuid",
        "imageUrl": null,
        "videoUrl": null
      },
      "order": 1,
      "sets": 4,
      "reps": 10,
      "restSeconds": 90,
      "notes": null,
      "suggestedWeight": 60.0,
      "dayOfWeek": null,
      "lastWorkout": {
        "date": "2026-01-03",
        "sets": [
          { "setNumber": 1, "weight": 55.0, "reps": 10, "completed": true },
          { "setNumber": 2, "weight": 57.5, "reps": 10, "completed": true },
          { "setNumber": 3, "weight": 57.5, "reps": 8, "completed": true },
          { "setNumber": 4, "weight": 55.0, "reps": 10, "completed": true }
        ]
      }
    }
  ],
  "dayOfWeek": "friday",
  "hasHistory": true
}
```

**Response cuando no hay rutina asignada para hoy (200):**

```json
null
```

**Campos importantes:**

| Campo                          | Descripción                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `exercises[].lastWorkout`      | Datos de la última vez que hizo esta rutina (null si no hay historial) |
| `exercises[].lastWorkout.sets` | Array con peso/reps reales de cada set                                 |
| `hasHistory`                   | `true` si existe historial previo de esta rutina                       |

---

## GET /user-routines/user/:userId

Lista todas las rutinas asignadas a un usuario.

**Roles:** `ADMIN`, `TRAINER`

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
