# QR Controller

Endpoints para generación de códigos QR de acceso.

**Ruta base:** `/users`

---

## Endpoints

| Método | Ruta                   | Descripción              | Roles              |
| ------ | ---------------------- | ------------------------ | ------------------ |
| GET    | `/users/profile/me/qr` | Obtener mi código QR     | Todos autenticados |
| GET    | `/users/:id/qr`        | Obtener QR de un usuario | ADMIN, TRAINER     |

---

## GET /users/profile/me/qr

Obtiene el código QR del usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Response (200):** Imagen PNG

```
Content-Type: image/png
Content-Disposition: inline; filename="qr-code.png"
```

**Notas:**

- El QR contiene un JWT firmado con el userId y timestamp
- El JWT tiene una expiración de 365 días por defecto
- El QR puede ser escaneado para validar acceso al gimnasio

---

## GET /users/:id/qr

Obtiene el código QR de un usuario específico.

**Roles:** `ADMIN`, `TRAINER`

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| id        | UUID | ID del usuario |

**Response (200):** Imagen PNG

```
Content-Type: image/png
Content-Disposition: inline; filename="qr-code.png"
```

**Errores:**

| Código | Descripción           |
| ------ | --------------------- |
| 403    | Sin permisos          |
| 404    | Usuario no encontrado |

---

## Contenido del QR

El código QR contiene un JWT con la siguiente estructura:

```json
{
  "userId": "uuid-del-usuario",
  "timestamp": 1702839600000,
  "type": "access"
}
```

### Campos del payload

| Campo     | Tipo   | Descripción                      |
| --------- | ------ | -------------------------------- |
| userId    | string | UUID del usuario                 |
| timestamp | number | Timestamp de generación (ms)     |
| type      | string | Tipo de token (siempre "access") |

---

## Configuración

Variables de entorno relacionadas:

| Variable          | Descripción                   | Default    |
| ----------------- | ----------------------------- | ---------- |
| QR_JWT_SECRET     | Secret para firmar JWT del QR | JWT_SECRET |
| QR_JWT_EXPIRES_IN | Tiempo de expiración del JWT  | 365d       |

---

## Uso en Frontend

Para mostrar el QR en el frontend:

```typescript
// Obtener QR como imagen
const response = await fetch('/api/users/profile/me/qr', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

```html
<img [src]="qrImageUrl" alt="Mi código QR" />
```

---

## Validación del QR (FITFLOW-32)

Para validar un QR escaneado, se utilizará el endpoint `POST /api/access/validate-qr` (pendiente de implementación en FITFLOW-32).
