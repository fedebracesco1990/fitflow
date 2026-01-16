# WebSocket Server - Documentación Técnica

## Descripción

Sistema de comunicación en tiempo real basado en Socket.IO para FitFlow. Permite notificaciones instantáneas entre servidor y clientes Angular.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Angular Client │────▶│   EventsGateway     │────▶│  RealtimeService │
│  (socket.io)    │◀────│   /events namespace │◀────│  (métodos tipados)│
└─────────────────┘     └─────────────────────┘     └──────────────────┘
                                  │                          │
                                  ▼                          ▼
                        ┌─────────────────┐         ┌────────────────┐
                        │   WsJwtGuard    │         │  Servicios     │
                        │   (auth)        │         │  - Routines    │
                        └─────────────────┘         │  - Workouts    │
                                                    │  - Notifications│
                                                    └────────────────┘
```

## Componentes

### EventsGateway

Maneja conexiones WebSocket y sistema de rooms.

**Ubicación:** `src/modules/websocket/events.gateway.ts`

**Configuración:**

- **Namespace:** `/events`
- **CORS:** Configurado desde `ALLOWED_ORIGINS`
- **Autenticación:** JWT en handshake

**Rooms:**
| Room | Formato | Descripción |
|------|---------|-------------|
| User | `user:{userId}` | Todos los usuarios autenticados |
| Trainer | `trainer:{trainerId}` | Solo usuarios con rol TRAINER |
| Admin | `admin` | Solo usuarios con rol ADMIN |

### RealtimeService

Servicio centralizado para emisión de eventos.

**Ubicación:** `src/modules/websocket/realtime.service.ts`

**Métodos:**

```typescript
// Notificar actualización de rutina a usuario
notifyRoutineUpdate(userId: string, event: RoutineUpdatedEvent): void

// Notificar progreso registrado al trainer asignado
notifyProgressLogged(trainerId: string, event: ProgressLoggedEvent): void

// Notificar nueva notificación a usuario
notifyNewNotification(userId: string, event: NotificationEvent): void

// Utilidades
isUserOnline(userId: string): boolean
getConnectionsCount(): number
```

### WsJwtGuard

Guard para autenticación JWT en WebSocket.

**Ubicación:** `src/modules/websocket/guards/ws-jwt.guard.ts`

**Extracción de Token:**

1. Header `Authorization: Bearer <token>`
2. `handshake.auth.token`
3. Query param `?token=<token>`

## Eventos

### routine.updated

Emitido cuando un trainer actualiza una rutina.

```typescript
interface RoutineUpdatedEvent {
  routineId: string;
  routineName: string;
  updatedBy: string;
  updatedAt: Date;
  changes?: string[];
}
```

**Trigger:** `RoutinesService.update()`
**Target:** `user:{createdById}` (el trainer creador)

### progress.logged

Emitido cuando un usuario completa un workout.

```typescript
interface ProgressLoggedEvent {
  workoutLogId: string;
  userId: string;
  userName?: string;
  routineName: string;
  exerciseName?: string;
  timestamp: Date;
  details?: {
    sets?: number;
    reps?: number;
    weight?: number;
  };
}
```

**Trigger:** `WorkoutsService.completeWorkout()`
**Target:** `trainer:{trainerId}` (el trainer asignado)

### notification.new

Emitido cuando se envía una notificación push.

```typescript
interface NotificationEvent {
  notificationId?: string;
  title: string;
  body: string;
  type?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}
```

**Trigger:** `NotificationsService.sendToUser()`
**Target:** `user:{userId}`

## Conexión desde Cliente Angular

### Instalación

```bash
npm install socket.io-client
```

### Configuración

```typescript
import { io, Socket } from 'socket.io-client';

const socket = io('http://localhost:3000/events', {
  auth: {
    token: 'JWT_ACCESS_TOKEN',
  },
  // O en headers
  extraHeaders: {
    Authorization: 'Bearer JWT_ACCESS_TOKEN',
  },
});

// Escuchar eventos
socket.on('routine.updated', (data: RoutineUpdatedEvent) => {
  console.log('Rutina actualizada:', data);
});

socket.on('progress.logged', (data: ProgressLoggedEvent) => {
  console.log('Progreso registrado:', data);
});

socket.on('notification.new', (data: NotificationEvent) => {
  console.log('Nueva notificación:', data);
});

// Manejar conexión/desconexión
socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor WebSocket');
});
```

## Dependencias

```json
{
  "@nestjs/websockets": "^11.x",
  "@nestjs/platform-socket.io": "^11.x",
  "socket.io": "^4.x"
}
```

## Consideraciones de Seguridad

- JWT validado en cada conexión
- Tokens expirados rechazan la conexión
- Solo tokens de tipo `access` son aceptados
- Usuarios inactivos no pueden conectarse

## Escalabilidad

Para múltiples instancias del servidor, configurar Redis adapter:

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

// En main.ts
const redisAdapter = createAdapter(pubClient, subClient);
app.useWebSocketAdapter(
  new IoAdapter(app).createIOServer(port, {
    adapter: redisAdapter,
  })
);
```

## Desarrollo

### Testing Manual

```bash
# Conectar con wscat
npx wscat -c "ws://localhost:3000/events?token=JWT_TOKEN"
```

### Logs

El gateway y RealtimeService emiten logs de debug:

- Conexiones/desconexiones
- Eventos emitidos
- Errores de autenticación
