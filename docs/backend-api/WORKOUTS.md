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
| DELETE | `/workouts/:id/exercises/:logId` | Eliminar ejercicio       | Todos |
| POST   | `/workouts/:id/exercises/bulk`   | Registrar múltiples sets | Todos |

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

| Campo             | Tipo    | Requerido | Descripción                       |
| ----------------- | ------- | --------- | --------------------------------- |
| routineExerciseId | UUID    | ✅        | ID del ejercicio en rutina        |
| setNumber         | number  | ✅        | Número de serie (1-20)            |
| reps              | number  | ✅        | Repeticiones realizadas (0-100)   |
| weight            | number  | ❌        | Peso utilizado (kg)               |
| completed         | boolean | ❌        | Si se completó (default: true)    |
| notes             | string  | ❌        | Notas del set                     |
| rir               | number  | ❌        | Reps In Reserve (0-5)             |
| rpe               | number  | ❌        | Rate of Perceived Exertion (1-10) |

**Response (201):**

```json
{
  "id": "uuid",
  "workoutLogId": "uuid",
  "routineExerciseId": "uuid",
  "setNumber": 1,
  "reps": 12,
  "weight": 50,
  "completed": true,
  "notes": null,
  "rir": 2,
  "rpe": 8.0
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

| Campo     | Tipo    | Descripción                       |
| --------- | ------- | --------------------------------- |
| reps      | number  | Repeticiones (0-100)              |
| weight    | number  | Peso (kg)                         |
| completed | boolean | Completado                        |
| notes     | string  | Notas                             |
| rir       | number  | Reps In Reserve (0-5)             |
| rpe       | number  | Rate of Perceived Exertion (1-10) |

**Response (200):** Log actualizado

---

## DELETE /workouts/:id/exercises/:logId

Elimina un log de ejercicio.

**Roles:** Todos los autenticados

**Response (200):** Vacío

---

## POST /workouts/:id/exercises/bulk

Registra múltiples sets de ejercicios en una sola llamada.

**Roles:** Todos los autenticados

**Request Body:**

| Campo     | Tipo  | Requerido | Descripción           |
| --------- | ----- | --------- | --------------------- |
| exercises | array | ✅        | Array de sets a crear |

**Estructura de cada ejercicio en el array:**

| Campo             | Tipo    | Requerido | Descripción                       |
| ----------------- | ------- | --------- | --------------------------------- |
| routineExerciseId | UUID    | ✅        | ID del ejercicio en rutina        |
| setNumber         | number  | ✅        | Número de serie (1-20)            |
| reps              | number  | ✅        | Repeticiones realizadas (0-100)   |
| weight            | number  | ❌        | Peso utilizado (kg)               |
| completed         | boolean | ❌        | Si se completó (default: true)    |
| notes             | string  | ❌        | Notas del set                     |
| rir               | number  | ❌        | Reps In Reserve (0-5)             |
| rpe               | number  | ❌        | Rate of Perceived Exertion (1-10) |

**Ejemplo Request:**

```json
{
  "exercises": [
    {
      "routineExerciseId": "uuid-1",
      "setNumber": 1,
      "reps": 12,
      "weight": 50,
      "rir": 2,
      "rpe": 8
    },
    {
      "routineExerciseId": "uuid-1",
      "setNumber": 2,
      "reps": 10,
      "weight": 52.5,
      "rir": 1,
      "rpe": 8.5
    },
    {
      "routineExerciseId": "uuid-2",
      "setNumber": 1,
      "reps": 8,
      "weight": 80,
      "completed": true
    }
  ]
}
```

**Response (201):** Array de logs creados

```json
[
  {
    "id": "uuid",
    "workoutLogId": "uuid",
    "routineExerciseId": "uuid-1",
    "setNumber": 1,
    "reps": 12,
    "weight": 50,
    "completed": true,
    "notes": null,
    "rir": 2,
    "rpe": 8.0
  },
  ...
]
```

> **Nota:** Todos los ejercicios deben pertenecer a la rutina asociada al workout. Si alguno no pertenece, retorna error 404.

---

## Estados de Workout

| Estado        | Descripción             |
| ------------- | ----------------------- |
| `pending`     | Creado pero no iniciado |
| `in_progress` | En progreso             |
| `completed`   | Finalizado              |
| `cancelled`   | Cancelado               |

---

## Campos RIR y RPE

### RIR (Reps In Reserve)

Indica cuántas repeticiones adicionales podrías haber hecho.

| Valor | Significado                      |
| ----- | -------------------------------- |
| 0     | Fallo muscular                   |
| 1     | Podría hacer 1 rep más           |
| 2     | Podría hacer 2 reps más          |
| 3     | Podría hacer 3 reps más          |
| 4     | Podría hacer 4 reps más          |
| 5     | Podría hacer 5+ reps más (fácil) |

### RPE (Rate of Perceived Exertion)

Escala de esfuerzo percibido del 1 al 10.

| Valor | Significado             |
| ----- | ----------------------- |
| 10    | Máximo esfuerzo / Fallo |
| 9     | Muy difícil, 1 rep más  |
| 8     | Difícil, 2 reps más     |
| 7     | Moderadamente difícil   |
| 6     | Moderado                |
| 1-5   | Fácil a muy fácil       |
