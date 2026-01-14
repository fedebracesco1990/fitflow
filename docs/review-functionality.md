# Validación del Sistema de Notificaciones Push - FitFlow

## Contexto

Se implementó un sistema de notificaciones push con Firebase Cloud Messaging (FCM) dividido en 3 tareas:

- **FITFLOW-36**: Backend - NotificationsModule con Firebase Admin SDK
- **FITFLOW-37**: Frontend - Integración FCM en Angular + PWA
- **FITFLOW-38**: Cron Jobs - Notificaciones automáticas programadas

Necesito que valides si la implementación está completa y funcional para cada tipo de usuario.

---

## Archivos a Revisar

### Backend (NestJS)

```
backend/src/modules/notifications/
├── notifications.module.ts
├── notifications.service.ts
├── notifications.controller.ts
├── dto/
│   ├── register-token.dto.ts
│   ├── send-notification.dto.ts
│   └── create-template.dto.ts
└── entities/
    ├── device-token.entity.ts
    └── notification-template.entity.ts

backend/src/modules/scheduler/
├── scheduler.module.ts
└── scheduler.service.ts

backend/src/modules/attendance/attendance.service.ts
backend/src/modules/memberships/memberships.service.ts
backend/src/config/firebase.config.ts
backend/src/database/seeders/seeder.service.ts
```

### Frontend (Angular)

```
frontend/src/app/core/services/push-notifications.service.ts
frontend/src/app/core/store/notifications/
├── notifications.state.ts
├── notifications.actions.ts
└── notifications.model.ts

frontend/src/app/shared/components/
├── notification-bell/
├── notification-center/
└── notification-prompt/

frontend/src/app/layouts/main-layout/
frontend/public/firebase-messaging-sw.js
frontend/public/manifest.webmanifest
frontend/src/environments/environment.ts
```

---

## Validaciones Requeridas

### 1. BACKEND - Endpoints API

Verifica que existan y funcionen estos endpoints:

| Endpoint                              | Método | Acceso      | Propósito                           |
| ------------------------------------- | ------ | ----------- | ----------------------------------- |
| `/api/notifications/register-token`   | POST   | Autenticado | Registrar token FCM del dispositivo |
| `/api/notifications/unregister-token` | DELETE | Autenticado | Eliminar token FCM                  |
| `/api/notifications/send`             | POST   | Solo Admin  | Enviar notificación manual          |
| `/api/notifications/templates`        | GET    | Solo Admin  | Listar templates                    |
| `/api/notifications/templates`        | POST   | Solo Admin  | Crear template                      |

**Validar:**

- [ ] ¿Los guards `@Roles('admin')` están aplicados correctamente?
- [ ] ¿El decorador `@CurrentUser()` o `@GetUser()` obtiene el usuario del JWT?
- [ ] ¿Los DTOs tienen validaciones con class-validator?

---

### 2. BACKEND - Entities y Base de Datos

**DeviceToken Entity debe tener:**

```typescript
{
  id: string (UUID)
  userId: string (FK a User)
  token: string (FCM token)
  platform: 'web' | 'android' | 'ios'
  createdAt: Date
  updatedAt: Date
}
```

**NotificationTemplate Entity debe tener:**

```typescript
{
  id: string(UUID);
  type: 'MEMBERSHIP_EXPIRING' | 'MEMBERSHIP_EXPIRED' | 'LOW_ATTENDANCE' | 'CUSTOM';
  title: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
}
```

**Validar:**

- [ ] ¿Existen las migraciones para estas tablas?
- [ ] ¿La relación User -> DeviceToken es OneToMany (un usuario puede tener varios dispositivos)?
- [ ] ¿El seeder crea los 4 templates predefinidos?

---

### 3. BACKEND - NotificationsService

Debe implementar estos métodos:

```typescript
// Enviar a un usuario específico usando template
sendByTemplate(userId: string, type: NotificationType): Promise<void>

// Enviar notificación custom a un usuario
sendToUser(userId: string, title: string, body: string): Promise<void>

// Enviar a todos los usuarios
sendToAll(title: string, body: string): Promise<void>

// Registrar token de dispositivo
registerToken(userId: string, token: string, platform: string): Promise<DeviceToken>

// Eliminar token
unregisterToken(userId: string, token: string): Promise<void>
```

**Validar:**

- [ ] ¿Firebase Admin SDK está inicializado correctamente con las credenciales?
- [ ] ¿Se manejan errores cuando Firebase falla (token inválido, etc.)?
- [ ] ¿Se buscan TODOS los tokens del usuario para enviar a múltiples dispositivos?

---

### 4. BACKEND - Cron Jobs (SchedulerService)

Debe tener 3 cron jobs:

```typescript
// Diario 8:00 AM - Membresías que vencen en 3 días
@Cron('0 8 * * *')
handleExpiringMemberships()

// Diario 8:00 AM - Membresías vencidas hoy
@Cron('0 8 * * *')
handleExpiredMemberships()

// Lunes 9:00 AM - Usuarios con < 8 visitas/mes
@Cron('0 9 * * 1')
handleLowAttendance()
```

**Validar:**

- [ ] ¿ScheduleModule.forRoot() está importado en AppModule?
- [ ] ¿MembershipsService tiene método `findExpiringMemberships(days: number)`?
- [ ] ¿AttendanceService tiene método `findUsersWithLowAttendance(minVisits: number)`?
- [ ] ¿Los cron jobs llaman a NotificationsService.sendByTemplate()?
- [ ] ¿Hay logging para monitorear ejecución de crons?

---

### 5. FRONTEND - PushNotificationsService

Debe implementar:

```typescript
// Inicializar Firebase Messaging
initializeFirebase(): void

// Solicitar permiso y obtener token
requestPermission(): Promise<string | null>

// Escuchar mensajes en foreground
onForegroundMessage(): Observable<any>

// Registrar token en backend
registerTokenInBackend(token: string): Promise<void>

// Desregistrar token
unregisterToken(): Promise<void>
```

**Validar:**

- [ ] ¿Se inicializa Firebase con la config de environment.ts?
- [ ] ¿Se maneja el caso cuando el usuario deniega permisos?
- [ ] ¿El token se envía al backend después de obtenerlo?

---

### 6. FRONTEND - Service Worker (firebase-messaging-sw.js)

El archivo `public/firebase-messaging-sw.js` debe:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '...',
  projectId: 'fitflow-84667',
  messagingSenderId: '...',
  appId: '...',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Mostrar notificación cuando la app está en background
});
```

**Validar:**

- [ ] ¿El archivo existe en `public/` o `src/`?
- [ ] ¿Está registrado en angular.json assets?
- [ ] ¿Las credenciales de Firebase coinciden con environment.ts?

---

### 7. FRONTEND - Manifest PWA

El archivo `manifest.webmanifest` debe incluir:

```json
{
  "gcm_sender_id": "103953800507"
}
```

**Validar:**

- [ ] ¿Existe el campo gcm_sender_id?
- [ ] ¿El valor es el correcto del proyecto Firebase?

---

### 8. FRONTEND - NotificationsState (NGXS)

El state debe manejar:

```typescript
interface NotificationsStateModel {
  notifications: Notification[];
  unreadCount: number;
  permissionStatus: 'default' | 'granted' | 'denied';
  fcmToken: string | null;
}

// Actions
AddNotification;
MarkAsRead;
MarkAllAsRead;
ClearAll;
SetPermissionStatus;
SetFcmToken;
```

**Validar:**

- [ ] ¿El state está registrado en app.config.ts?
- [ ] ¿Se persiste con @ngxs/storage-plugin (localStorage)?
- [ ] ¿Se actualiza unreadCount al agregar/leer notificaciones?

---

### 9. FRONTEND - Componentes UI

**NotificationBellComponent:**

- [ ] ¿Muestra badge con contador de no leídas?
- [ ] ¿Al hacer click abre el NotificationCenter?
- [ ] ¿Está en el header/layout principal?

**NotificationCenterComponent:**

- [ ] ¿Lista las notificaciones del state?
- [ ] ¿Permite marcar como leída?
- [ ] ¿Tiene botón "Limpiar todas"?
- [ ] ¿Muestra fecha/hora relativa?

**NotificationPromptComponent:**

- [ ] ¿Aparece después de login (con delay de ~3 segundos)?
- [ ] ¿Tiene botones "Activar" y "Ahora no"?
- [ ] ¿Solo aparece si permissionStatus es 'default'?
- [ ] ¿Se puede cerrar sin activar?

---

### 10. FLUJO COMPLETO POR ROL

#### Usuario/Socio:

- [ ] ¿Puede activar notificaciones después de login?
- [ ] ¿Su token FCM se registra en backend?
- [ ] ¿Recibe notificaciones en foreground (app abierta)?
- [ ] ¿Recibe notificaciones en background (app cerrada/minimizada)?
- [ ] ¿Ve el bell icon con contador en el header?
- [ ] ¿Puede ver historial en NotificationCenter?

#### Trainer:

- [ ] ¿Tiene el mismo flujo que usuario? (según docs, sí)
- [ ] ¿NO puede enviar notificaciones? (verificar que no tenga acceso a /send)

#### Admin:

- [ ] ¿Puede enviar notificaciones manuales vía API?
- [ ] ¿Puede enviar a un usuario específico?
- [ ] ¿Puede enviar a todos los usuarios?
- [ ] ¿Puede usar templates predefinidos?
- [ ] ¿Puede crear nuevos templates?
- [ ] ¿También recibe notificaciones como usuario?

---

## Output Esperado

Por favor genera un reporte con:

1. **Checklist de validación** - Marca cada item como ✅ implementado, ❌ faltante, o ⚠️ parcial

2. **Gaps encontrados** - Lista de funcionalidades faltantes o incompletas

3. **Errores de código** - Bugs, imports faltantes, tipos incorrectos

4. **Problemas de seguridad** - Guards faltantes, validaciones ausentes

5. **Recomendaciones** - Mejoras sugeridas para completar la implementación

6. **Código faltante** - Si hay algo que implementar, proporciona el código necesario

---

## Notas Adicionales

- El proyecto Firebase es `fitflow-84667`
- Backend usa NestJS 11.x con TypeORM + MySQL
- Frontend usa Angular 20.x con NGXS para state management
- La app es PWA con @angular/service-worker
- Las constantes configurables son:
  - `EXPIRATION_DAYS_AHEAD = 3` (días antes de vencimiento)
  - `MIN_MONTHLY_VISITS = 8` (mínimo visitas/mes)
