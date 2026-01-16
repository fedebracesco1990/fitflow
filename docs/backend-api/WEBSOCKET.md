# WebSocket API

## Descripción

API de WebSocket para comunicación en tiempo real usando Socket.IO.

## Conexión

**Endpoint:** `ws://[HOST]/events`

### Autenticación

El token JWT debe enviarse de una de estas formas:

```javascript
// Opción 1: En auth object
const socket = io('/events', {
  auth: { token: 'JWT_ACCESS_TOKEN' },
});

// Opción 2: En headers
const socket = io('/events', {
  extraHeaders: { Authorization: 'Bearer JWT_ACCESS_TOKEN' },
});

// Opción 3: En query params
const socket = io('/events?token=JWT_ACCESS_TOKEN');
```

### Respuesta de Conexión

**Exitosa:** El cliente se une automáticamente a los rooms según su rol.

**Fallida:** Desconexión inmediata con error `Unauthorized`.

## Eventos del Servidor → Cliente

### routine.updated

Emitido cuando una rutina es actualizada.

**Payload:**

```typescript
{
  routineId: string;
  routineName: string;
  updatedBy: string;
  updatedAt: Date;
  changes?: string[];
  timestamp: Date;
}
```

**Ejemplo:**

```json
{
  "routineId": "uuid-123",
  "routineName": "Rutina Fuerza",
  "updatedBy": "trainer-uuid",
  "updatedAt": "2026-01-15T20:00:00.000Z",
  "timestamp": "2026-01-15T20:00:00.000Z"
}
```

### progress.logged

Emitido cuando un usuario completa un workout (solo a trainers).

**Payload:**

```typescript
{
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

**Ejemplo:**

```json
{
  "workoutLogId": "uuid-456",
  "userId": "user-uuid",
  "userName": "Juan Pérez",
  "routineName": "Rutina Fuerza",
  "timestamp": "2026-01-15T20:00:00.000Z"
}
```

### notification.new

Emitido cuando se envía una nueva notificación.

**Payload:**

```typescript
{
  notificationId?: string;
  title: string;
  body: string;
  type?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}
```

**Ejemplo:**

```json
{
  "title": "Nuevo Récord Personal",
  "body": "Nuevo PR en Press de Banca: 100kg x 5 reps",
  "timestamp": "2026-01-15T20:00:00.000Z"
}
```

## Sistema de Rooms

| Room    | Formato               | Usuarios               |
| ------- | --------------------- | ---------------------- |
| User    | `user:{userId}`       | Todos los autenticados |
| Trainer | `trainer:{trainerId}` | Solo TRAINER           |
| Admin   | `admin`               | Solo ADMIN             |

## Códigos de Error

| Código               | Descripción                  |
| -------------------- | ---------------------------- |
| `Unauthorized`       | Token inválido o expirado    |
| `Token not provided` | No se envió token            |
| `Invalid token type` | Token no es de tipo `access` |

## Ejemplo Completo (Angular)

```typescript
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {}

  connect(): void {
    const token = this.authService.getAccessToken();

    this.socket = io('http://localhost:3000/events', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected$.next(false);
    });
  }

  on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket?.on(event, (data: T) => observer.next(data));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
```
