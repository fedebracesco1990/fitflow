# Notifications Controller

Endpoints para gestión de notificaciones in-app y push (FCM opcional).

**Ruta base:** `/notifications`

---

## Endpoints

### In-App Notifications

| Método | Ruta                      | Descripción                      | Roles              |
| ------ | ------------------------- | -------------------------------- | ------------------ |
| GET    | `/notifications/my`       | Obtener notificaciones no leídas | Todos autenticados |
| PATCH  | `/notifications/:id/read` | Marcar como leída                | Todos autenticados |
| PATCH  | `/notifications/read-all` | Marcar todas como leídas         | Todos autenticados |

### FCM Token Management

| Método | Ruta                              | Descripción         | Roles              |
| ------ | --------------------------------- | ------------------- | ------------------ |
| POST   | `/notifications/register-token`   | Registrar token FCM | Todos autenticados |
| DELETE | `/notifications/unregister-token` | Eliminar token FCM  | Todos autenticados |

### Admin

| Método | Ruta                           | Descripción         | Roles |
| ------ | ------------------------------ | ------------------- | ----- |
| POST   | `/notifications/send`          | Enviar notificación | ADMIN |
| GET    | `/notifications/templates`     | Listar templates    | ADMIN |
| POST   | `/notifications/templates`     | Crear template      | ADMIN |
| POST   | `/notifications/templates/:id` | Actualizar template | ADMIN |

---

## GET /notifications/my

Obtiene las notificaciones **no leídas** del usuario autenticado, incluyendo notificaciones dirigidas y broadcasts. Excluye notificaciones enviadas por el propio usuario (`senderUserId`) y notificaciones ya marcadas como leídas (via `notification_reads`).

**Roles:** Todos los usuarios autenticados

**Query Parameters:**

| Parámetro | Tipo   | Default | Descripción              |
| --------- | ------ | ------- | ------------------------ |
| limit     | number | 50      | Máximo de notificaciones |
| offset    | number | 0       | Offset para paginación   |

**Response (200):**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Nuevo Récord Personal",
      "body": "Nuevo PR en Press de Banca: 100kg x 5 reps",
      "type": "personal_record",
      "targetType": "user",
      "targetUserId": "user-uuid",
      "senderUserId": null,
      "data": null,
      "createdAt": "2026-02-06T12:00:00.000Z",
      "read": false
    }
  ],
  "total": 1
}
```

| Campo         | Tipo    | Descripción                                                                                                         |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| notifications | array   | Lista de notificaciones no leídas (filtradas por `NOT EXISTS` en `notification_reads`)                              |
| total         | number  | Total de notificaciones no leídas (para paginación)                                                                 |
| read          | boolean | `true` si el usuario ya leyó esta notificación (siempre `false` cuando `NOT EXISTS` filtra, incluido como fallback) |

---

## PATCH /notifications/:id/read

Marca una notificación como leída para el usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción           |
| --------- | ---- | --------------------- |
| id        | UUID | ID de la notificación |

**Response (200):**

```json
{
  "message": "Notification marked as read"
}
```

**Errores:**

| Código | Descripción                |
| ------ | -------------------------- |
| 404    | Notificación no encontrada |

---

## PATCH /notifications/read-all

Marca todas las notificaciones no leídas como leídas para el usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Response (200):**

```json
{
  "marked": 5
}
```

| Campo  | Tipo   | Descripción                                     |
| ------ | ------ | ----------------------------------------------- |
| marked | number | Cantidad de notificaciones marcadas como leídas |

---

## POST /notifications/register-token

Registra un token FCM para el usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Request Body:**

```json
{
  "token": "fcm-token-string",
  "platform": "web"
}
```

| Campo    | Tipo   | Requerido | Descripción                         |
| -------- | ------ | --------- | ----------------------------------- |
| token    | string | Sí        | Token FCM del dispositivo           |
| platform | enum   | No        | Plataforma: `web`, `android`, `ios` |

**Response (201):**

```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "token": "fcm-token-string",
  "platform": "web",
  "createdAt": "2026-01-07T12:00:00.000Z"
}
```

---

## DELETE /notifications/unregister-token

Elimina un token FCM del usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Query Parameters:**

| Parámetro | Tipo   | Descripción          |
| --------- | ------ | -------------------- |
| token     | string | Token FCM a eliminar |

**Response (200):**

```json
{
  "message": "Token unregistered successfully"
}
```

---

## POST /notifications/send

Envía una notificación. Persiste en DB, emite via WebSocket, y opcionalmente envía FCM push. El `senderUserId` del admin se registra automáticamente para excluirlo de recibir su propia notificación.

**Roles:** `ADMIN`

**Request Body (con template):**

```json
{
  "userId": "user-uuid",
  "templateType": "MEMBERSHIP_EXPIRING"
}
```

**Request Body (personalizada):**

```json
{
  "userId": "user-uuid",
  "title": "Título de la notificación",
  "body": "Cuerpo del mensaje"
}
```

| Campo        | Tipo   | Requerido   | Descripción                  |
| ------------ | ------ | ----------- | ---------------------------- |
| userId       | UUID   | Sí          | ID del usuario destinatario  |
| templateType | enum   | Condicional | Tipo de template predefinido |
| title        | string | Condicional | Título personalizado         |
| body         | string | Condicional | Mensaje personalizado        |

**Tipos de template disponibles:**

| Tipo                | Descripción                 |
| ------------------- | --------------------------- |
| MEMBERSHIP_EXPIRING | Membresía próxima a vencer  |
| MEMBERSHIP_EXPIRED  | Membresía vencida           |
| LOW_ATTENDANCE      | Baja asistencia al gimnasio |
| CUSTOM              | Notificación personalizada  |

**Response (200):**

```json
{
  "success": true,
  "sent": 2
}
```

| Campo   | Tipo    | Descripción                          |
| ------- | ------- | ------------------------------------ |
| success | boolean | Si la operación fue exitosa          |
| sent    | number  | Cantidad de dispositivos notificados |

**Errores:**

| Código | Descripción                                 |
| ------ | ------------------------------------------- |
| 400    | Parámetros inválidos                        |
| 404    | Template no encontrado o usuario sin tokens |

---

## GET /notifications/templates

Lista todos los templates de notificación.

**Roles:** `ADMIN`

**Response (200):**

```json
[
  {
    "id": "uuid",
    "type": "MEMBERSHIP_EXPIRING",
    "title": "⏰ Tu membresía está por vencer",
    "body": "Tu membresía vence en los próximos días...",
    "isActive": true,
    "createdAt": "2026-01-07T12:00:00.000Z",
    "updatedAt": "2026-01-07T12:00:00.000Z"
  }
]
```

---

## POST /notifications/templates

Crea un nuevo template de notificación.

**Roles:** `ADMIN`

**Request Body:**

```json
{
  "type": "CUSTOM",
  "title": "Nuevo template",
  "body": "Contenido del mensaje",
  "isActive": true
}
```

| Campo    | Tipo    | Requerido | Descripción                    |
| -------- | ------- | --------- | ------------------------------ |
| type     | enum    | Sí        | Tipo de notificación           |
| title    | string  | Sí        | Título (max 100 chars)         |
| body     | string  | Sí        | Mensaje (max 500 chars)        |
| isActive | boolean | No        | Si está activo (default: true) |

**Response (201):** Template creado

**Errores:**

| Código | Descripción        |
| ------ | ------------------ |
| 400    | Template ya existe |

---

## POST /notifications/templates/:id

Actualiza un template existente.

**Roles:** `ADMIN`

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción     |
| --------- | ---- | --------------- |
| id        | UUID | ID del template |

**Request Body:**

```json
{
  "title": "Título actualizado",
  "body": "Mensaje actualizado",
  "isActive": false
}
```

**Response (200):** Template actualizado

**Errores:**

| Código | Descripción            |
| ------ | ---------------------- |
| 404    | Template no encontrado |

---

## Configuración

Variables de entorno requeridas:

| Variable              | Descripción                | Requerido |
| --------------------- | -------------------------- | --------- |
| FIREBASE_PROJECT_ID   | ID del proyecto Firebase   | Sí        |
| FIREBASE_CLIENT_EMAIL | Email del service account  | Sí        |
| FIREBASE_PRIVATE_KEY  | Private key (con comillas) | Sí        |

**Ejemplo .env:**

```env
FIREBASE_PROJECT_ID=fitflow-84667
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@fitflow-84667.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Uso en Frontend

### Registrar token FCM

```typescript
// Obtener token de Firebase Messaging
const token = await getToken(messaging, { vapidKey: 'your-vapid-key' });

// Registrar en backend
await fetch('/api/notifications/register-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ token, platform: 'web' }),
});
```

### Enviar notificación (Admin)

```typescript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    userId: 'target-user-id',
    templateType: 'MEMBERSHIP_EXPIRING',
  }),
});
```

---

## Entidades

### AppNotification

| Campo        | Tipo          | Nullable | Descripción                                     |
| ------------ | ------------- | -------- | ----------------------------------------------- |
| id           | UUID          | No       | ID único (PK)                                   |
| title        | varchar(200)  | No       | Título de la notificación                       |
| body         | varchar(1000) | No       | Cuerpo del mensaje                              |
| type         | varchar(50)   | Sí       | Tipo libre (ej: `personal_record`, `broadcast`) |
| targetType   | enum          | No       | `user` o `broadcast`                            |
| targetUserId | UUID          | Sí       | Destinatario (NULL para broadcast)              |
| senderUserId | UUID          | Sí       | Quien envió (NULL para sistema/cron)            |
| data         | JSON          | Sí       | Datos adicionales                               |
| createdAt    | Date          | No       | Fecha de creación                               |

**Índices:** `[targetUserId, createdAt]`, `[targetType, createdAt]`

### NotificationRead

| Campo          | Tipo | Nullable | Descripción          |
| -------------- | ---- | -------- | -------------------- |
| id             | UUID | No       | ID único (PK)        |
| notificationId | UUID | No       | FK a AppNotification |
| userId         | UUID | No       | FK a User            |
| readAt         | Date | No       | Fecha en que se leyó |

**Índice único:** `[notificationId, userId]`

### DeviceToken

| Campo     | Tipo   | Descripción               |
| --------- | ------ | ------------------------- |
| id        | UUID   | ID único                  |
| userId    | UUID   | Usuario propietario       |
| token     | string | Token FCM del dispositivo |
| platform  | enum   | web, android, ios         |
| createdAt | Date   | Fecha de registro         |

### NotificationTemplate

| Campo     | Tipo    | Descripción          |
| --------- | ------- | -------------------- |
| id        | UUID    | ID único             |
| type      | enum    | Tipo de notificación |
| title     | string  | Título del mensaje   |
| body      | string  | Cuerpo del mensaje   |
| isActive  | boolean | Si está habilitado   |
| createdAt | Date    | Fecha de creación    |
| updatedAt | Date    | Última actualización |

---

## Estructura del Mensaje FCM

Cada notificación enviada incluye tanto `notification` como `data` payload:

```typescript
{
  token: "device-fcm-token",
  notification: { title, body },  // Para notificación del sistema
  data: {
    title,                        // Para uso en frontend
    body,
    type: "direct" | "broadcast", // Tipo de notificación
    timestamp: "1705363200000"    // Unix timestamp
  }
}
```

**Importante:** El `data` payload es necesario para que el frontend pueda capturar las notificaciones en foreground vía `onMessage()` de Firebase.

---

## Notas

- **Backend es fuente de verdad**: Todas las notificaciones se persisten en `AppNotification`. IndexedDB fue eliminado
- **Read filtering**: `GET /notifications/my` usa `NOT EXISTS` subquery para excluir notificaciones con registro en `notification_reads`. El frontend además filtra `read === false` como red de seguridad
- **Mark as read = ocultar**: Marcar como leída (`PATCH /:id/read` o `PATCH /read-all`) crea un registro en `notification_reads`, lo que hace que la notificación deje de aparecer en `GET /my`
- **WebSocket primario**: Las notificaciones in-app se entregan via WebSocket (`notification.new`) en tiempo real
- **FCM opcional**: Si Firebase no está configurado, las notificaciones in-app siguen funcionando (solo se omite el push nativo del OS)
- **Sender exclusion**: El admin no recibe sus propias notificaciones (filtrado por `senderUserId` en query y WebSocket)
- **No localStorage**: Las notificaciones NO se persisten en localStorage del frontend. Siempre se cargan frescas del backend al iniciar sesión o refrescar
- Los tokens inválidos o expirados se eliminan automáticamente al fallar el envío
- Un usuario puede tener múltiples tokens (multi-dispositivo)
