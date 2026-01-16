# WebSocket - Documentación Técnica

## Descripción

Sistema de comunicación en tiempo real basado en Socket.IO para FitFlow. Permite notificaciones instantáneas entre servidor y clientes Angular.

Este documento cubre:

- **Backend:** EventsGateway, RealtimeService, WsJwtGuard
- **Frontend:** WebSocketService (Angular)

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

## Cliente Angular (Frontend)

### WebSocketService

Servicio singleton que gestiona la conexión WebSocket desde Angular.

**Ubicación:** `frontend/src/app/core/services/websocket.service.ts`

**Arquitectura:**

```
┌──────────────────────────────────────────────────────────────────┐
│                      WebSocketService                            │
├──────────────────────────────────────────────────────────────────┤
│  Signals (Estado)           │  Subjects (Eventos)                │
│  ─────────────────          │  ──────────────────                │
│  connectionState()          │  routineUpdated$                   │
│  isConnected()              │  progressLogged$                   │
│                             │  notificationNew$                  │
├──────────────────────────────────────────────────────────────────┤
│  Métodos                                                         │
│  ────────                                                        │
│  connect()     - Conectar con JWT auth                           │
│  disconnect()  - Desconexión limpia                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   auth.state.ts (NGXS)        │
              │   ─────────────────           │
              │   CheckSessionSuccess → connect()  │
              │   LogoutSuccess → disconnect()     │
              └───────────────────────────────┘
```

### Tipos de Datos

**Ubicación:** `frontend/src/app/core/models/websocket.model.ts`

```typescript
// Estado de conexión
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Eventos tipados
interface RoutineUpdatedEvent {
  routineId;
  routineName;
  updatedBy;
  updatedAt;
  changes?;
  timestamp;
}
interface ProgressLoggedEvent {
  workoutLogId;
  userId;
  userName?;
  routineName;
  exerciseName?;
  timestamp;
  details?;
}
interface NotificationEvent {
  notificationId?;
  title;
  body;
  type?;
  timestamp;
  data?;
}
```

### Uso en Componentes

```typescript
import { WebSocketService } from '@core/services';

@Component({...})
export class MyComponent {
  private ws = inject(WebSocketService);

  // Estado de conexión (signal)
  isConnected = this.ws.isConnected;
  connectionState = this.ws.connectionState;

  // Suscribirse a eventos
  ngOnInit() {
    this.ws.routineUpdated$.subscribe(event => {
      console.log('Rutina actualizada:', event);
      // Refrescar datos de rutina
    });

    this.ws.progressLogged$.subscribe(event => {
      console.log('Progreso registrado:', event);
      // Actualizar dashboard de trainer
    });

    // notification.new ya se maneja automáticamente
    // via NGXS NotificationsState
  }
}
```

### Configuración

**Environment:** `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  wsUrl: 'http://localhost:3000', // URL base para WebSocket
  // ...
};
```

### Reconexión Automática

Socket.IO maneja la reconexión automáticamente:

| Parámetro              | Valor    | Descripción          |
| ---------------------- | -------- | -------------------- |
| `reconnection`         | `true`   | Habilitar reconexión |
| `reconnectionAttempts` | `5`      | Máximo de intentos   |
| `reconnectionDelay`    | `1000ms` | Delay inicial        |
| `reconnectionDelayMax` | `5000ms` | Delay máximo         |

### Integración con Notifications

El servicio automáticamente:

1. Escucha eventos `notification.new`
2. Crea objeto `PushNotification` tipado
3. Dispatch `AddNotification` a NGXS store

No se requiere código adicional en componentes para notificaciones.

## Desarrollo

### Testing Manual

```bash
# Conectar con wscat (Backend)
npx wscat -c "ws://localhost:3000/events?token=JWT_TOKEN"
```

### Testing Frontend

1. Iniciar sesión en la aplicación
2. Abrir DevTools → Console
3. Verificar log: `[WebSocket] Connected to server`
4. Al logout: `[WebSocket] Disconnected`

### Logs

**Backend:** El gateway y RealtimeService emiten logs de debug:

- Conexiones/desconexiones
- Eventos emitidos
- Errores de autenticación

**Frontend:** WebSocketService emite logs:

- `[WebSocket] Connected to server`
- `[WebSocket] Disconnected: [reason]`
- `[WebSocket] Connection error: [message]`
- `[WebSocket] Reconnection attempt: [n]`
- `[WebSocket] routine.updated: [data]`
- `[WebSocket] progress.logged: [data]`
- `[WebSocket] notification.new: [data]`
