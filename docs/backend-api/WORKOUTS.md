# Workouts Controller

Endpoints para registro de entrenamientos.

**Ruta base:** `/workouts`

> Un workout (`WorkoutLog`) siempre pertenece a una rutina del plan asignado al usuario (`UserProgramRoutine`). Todos los endpoints validan que el workout/rutina sea del usuario autenticado.

---

## Endpoints

| Método | Ruta                             | Descripción                                  | Roles |
| ------ | -------------------------------- | -------------------------------------------- | ----- |
| POST   | `/workouts/start/:routineId`     | Iniciar entrenamiento de una rutina          | Todos |
| GET    | `/workouts/my-history`           | Mi historial                                 | Todos |
| GET    | `/workouts/last/:routineId`      | Último entrenamiento completado de la rutina | Todos |
| GET    | `/workouts/:id`                  | Obtener entrenamiento                        | Todos |
| PATCH  | `/workouts/:id`                  | Actualizar entrenamiento                     | Todos |
| PATCH  | `/workouts/:id/complete`         | Completar entrenamiento                      | Todos |
| GET    | `/workouts/:id/exercises`        | Listar sets registrados                      | Todos |
| POST   | `/workouts/:id/exercises`        | Agregar un set                               | Todos |
| PATCH  | `/workouts/:id/exercises/:logId` | Actualizar set                               | Todos |
| DELETE | `/workouts/:id/exercises/:logId` | Eliminar set                                 | Todos |

---

## POST /workouts/start/:routineId

Inicia un nuevo entrenamiento para una rutina del plan del usuario. Crea el workout con status `in_progress` y `startedAt` = ahora, y genera automáticamente los sets (`exerciseLogs`) de cada ejercicio de la rutina con `completed: false`.

**Roles:** Todos los autenticados

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción                                                                       |
| --------- | ---- | --------------------------------------------------------------------------------- |
| routineId | UUID | ID de la rutina del plan del usuario (`UserProgramRoutine`), no de la rutina base |

**Pre-carga de valores:**

- Si existe un workout completado previo de la misma rutina, cada set toma `reps` y `weight` del set equivalente (mismo ejercicio y número de serie) de ese workout.
- Si no hay valor previo, se usan las `reps` y el `weight` planificados del ejercicio.
- La cantidad de sets por ejercicio es el máximo entre los sets planificados y los sets registrados en el último workout completado.

**Response (201):** El workout creado, con el mismo formato que `GET /workouts/:id`.

```json
{
  "id": "uuid",
  "userProgramRoutineId": "uuid",
  "startedAt": "2024-01-01T10:00:00.000Z",
  "finishedAt": null,
  "status": "in_progress",
  "duration": null,
  "notes": null,
  "userProgramRoutine": { "...": "rutina del plan con userProgram y exercises" },
  "exerciseLogs": [
    {
      "id": "uuid",
      "exerciseId": "uuid",
      "setNumber": 1,
      "reps": 12,
      "weight": "50.00",
      "completed": false,
      "exercise": { "id": "uuid", "name": "Press de Banca" }
    }
  ],
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

**Errores:**

| Código | Descripción                       |
| ------ | --------------------------------- |
| 403    | La rutina no pertenece al usuario |
| 404    | Rutina no encontrada              |

---

## GET /workouts/my-history

Obtiene el historial de entrenamientos **completados** del usuario con paginación, ordenados por `finishedAt` descendente.

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
      "userProgramRoutineId": "uuid",
      "startedAt": "2024-01-01T10:00:00.000Z",
      "finishedAt": "2024-01-01T10:45:00.000Z",
      "status": "completed",
      "duration": 45,
      "userProgramRoutine": {
        "id": "uuid",
        "name": "Rutina Full Body"
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

> **Nota:** Los `exerciseLogs` (con su `exercise`) se incluyen en cada workout pero sin paginación interna.

---

## GET /workouts/last/:routineId

Obtiene el último entrenamiento **completado** de una rutina del plan del usuario (el de `finishedAt` más reciente), con sus `exerciseLogs` y el `exercise` de cada uno. Sirve para mostrar los valores de la sesión anterior.

**Roles:** Todos los autenticados

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción                                     |
| --------- | ---- | ----------------------------------------------- |
| routineId | UUID | ID de la rutina del plan (`UserProgramRoutine`) |

**Response (200):** El workout completado, o `null` si no hay ninguno, si la rutina no existe o si no pertenece al usuario (no responde 403/404).

---

## GET /workouts/:id

Obtiene un entrenamiento específico, con `userProgramRoutine` (incluye `userProgram` y `exercises`) y `exerciseLogs` (con `exercise`).

**Roles:** Todos los autenticados

> Solo puede ver sus propios entrenamientos

**Errores:**

| Código | Descripción                        |
| ------ | ---------------------------------- |
| 403    | El workout no pertenece al usuario |
| 404    | Workout no encontrado              |

---

## PATCH /workouts/:id

Actualiza un entrenamiento.

**Roles:** Todos los autenticados

**Request Body:**

| Campo    | Tipo   | Descripción                                            |
| -------- | ------ | ------------------------------------------------------ |
| status   | string | Estado (ver [Estados de Workout](#estados-de-workout)) |
| duration | number | Duración en minutos (min 1)                            |
| notes    | string | Notas                                                  |

**Response (200):** Entrenamiento actualizado

---

## PATCH /workouts/:id/complete

Completa un entrenamiento: status `completed`, `finishedAt` = ahora, y actualiza `lastCompletedAt` de la rutina del plan.

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
  "duration": 45,
  "startedAt": "2024-01-01T10:00:00.000Z",
  "finishedAt": "2024-01-01T10:45:00.000Z"
}
```

---

## GET /workouts/:id/exercises

Lista los sets registrados de un entrenamiento, ordenados por ejercicio y número de serie.

**Roles:** Todos los autenticados

**Response (200):**

```json
[
  {
    "id": "uuid",
    "workoutLogId": "uuid",
    "exerciseId": "uuid",
    "setNumber": 1,
    "reps": 12,
    "weight": "50.00",
    "completed": true,
    "notes": null,
    "rir": 2,
    "rpe": "8.0",
    "exercise": {
      "id": "uuid",
      "name": "Press de Banca"
    }
  }
]
```

---

## POST /workouts/:id/exercises

Agrega un set a un entrenamiento (por ejemplo, una serie extra). Los sets planificados ya se crean al iniciar el workout con `POST /workouts/start/:routineId`.

**Roles:** Todos los autenticados

**Request Body:**

| Campo      | Tipo           | Requerido | Descripción        |
| ---------- | -------------- | --------- | ------------------ |
| exerciseId | UUID           | ✅        | ID del ejercicio   |
| setNumber  | number         | ✅        | Número de serie    |
| reps       | number         | ✅        | Repeticiones       |
| weight     | number \| null | ✅        | Peso (kg) o `null` |

> El set se crea con `completed: false`. Para marcarlo como completado (y evaluar récords personales) se usa `PATCH /workouts/:id/exercises/:logId`.

**Response (201):**

```json
{
  "id": "uuid",
  "workoutLogId": "uuid",
  "exerciseId": "uuid",
  "setNumber": 4,
  "reps": 10,
  "weight": 50,
  "completed": false
}
```

---

## PATCH /workouts/:id/exercises/:logId

Actualiza un set. Si la actualización incluye `completed: true`, `weight` y `reps` > 0, se evalúa si es un nuevo récord personal; en ese caso se notifica al usuario.

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

**Response (200):**

```json
{
  "log": { "id": "uuid", "setNumber": 1, "reps": 12, "weight": 50, "completed": true },
  "prResult": {
    "isNewPR": true,
    "type": "weight",
    "exerciseName": "Press de Banca"
  }
}
```

> `prResult` solo se incluye cuando hay un nuevo récord personal.

**Errores:**

| Código | Descripción                    |
| ------ | ------------------------------ |
| 404    | Log de ejercicio no encontrado |

---

## DELETE /workouts/:id/exercises/:logId

Elimina un set.

**Roles:** Todos los autenticados

**Response (200):** Vacío

**Errores:**

| Código | Descripción                    |
| ------ | ------------------------------ |
| 404    | Log de ejercicio no encontrado |

---

## Estados de Workout

| Estado        | Descripción             |
| ------------- | ----------------------- |
| `pending`     | Creado pero no iniciado |
| `in_progress` | En progreso             |
| `completed`   | Finalizado              |
| `skipped`     | Omitido                 |

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
