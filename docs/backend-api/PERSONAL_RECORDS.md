# Personal Records API

Endpoints para gestión de récords personales de usuarios.

## Base URL

```
/personal-records
```

## Autenticación

Todos los endpoints requieren autenticación JWT.

---

## Endpoints

### GET /personal-records/me

Obtiene todos los récords personales del usuario autenticado.

**Roles:** `USER`, `TRAINER`, `ADMIN`

**Response 200:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "exerciseId": "uuid",
    "exercise": {
      "id": "uuid",
      "name": "Press de Banca",
      "muscleGroupId": "uuid"
    },
    "maxWeight": 100.0,
    "maxWeightReps": 5,
    "maxWeightAchievedAt": "2026-01-12T22:00:00.000Z",
    "maxVolume": 800.0,
    "maxVolumeWeight": 80.0,
    "maxVolumeReps": 10,
    "maxVolumeAchievedAt": "2026-01-10T20:00:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-12T22:00:00.000Z"
  }
]
```

---

### GET /personal-records/me/:exerciseId

Obtiene el récord personal del usuario para un ejercicio específico.

**Roles:** `USER`, `TRAINER`, `ADMIN`

**Parámetros:**

| Parámetro    | Tipo | Descripción      |
| ------------ | ---- | ---------------- |
| `exerciseId` | UUID | ID del ejercicio |

**Response 200:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "exerciseId": "uuid",
  "exercise": {
    "id": "uuid",
    "name": "Press de Banca"
  },
  "maxWeight": 100.0,
  "maxWeightReps": 5,
  "maxWeightAchievedAt": "2026-01-12T22:00:00.000Z",
  "maxVolume": 800.0,
  "maxVolumeWeight": 80.0,
  "maxVolumeReps": 10,
  "maxVolumeAchievedAt": "2026-01-10T20:00:00.000Z"
}
```

**Response 404:** Récord no encontrado

---

### GET /personal-records/users/:userId

Obtiene todos los récords personales de un usuario específico.

**Roles:** `ADMIN`, `TRAINER`

**Parámetros:**

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `userId`  | UUID | ID del usuario |

**Response 200:** Array de PersonalRecord (mismo formato que /me)

---

### GET /personal-records/users/:userId/:exerciseId

Obtiene el récord personal de un usuario para un ejercicio específico.

**Roles:** `ADMIN`, `TRAINER`

**Parámetros:**

| Parámetro    | Tipo | Descripción      |
| ------------ | ---- | ---------------- |
| `userId`     | UUID | ID del usuario   |
| `exerciseId` | UUID | ID del ejercicio |

**Response 200:** PersonalRecord object

**Response 404:** Récord no encontrado

---

## Modelo de Datos

### PersonalRecord

| Campo                 | Tipo     | Descripción                  |
| --------------------- | -------- | ---------------------------- |
| `id`                  | UUID     | ID único del registro        |
| `userId`              | UUID     | ID del usuario               |
| `exerciseId`          | UUID     | ID del ejercicio             |
| `maxWeight`           | decimal  | Peso máximo levantado (kg)   |
| `maxWeightReps`       | int      | Repeticiones con peso máximo |
| `maxWeightAchievedAt` | datetime | Fecha del PR de peso         |
| `maxVolume`           | decimal  | Volumen máximo (peso × reps) |
| `maxVolumeWeight`     | decimal  | Peso usado en PR de volumen  |
| `maxVolumeReps`       | int      | Reps en PR de volumen        |
| `maxVolumeAchievedAt` | datetime | Fecha del PR de volumen      |

---

## Detección Automática de PRs

Los récords personales se detectan automáticamente al:

1. Registrar un ejercicio via `POST /workouts/:id/exercises`
2. Registrar ejercicios en bulk via `POST /workouts/:id/exercises/bulk`

Cuando se detecta un nuevo PR:

- Se actualiza la tabla `personal_records`
- Se envía una notificación push al usuario
- El PR puede ser de tipo: `weight`, `volume`, o `both`

### Tipos de PR

| Tipo     | Descripción                                |
| -------- | ------------------------------------------ |
| `weight` | Nuevo peso máximo levantado                |
| `volume` | Nuevo volumen máximo (peso × repeticiones) |
| `both`   | Nuevo récord en ambas categorías           |
