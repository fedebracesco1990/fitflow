# PWA Offline Workouts - Documentación Técnica

## Descripción General

El sistema PWA offline permite a los usuarios de FitFlow realizar entrenamientos completos sin conexión a internet. Implementa una estrategia de doble caché (NGSW + IndexedDB) con sincronización automática al reconectar.

## Arquitectura

### Capas

1. **Angular Service Worker (NGSW)** — Caché HTTP transparente configurado en `ngsw-config.json`
2. **IndexedDB (Dexie v3)** — Caché explícito gestionado por `OfflineDbService`
3. **Sync Queue** — Cola de operaciones pendientes procesada al reconectar

### Patrón Wrapper (Online-First + Fallback)

Los componentes nunca llaman directamente a los servicios API. En su lugar, usan servicios "offline wrapper" que:

1. Intentan la operación online
2. Si tiene éxito, cachean el resultado en IndexedDB
3. Si falla (o está offline), usan datos de IndexedDB
4. Si es una operación de escritura offline, encolan en `SyncQueue`

## Servicios

### `OfflineDbService`

Base de datos IndexedDB con Dexie v3. Tablas:

| Tabla                | Clave    | Contenido                                 |
| -------------------- | -------- | ----------------------------------------- |
| `syncQueue`          | `id`     | Operaciones pendientes de sincronización  |
| `cachedWorkouts`     | `id`     | WorkoutLog cacheados                      |
| `cachedExerciseLogs` | `id`     | ExerciseLog individuales                  |
| `cachedPrograms`     | `id`     | Programa del usuario (MyProgramResponse)  |
| `cachedRoutines`     | `id`     | Rutinas individuales (MyRoutineResponse)  |
| `idMappings`         | `tempId` | Mapeo de IDs temporales → IDs de servidor |

### `OfflineProgramsService`

Wrapper de `UserProgramsService`. Métodos:

- **`getMyProgram()`** — Carga el programa asignado al usuario. Online: llama API y cachea. Offline: lee de IndexedDB.
- **`getMyRoutine(routineId)`** — Carga una rutina específica con sus ejercicios. Mismo patrón online/offline.

### `OfflineWorkoutsService`

Wrapper de `WorkoutsService`. Métodos principales:

- **`startWorkout(routineId)`** — Online: llama API, cachea workout + exercise logs. Offline: genera WorkoutLog temporal con exerciseLogs desde la rutina cacheada, encola `START_WORKOUT`.
- **`updateExerciseLogOffline(logId, data)`** — Actualiza un exercise log en caché y encola `UPDATE_EXERCISE_LOG`.
- **`complete(id, duration)`** — Online: llama API. Offline: marca como completado en caché, encola `COMPLETE_WORKOUT`.

### `WorkoutStateService`

Gestiona el estado de la sesión de entrenamiento activa:

- `exerciseStates` — Estado de cada ejercicio (completado, en progreso, pendiente). Cada `ExerciseState` incluye `restSeconds` (duración de descanso configurada en la rutina)
- `workoutLogId` — ID del WorkoutLog activo
- `exerciseLogsMap` — Mapa de exerciseId → ExerciseLog[] para acceso rápido
- `getExerciseLogsForExercise(exerciseId)` — Retorna los logs de un ejercicio específico

**Rest Timer State:**

- `isResting` — Signal booleano que indica si el timer de descanso está activo
- `restDuration` — Duración del descanso actual en segundos
- `restType` — Tipo de descanso: `'set'` (entre series) o `'exercise'` (entre ejercicios) o `null`
- `startSetRest(duration)` — Inicia descanso entre series (no avanza al siguiente ejercicio al terminar)
- `startExerciseRest(duration)` — Inicia descanso entre ejercicios (llama `moveToNextExercise()` al terminar)
- `endRest()` / `skipRest()` — Finaliza el descanso; si `restType === 'exercise'`, avanza al siguiente ejercicio

**Flujo del Rest Timer:**

```
Completar set (quedan sets) → startSetRest() → RestTimerComponent → endRest() → continúa en mismo ejercicio
Completar ejercicio          → startExerciseRest() → RestTimerComponent → endRest() → moveToNextExercise() → navega a workout-active
Último ejercicio             → markCurrentCompleted() → navega a workout-active (sin timer)
```

### `SyncManagerService`

Procesa la cola de sincronización al reconectar:

1. Lee operaciones pendientes ordenadas por timestamp
2. **Resuelve IDs temporales** en el endpoint URL usando `idMappings`
3. Ejecuta la operación HTTP contra el backend
4. Si es `START_WORKOUT`, guarda el mapeo tempId → serverId
5. Marca la operación como completada o con error

### `SyncQueueService`

Cola FIFO de operaciones pendientes. Cada operación tiene:

- `type` — Tipo de operación (`START_WORKOUT`, `UPDATE_EXERCISE_LOG`, `COMPLETE_WORKOUT`)
- `endpoint` — URL relativa del API (puede contener IDs temporales)
- `method` — HTTP method (`POST`, `PUT`, `PATCH`)
- `data` — Body de la request
- `status` — `pending`, `processing`, `completed`, `error`

## Flujo de Datos

### Iniciar Entrenamiento (Online)

```
WorkoutActiveComponent
  → OfflineWorkoutsService.startWorkout(routineId)
    → WorkoutsService.startWorkout(routineId)  [HTTP POST]
      → Backend crea WorkoutLog + ExerciseLogs
    → cacheWorkoutWithLogs(workout)  [IndexedDB]
    → WorkoutStateService.initWorkout(exercises, workoutLogId, exerciseLogs)
```

### Iniciar Entrenamiento (Offline)

```
WorkoutActiveComponent
  → OfflineWorkoutsService.startWorkout(routineId)
    → startWorkoutOffline(routineId)
      → Lee rutina cacheada de IndexedDB
      → Genera WorkoutLog con temp_id
      → Genera ExerciseLogs con temp_ids desde UserProgramExercise
      → Cachea workout + logs en IndexedDB
      → Encola START_WORKOUT en SyncQueue
    → WorkoutStateService.initWorkout(exercises, tempWorkoutLogId, tempExerciseLogs)
```

### Sincronización al Reconectar

```
NetworkService detecta reconexión
  → SyncManagerService.processQueue()
    → Para cada operación pendiente:
      → resolveEndpointIds(endpoint)  [reemplaza temp_ids por server_ids]
      → HTTP request al backend
      → Si START_WORKOUT: guarda idMapping(tempId → serverId)
      → Marca operación como completada
```

## Configuración NGSW

Archivo: `ngsw-config.json`

DataGroups configurados con estrategia `freshness` (online-first):

| Grupo                  | URLs                       | MaxAge | Timeout |
| ---------------------- | -------------------------- | ------ | ------- |
| `workouts-api`         | `/api/workouts/**`         | 1h     | 5s      |
| `exercises-api`        | `/api/exercises/**`        | 1d     | -       |
| `routines-api`         | `/api/routines/**`         | 1h     | 5s      |
| `stats-api`            | `/api/stats/**`            | 30m    | 5s      |
| `personal-records-api` | `/api/personal-records/**` | 1h     | 5s      |
| `programs-api`         | `/api/programs/**`         | 1h     | 5s      |

## IDs Temporales

Cuando se crean entidades offline, se generan IDs temporales con el formato:

```
temp_{timestamp}_{random9chars}
```

Ejemplo: `temp_1707400000000_a1b2c3d4e`

El `SyncManagerService` usa una regex `/temp_\d+_[a-z0-9]+/g` para detectar y resolver estos IDs en los endpoints antes de enviar las requests al backend.

## Componentes Involucrados

| Componente               | Servicio Offline         | Función                               |
| ------------------------ | ------------------------ | ------------------------------------- |
| `WorkoutListComponent`   | `OfflineProgramsService` | Muestra lista de rutinas del programa |
| `WorkoutActiveComponent` | `OfflineWorkoutsService` | Sesión de entrenamiento activa        |
| `ExerciseSetsComponent`  | `OfflineWorkoutsService` | Gestión de sets y reps por ejercicio  |

## Limitaciones Conocidas

- El endpoint `/api/stats/me/monthly` devuelve 500 (bug de backend pendiente). El dashboard maneja esto con `catchError`.
- La expiración de caché es de 24 horas (`CACHE_EXPIRY_MS`). Datos más antiguos se consideran stale.
- Si el usuario no ha cargado su programa estando online al menos una vez, no habrá datos en caché para el modo offline.
