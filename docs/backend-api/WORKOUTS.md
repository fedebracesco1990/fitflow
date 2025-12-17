# Workouts Controller

Endpoints para registro de entrenamientos.

**Ruta base:** `/workouts`

---

## Endpoints

| Método | Ruta                             | Descripción              | Roles |
| ------ | -------------------------------- | ------------------------ | ----- |
| POST   | `/workouts`                      | Crear entrenamiento      | Todos |
| GET    | `/workouts/my-history`           | Mi historial             | Todos |
| GET    | `/workouts/:id`                  | Obtener entrenamiento    | Todos |
| PATCH  | `/workouts/:id`                  | Actualizar entrenamiento | Todos |
| PATCH  | `/workouts/:id/start`            | Iniciar entrenamiento    | Todos |
| PATCH  | `/workouts/:id/complete`         | Completar entrenamiento  | Todos |
| POST   | `/workouts/:id/exercises`        | Registrar ejercicio      | Todos |
| GET    | `/workouts/:id/exercises`        | Listar ejercicios        | Todos |
| PATCH  | `/workouts/:id/exercises/:logId` | Actualizar ejercicio     | Todos |

---

## POST /workouts

Crea un nuevo registro de entrenamiento.

**Roles:** Todos los autenticados

**Request Body:**

| Campo         | Tipo   | Requerido | Descripción                       |
| ------------- | ------ | --------- | --------------------------------- |
| userRoutineId | UUID   | ✅        | ID de la rutina asignada          |
| date          | string | ✅        | Fecha en formato ISO (YYYY-MM-DD) |
| notes         | string | ❌        | Notas previas                     |

**Response (201):**

```json
{
  "id": "uuid",
  "userRoutineId": "uuid",
  "date": "2024-01-01",
  "status": "pending",
  "duration": null,
  "notes": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /workouts/my-history

Obtiene el historial de entrenamientos del usuario con paginación.

**Roles:** Todos los autenticados

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
      "date": "2024-01-01",
      "status": "completed",
      "durationMinutes": 45,
      "userRoutine": {
        "routine": {
          "id": "uuid",
          "name": "Rutina Full Body"
        }
      },
      "exerciseLogs": [...]
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

> **Nota:** Los ejerciseLogs se incluyen en cada workout pero sin paginación interna.

---

## GET /workouts/:id (sin cambios)

**Response anterior eliminado para brevedad**

```json
{
  "id": "uuid",
  "date": "2024-01-01",
  "status": "completed",
  "durationMinutes": 45,
  "routine": {
    "id": "uuid",
    "name": "Rutina Full Body"
  },
  "exerciseLogs": [
    {
      "id": "uuid",
      "setNumber": 1,
      "reps": 12,
      "weight": 50,
        "completed": true
      }
    ]
  }
]
```

---

## GET /workouts/:id

Obtiene un entrenamiento específico.

**Roles:** Todos los autenticados

> Solo puede ver sus propios entrenamientos

**Response (200):** Entrenamiento con ejercicios y logs

---

## PATCH /workouts/:id

Actualiza un entrenamiento.

**Roles:** Todos los autenticados

**Request Body:**

| Campo  | Tipo   | Descripción |
| ------ | ------ | ----------- |
| notes  | string | Notas       |
| status | string | Estado      |

**Response (200):** Entrenamiento actualizado

---

## PATCH /workouts/:id/start

Inicia un entrenamiento (cambia status a `in_progress`).

**Roles:** Todos los autenticados

**Response (200):**

```json
{
  "id": "uuid",
  "status": "in_progress",
  "startedAt": "2024-01-01T10:00:00.000Z"
}
```

---

## PATCH /workouts/:id/complete

Completa un entrenamiento.

**Roles:** Todos los autenticados

**Request Body:**

| Campo    | Tipo   | Descripción                    |
| -------- | ------ | ------------------------------ |
| duration | number | Duración en minutos (opcional) |

**Response (200):**

```json
{
  "id": "uuid",
  "status": "completed",
  "durationMinutes": 45,
  "completedAt": "2024-01-01T10:45:00.000Z"
}
```

---

## POST /workouts/:id/exercises

Registra un set de un ejercicio.

**Roles:** Todos los autenticados

**Request Body:**

| Campo             | Tipo    | Requerido | Descripción                    |
| ----------------- | ------- | --------- | ------------------------------ |
| routineExerciseId | UUID    | ✅        | ID del ejercicio en rutina     |
| setNumber         | number  | ✅        | Número de serie                |
| reps              | number  | ✅        | Repeticiones realizadas        |
| weight            | number  | ❌        | Peso utilizado (kg)            |
| completed         | boolean | ❌        | Si se completó (default: true) |
| notes             | string  | ❌        | Notas del set                  |

**Response (201):**

```json
{
  "id": "uuid",
  "workoutLogId": "uuid",
  "exerciseId": "uuid",
  "setNumber": 1,
  "reps": 12,
  "weight": 50,
  "completed": true,
  "notes": null
}
```

---

## GET /workouts/:id/exercises

Lista los logs de ejercicios de un entrenamiento.

**Roles:** Todos los autenticados

**Response (200):**

```json
[
  {
    "id": "uuid",
    "setNumber": 1,
    "reps": 12,
    "weight": 50,
    "completed": true,
    "exercise": {
      "id": "uuid",
      "name": "Press de Banca"
    }
  }
]
```

---

## PATCH /workouts/:id/exercises/:logId

Actualiza un log de ejercicio.

**Roles:** Todos los autenticados

**Request Body:**

| Campo     | Tipo    | Descripción  |
| --------- | ------- | ------------ |
| reps      | number  | Repeticiones |
| weight    | number  | Peso         |
| completed | boolean | Completado   |
| notes     | string  | Notas        |

**Response (200):** Log actualizado

---

## Estados de Workout

| Estado        | Descripción             |
| ------------- | ----------------------- |
| `pending`     | Creado pero no iniciado |
| `in_progress` | En progreso             |
| `completed`   | Finalizado              |
| `cancelled`   | Cancelado               |
