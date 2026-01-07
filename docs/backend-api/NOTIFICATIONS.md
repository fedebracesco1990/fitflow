# Notifications Controller

Endpoints para gestión de notificaciones push con Firebase Cloud Messaging.

**Ruta base:** `/notifications`

---

## Endpoints

| Método | Ruta                              | Descripción         | Roles              |
| ------ | --------------------------------- | ------------------- | ------------------ |
| POST   | `/notifications/register-token`   | Registrar token FCM | Todos autenticados |
| DELETE | `/notifications/unregister-token` | Eliminar token FCM  | Todos autenticados |
| POST   | `/notifications/send`             | Enviar notificación | ADMIN              |
| GET    | `/notifications/templates`        | Listar templates    | ADMIN              |
| POST   | `/notifications/templates`        | Crear template      | ADMIN              |
| POST   | `/notifications/templates/:id`    | Actualizar template | ADMIN              |

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

Envía una notificación push a un usuario.

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

## Notas

- Los tokens inválidos o expirados se eliminan automáticamente al fallar el envío
- Un usuario puede tener múltiples tokens (multi-dispositivo)
- Firebase debe estar configurado para que las notificaciones funcionen
- Si Firebase no está configurado, los endpoints funcionan pero no envían notificaciones reales
