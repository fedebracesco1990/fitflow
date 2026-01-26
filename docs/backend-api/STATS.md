# Stats API

Endpoints para estadísticas de entrenamiento y progreso.

## Base URL

```
/api/stats
```

## Autenticación

Todos los endpoints requieren JWT. Los endpoints `/users/:userId/*` requieren rol `ADMIN` o `TRAINER`.

---

## Endpoints del Usuario Actual

### Progreso de Ejercicio

Obtiene la evolución de peso/reps de un ejercicio específico.

```
GET /stats/me/progress/:exerciseId
```

**Query Parameters:**

| Parámetro   | Tipo   | Descripción        |
| ----------- | ------ | ------------------ |
| `startDate` | string | Fecha inicio (ISO) |
| `endDate`   | string | Fecha fin (ISO)    |

**Response 200:**

```json
{
  "exerciseId": "uuid",
  "exerciseName": "Press Banca",
  "data": [
    {
      "date": "2024-01-01",
      "maxWeight": 80,
      "maxReps": 8,
      "totalVolume": 1920
    },
    {
      "date": "2024-01-08",
      "maxWeight": 82.5,
      "maxReps": 8,
      "totalVolume": 1980
    }
  ]
}
```

---

### Estadísticas de Volumen

Obtiene el volumen total de entrenamiento por período.

```
GET /stats/me/volume
```

**Query Parameters:**

| Parámetro   | Tipo   | Descripción        |
| ----------- | ------ | ------------------ |
| `startDate` | string | Fecha inicio (ISO) |
| `endDate`   | string | Fecha fin (ISO)    |

**Response 200:**

```json
{
  "totalVolume": 45000,
  "totalSets": 120,
  "totalReps": 960,
  "averageVolumePerWorkout": 5000,
  "byMuscleGroup": [
    {
      "muscleGroup": "Pecho",
      "volume": 12000,
      "percentage": 26.7
    }
  ]
}
```

---

### Comparación Mensual

Compara el progreso del mes actual vs el anterior.

```
GET /stats/me/monthly
```

**Response 200:**

```json
{
  "currentMonth": {
    "workouts": 12,
    "totalVolume": 45000,
    "averageVolume": 3750
  },
  "previousMonth": {
    "workouts": 10,
    "totalVolume": 38000,
    "averageVolume": 3800
  },
  "comparison": {
    "workoutsDiff": 2,
    "workoutsPercent": 20,
    "volumeDiff": 7000,
    "volumePercent": 18.4
  }
}
```

---

## Endpoints Admin/Trainer

### Progreso de Ejercicio (Usuario)

```
GET /stats/users/:userId/progress/:exerciseId
```

**Roles:** `ADMIN`, `TRAINER`

Mismos parámetros y respuesta que `/stats/me/progress/:exerciseId`

---

### Estadísticas de Volumen (Usuario)

```
GET /stats/users/:userId/volume
```

**Roles:** `ADMIN`, `TRAINER`

Mismos parámetros y respuesta que `/stats/me/volume`

---

### Comparación Mensual (Usuario)

```
GET /stats/users/:userId/monthly
```

**Roles:** `ADMIN`, `TRAINER`

Misma respuesta que `/stats/me/monthly`
