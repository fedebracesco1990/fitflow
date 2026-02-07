# Access API

Endpoints para control de acceso mediante códigos QR.

## Base URL

```
/api/access
```

## Autenticación

Todos los endpoints requieren JWT y rol `ADMIN` o `TRAINER`.

---

## Endpoints

### Validar QR

Valida un código QR de acceso y registra la entrada.

```
POST /access/validate-qr
```

**Roles:** `ADMIN`, `TRAINER`

**Body:**

```json
{
  "token": "string"
}
```

**Response 200:**

```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string"
  },
  "membership": {
    "id": "uuid",
    "status": "ACTIVE",
    "expiresAt": "2024-12-31"
  },
  "accessLog": {
    "id": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**WebSocket Event:** Cuando el acceso es exitoso (`granted: true`), se emite el evento `access.registered` al room `admin` vía WebSocket. Ver [WEBSOCKET.md](./WEBSOCKET.md#accessregistered) para detalles del payload.

**Response 400 (QR inválido o expirado):**

```json
{
  "valid": false,
  "error": "QR_EXPIRED",
  "message": "El código QR ha expirado"
}
```

---

### Obtener Logs de Acceso

Lista el historial de accesos con paginación.

```
GET /access/logs
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
      "timestamp": "2024-01-15T10:30:00Z",
      "validatedBy": "uuid"
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
