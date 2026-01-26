# Attendance API

Endpoints para consulta de asistencia de usuarios.

## Base URL

```
/api/attendance
```

## Autenticación

Todos los endpoints requieren JWT. Algunos requieren rol `ADMIN` o `TRAINER`.

---

## Endpoints

### Listar Asistencia

Lista registros de asistencia con paginación.

```
GET /attendance
```

**Roles:** `ADMIN`, `TRAINER`

**Query Parameters:**

| Parámetro   | Tipo   | Descripción              |
| ----------- | ------ | ------------------------ |
| `page`      | number | Página (default: 1)      |
| `limit`     | number | Items por página (10-50) |
| `userId`    | uuid   | Filtrar por usuario      |
| `startDate` | string | Fecha inicio (ISO)       |
| `endDate`   | string | Fecha fin (ISO)          |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "name": "string",
        "email": "string"
      },
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### Estadísticas de Asistencia

Obtiene estadísticas agregadas de asistencia.

```
GET /attendance/stats
```

**Roles:** `ADMIN`, `TRAINER`

**Query Parameters:**

| Parámetro   | Tipo   | Descripción        |
| ----------- | ------ | ------------------ |
| `startDate` | string | Fecha inicio (ISO) |
| `endDate`   | string | Fecha fin (ISO)    |

**Response 200:**

```json
{
  "totalVisits": 150,
  "uniqueUsers": 45,
  "averagePerDay": 5.0,
  "peakHour": 18,
  "peakDay": "Monday"
}
```

---

### Asistencia de Usuario

Obtiene el historial de asistencia de un usuario específico.

```
GET /attendance/user/:userId
```

**Roles:** Usuario propio o `ADMIN`/`TRAINER`

**Query Parameters:**

| Parámetro   | Tipo   | Descripción              |
| ----------- | ------ | ------------------------ |
| `page`      | number | Página (default: 1)      |
| `limit`     | number | Items por página (10-50) |
| `startDate` | string | Fecha inicio (ISO)       |
| `endDate`   | string | Fecha fin (ISO)          |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}
```

---

### Conteo Mensual de Usuario

Obtiene el conteo de asistencias de un usuario en un mes específico.

```
GET /attendance/user/:userId/count
```

**Roles:** Usuario propio o `ADMIN`/`TRAINER`

**Query Parameters:**

| Parámetro | Tipo   | Descripción                 |
| --------- | ------ | --------------------------- |
| `month`   | number | Mes (1-12, default: actual) |
| `year`    | number | Año (default: actual)       |

**Response 200:**

```json
{
  "count": 15,
  "month": 1,
  "year": 2024
}
```
