# FitFlow - Sistema de Notificaciones

Documento que describe el flujo completo de notificaciones implementado en la aplicación.

> **Para visualizar**: Instala el plugin "Markdown Preview Mermaid Support" en VS Code o usa https://mermaid.live
>
> **Última actualización**: Febrero 2026 (v2 — Backend-First Architecture)

---

## Arquitectura General

> **Principio clave**: El backend es la **fuente de verdad única** para todas las notificaciones. WebSocket es el canal primario de entrega in-app en tiempo real. FCM es opcional y solo se usa para notificaciones nativas del OS.

```mermaid
flowchart TB
    subgraph Backend["🖥️ Backend (NestJS)"]
        SCHED[Scheduler Service<br/>Cron Jobs]
        WORK[Workouts Service<br/>Personal Records]
        ADMIN_API[Notifications Controller]
        NS[Notifications Service]
        FCM_ADMIN[Firebase Admin SDK<br/>Opcional]
        WS[WebSocket Gateway<br/>Socket.io]
        RT[Realtime Service]
        DB_NOTIF[(AppNotification<br/>+ NotificationRead)]
        DB_TOKENS[(DeviceToken)]
        DB_TEMPLATES[(NotificationTemplate)]
    end

    subgraph Frontend["📱 Frontend (Angular PWA)"]
        SW[Service Worker<br/>firebase-messaging-sw.js]
        PUSH_SVC[PushNotifications Service<br/>FCM Token Registration]
        API_SVC[NotificationsApi Service<br/>HTTP Client]
        WS_SVC[WebSocket Service<br/>Real-time]
        NGXS[NGXS Notifications State]
        BELL[Notification Bell<br/>+ Badge]
        CENTER[Notification Center<br/>Panel]
        PROMPT[Notification Prompt<br/>Permission Dialog]
        ADMIN_UI[Admin: Send Notifications<br/>Page]
    end

    subgraph External["☁️ Externos"]
        FIREBASE[Firebase Cloud Messaging<br/>Google]
    end

    %% Backend triggers
    SCHED -->|sendByTemplate| NS
    WORK -->|sendToUser| NS
    ADMIN_API -->|sendNotification| NS

    %% Notification service flow - always persist
    NS -->|persist| DB_NOTIF
    NS -->|WebSocket emit| RT
    NS -->|optional FCM| FCM_ADMIN
    NS --> DB_TOKENS
    NS --> DB_TEMPLATES
    FCM_ADMIN -.->|HTTP| FIREBASE

    %% WebSocket primary delivery
    RT --> WS
    WS -->|notification.new| WS_SVC
    WS_SVC -->|AddNotification| NGXS

    %% Firebase optional OS notifications
    FIREBASE -.->|Push Background| SW
    SW -.->|showNotification| OS_NOTIF[Notificación Nativa OS]

    %% Frontend API loading
    API_SVC -->|GET /notifications/my| ADMIN_API
    API_SVC -->|PATCH /:id/read| ADMIN_API
    NGXS -->|LoadNotifications| API_SVC
    NGXS --> BELL
    NGXS --> CENTER

    %% Admin UI
    ADMIN_UI -->|POST /send| ADMIN_API

    %% FCM token registration (optional)
    PROMPT -->|requestPermission| PUSH_SVC
    PUSH_SVC -->|POST /register-token| ADMIN_API

    %% Styles
    style FIREBASE fill:#f59e0b,color:#000
    style FCM_ADMIN fill:#94a3b8,color:#fff
    style NS fill:#22c55e,color:#fff
    style SCHED fill:#3b82f6,color:#fff
    style SW fill:#94a3b8,color:#fff
    style NGXS fill:#8b5cf6,color:#fff
    style RT fill:#22c55e,color:#fff
    style DB_NOTIF fill:#f97316,color:#fff
    style WS_SVC fill:#22c55e,color:#fff
    style API_SVC fill:#3b82f6,color:#fff
```

---

## Canales de Notificación

La app tiene **2 canales** de entrega, con roles claramente separados:

### 1. WebSocket (Socket.io) — Canal Primario In-App

Canal principal para entrega de notificaciones in-app en tiempo real. **Funciona siempre**, independientemente de los permisos de push del usuario.

```mermaid
sequenceDiagram
    participant Backend as Backend (NestJS)
    participant DB as AppNotification DB
    participant RT as Realtime Service
    participant GW as WebSocket Gateway
    participant App as Angular App
    participant NGXS as NGXS State
    participant User as Usuario

    Note over Backend,User: � ENVÍO (usuario con app abierta)
    Backend->>DB: persistNotification(title, body, senderUserId)
    Backend->>RT: notifyNewNotification(userId, event)
    RT->>GW: emitToUser('notification.new', data)
    GW->>App: WebSocket event
    App->>NGXS: AddNotification
    NGXS->>User: 🔔 Badge en campana + panel

    Note over Backend,User: 📤 BROADCAST (excluye al sender)
    Backend->>DB: persistNotification(targetType=BROADCAST)
    Backend->>RT: broadcastExcept(senderUserId, event)
    RT->>GW: emitToAllExcept(senderUserId)
    GW->>App: WebSocket event (no llega al admin que envió)

    Note over Backend,User: � CARGA INICIAL (login o refresh)
    App->>Backend: GET /notifications/my
    Backend->>DB: query(targetUserId + broadcasts, exclude sender)
    DB-->>Backend: notifications[] con read status
    Backend-->>App: { notifications, total }
    App->>NGXS: patchState({ notifications })
    NGXS->>User: 🔔 Badge + lista actualizada
```

### 2. Firebase Cloud Messaging (FCM) — Opcional, Solo OS Nativo

Canal complementario para notificaciones nativas del sistema operativo. **Solo funciona si el usuario otorgó permisos de push.** No afecta las notificaciones in-app.

```mermaid
sequenceDiagram
    participant Backend as Backend (NestJS)
    participant FCM as Firebase Cloud<br/>Messaging
    participant SW as Service Worker
    participant User as Usuario

    Note over Backend,User: � REGISTRO (opcional, una vez)
    Note right of User: Solo si permiso = 'granted'<br/>y preferencia = 'enabled'

    Note over Backend,User: 📤 ENVÍO (background - app cerrada)
    Backend->>FCM: admin.messaging().send({token, notification, data})
    FCM->>SW: onBackgroundMessage(payload)
    SW->>User: self.registration.showNotification()<br/>🔔 Notificación nativa del OS
    Note right of SW: Sin IndexedDB.<br/>Solo muestra notificación nativa.
```

### 3. Otros Eventos WebSocket

```mermaid
sequenceDiagram
    participant Client as Angular App
    participant GW as WebSocket Gateway
    participant RT as Realtime Service

    RT->>GW: emitToUser('routine.updated', data)
    GW->>Client: evento routine.updated

    RT->>GW: emitToTrainer('progress.logged', data)
    GW->>Client: evento progress.logged
```

---

## Triggers (¿Qué dispara notificaciones?)

```mermaid
flowchart LR
    subgraph Automaticas["⏰ Automáticas (Cron Jobs)"]
        C1[Membresía por vencer<br/>Diario 8:00 AM<br/>3 días antes]
        C2[Membresía vencida<br/>Diario 8:00 AM<br/>día de vencimiento]
        C3[Baja asistencia semanal<br/>Lunes 9:00 AM<br/>menos de 8 visitas/mes]
        C4[Baja asistencia mensual<br/>1° del mes 9:00 AM<br/>reporte mes anterior]
    end

    subgraph Evento["⚡ Por Evento"]
        E1[Nuevo Récord Personal<br/>Al completar serie<br/>con PR]
    end

    subgraph Manual["👤 Manual (Admin)"]
        M1[Broadcast<br/>Enviar a todos]
        M2[Dirigida<br/>Enviar a usuario específico]
        M3[Por Template<br/>Usar plantilla predefinida]
    end

    C1 -->|MEMBERSHIP_EXPIRING| T[NotificationsService]
    C2 -->|MEMBERSHIP_EXPIRED| T
    C3 -->|LOW_ATTENDANCE| T
    C4 -->|LOW_ATTENDANCE| T
    E1 -->|sendToUser custom| T
    M1 -->|sendToAll| T
    M2 -->|sendToUser| T
    M3 -->|sendByTemplate| T

    T -->|1. Persist DB| U[(AppNotification)]
    T -->|2. WebSocket| V[In-App Bell]
    T -.->|3. FCM opcional| W[OS Nativo]

    style T fill:#22c55e,color:#fff
    style U fill:#f97316,color:#fff
    style V fill:#3b82f6,color:#fff
    style W fill:#94a3b8,color:#fff
```

---

## Notification Templates

Templates predefinidas almacenadas en la tabla `notification_templates`:

| Tipo                  | Trigger              | Descripción                                |
| --------------------- | -------------------- | ------------------------------------------ |
| `MEMBERSHIP_EXPIRING` | Cron diario 8AM      | Membresía vence en 3 días                  |
| `MEMBERSHIP_EXPIRED`  | Cron diario 8AM      | Membresía venció hoy                       |
| `LOW_ATTENDANCE`      | Cron semanal/mensual | Menos de 8 visitas al mes                  |
| `PERSONAL_RECORD`     | Evento en workout    | Nuevo PR (no usa template, mensaje custom) |
| `CUSTOM`              | Manual por admin     | Mensaje personalizado                      |

---

## Modelo de Datos

```mermaid
erDiagram
    User ||--o{ DeviceToken : "registra dispositivos"
    User ||--o{ AppNotification : "recibe (targetUserId)"
    User ||--o{ AppNotification : "envía (senderUserId)"
    User ||--o{ NotificationRead : "marca como leída"
    AppNotification ||--o{ NotificationRead : "tiene lecturas"

    AppNotification {
        uuid id PK
        varchar title
        varchar body
        varchar type "nullable"
        enum targetType "user | broadcast"
        uuid targetUserId FK "nullable para broadcast"
        uuid senderUserId FK "nullable para sistema"
        json data "nullable"
        datetime createdAt
    }

    NotificationRead {
        uuid id PK
        uuid notificationId FK
        uuid userId FK
        datetime readAt
    }

    NotificationTemplate {
        uuid id PK
        enum type UK
        string title
        string body
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    DeviceToken {
        uuid id PK
        uuid userId FK
        string token
        enum platform
        datetime createdAt
        datetime updatedAt
    }

    NotificationTemplate ||--o{ CRON_TRIGGER : "usado por"
```

### Lógica de Sender Exclusion

| Campo                       | Valor                              | Significado                            |
| --------------------------- | ---------------------------------- | -------------------------------------- |
| `senderUserId = NULL`       | Notificación de sistema (cron, PR) | Todos la ven                           |
| `senderUserId = admin-uuid` | Admin envió manualmente            | Admin **no** la ve en su campana       |
| `targetType = 'broadcast'`  | Para todos los usuarios            | 1 fila, lecturas en `NotificationRead` |
| `targetType = 'user'`       | Para usuario específico            | `targetUserId` indica el destinatario  |

---

## Frontend: Flujo de Inicialización

```mermaid
stateDiagram-v2
    [*] --> AppLoad: Usuario inicia sesión

    AppLoad --> CheckAuth: MainLayout.ngOnInit()
    CheckAuth --> NotAuthenticated: No autenticado
    CheckAuth --> InitNotifications: Autenticado

    NotAuthenticated --> [*]: Skip

    state InitNotifications {
        [*] --> LoadFromAPI: GET /notifications/my
        LoadFromAPI --> SubscribeWS: WebSocket subscription
        SubscribeWS --> SetupFCM: FCM setup (opcional)

        state SetupFCM {
            [*] --> CheckPermission
            CheckPermission --> PermGranted: granted + enabled
            CheckPermission --> Skip: default/denied/dismissed
            PermGranted --> RegisterToken: getAndRegisterToken()
            Skip --> [*]
            RegisterToken --> [*]
        }
    }

    InitNotifications --> Active: Notificaciones listas
    Active --> ReceiveWS: WebSocket notification.new
    ReceiveWS --> Active: AddNotification al NGXS state
```

> **Importante**: Las notificaciones in-app se cargan **siempre** desde el backend API, independientemente del estado de FCM. El usuario ve notificaciones en la campana aunque nunca haya aceptado permisos de push.

---

## Persistencia y Estado

```mermaid
flowchart TB
    subgraph Backend["�️ Fuente de Verdad (MySQL)"]
        DB_N[(AppNotification)]
        DB_R[(NotificationRead)]
    end

    subgraph Frontend["📱 Estado en Memoria"]
        NGXS_S[NGXS Notifications State<br/>notifications: AppNotificationDto[]]
        LS[(localStorage<br/>Preferencias FCM)]
    end

    subgraph Writes["Escrituras"]
        API_W[Backend persiste] -->|sendToUser / sendToAll| DB_N
        MARK_W[Mark as read] -->|PATCH /:id/read| DB_R
        MARK_ALL[Mark all read] -->|PATCH /read-all| DB_R
        WS_W[WebSocket event] -->|AddNotification| NGXS_S
        PREF[User Preference] -->|setItem| LS
    end

    subgraph Reads["Lecturas"]
        DB_N -->|GET /notifications/my<br/>con LEFT JOIN NotificationRead| NGXS_S
        LS -->|notification_preference_{userId}| INIT[FCM Init Check]
        NGXS_S -->|selectSignal| BELL_R[Bell Badge]
        NGXS_S -->|selectSignal| CENTER_R[Notification List]
    end
```

> **Nota**: IndexedDB fue eliminado. El backend es la única fuente de verdad. El NGXS state es un cache en memoria que se hidrata desde el API al login/refresh y se actualiza en real-time via WebSocket.

---

## Componentes UI

| Componente                     | Ubicación           | Función                                       |
| ------------------------------ | ------------------- | --------------------------------------------- |
| `NotificationBellComponent`    | Header (MainLayout) | Icono campana con badge de no leídas          |
| `NotificationCenterComponent`  | Header (MainLayout) | Panel desplegable con lista de notificaciones |
| `NotificationPromptComponent`  | MainLayout          | Dialog para pedir permiso de notificaciones   |
| `SendNotificationsComponent`   | Admin page          | Enviar broadcast o dirigidas desde UI admin   |
| `NotificationHistoryComponent` | Admin page          | Historial local de notificaciones enviadas    |

---

## API Endpoints

| Método   | Endpoint                          | Rol   | Descripción                         |
| -------- | --------------------------------- | ----- | ----------------------------------- |
| `POST`   | `/notifications/register-token`   | User  | Registrar FCM token del dispositivo |
| `DELETE` | `/notifications/unregister-token` | User  | Eliminar FCM token                  |
| `POST`   | `/notifications/send`             | Admin | Enviar notificación (3 modos)       |
| `GET`    | `/notifications/templates`        | Admin | Listar templates                    |
| `POST`   | `/notifications/templates`        | Admin | Crear template                      |
| `POST`   | `/notifications/templates/:id`    | Admin | Actualizar template                 |
| `GET`    | `/notifications/debug/tokens`     | Admin | Ver todos los tokens registrados    |
| `DELETE` | `/notifications/debug/cleanup`    | Admin | Limpiar tokens duplicados           |

### Modos de envío (`POST /notifications/send`):

```
1. Broadcast:  { broadcast: true, title, body }
2. Dirigida:   { userId, title, body }
3. Template:   { userId, templateType }
```

---

## Configuración Firebase

### Backend (`firebase-admin`)

- **Credenciales**: `projectId`, `clientEmail`, `privateKey` via ConfigService
- **Inicialización**: `OnModuleInit` → `initializeFirebase()`
- Si no hay credenciales, las notificaciones push se deshabilitan con warning

### Frontend (`firebase/messaging`)

- **Config**: `environment.firebase` (apiKey, authDomain, projectId, etc.)
- **VAPID Key**: `environment.firebase.vapidKey`
- **Service Worker**: `public/firebase-messaging-sw.js` (registrado manualmente)

---

## WebSocket Events

| Evento             | Room Target           | Disparado por   | Descripción                                 |
| ------------------ | --------------------- | --------------- | ------------------------------------------- |
| `routine.updated`  | `user:{userId}`       | RealtimeService | Rutina fue actualizada                      |
| `progress.logged`  | `trainer:{trainerId}` | RealtimeService | Usuario registró progreso                   |
| `notification.new` | `user:{userId}`       | RealtimeService | Nueva notificación (deshabilitado para FCM) |

---

## Resumen de Flujo Completo

```mermaid
flowchart TB
    A[Trigger] -->|Cron / Evento / Admin| B[NotificationsService]
    B --> C{¿Tiene template?}
    C -->|Sí| D[Buscar NotificationTemplate]
    C -->|No| E[Usar título/body custom]
    D --> F[Obtener DeviceTokens del usuario]
    E --> F
    F --> G{¿Firebase inicializado?}
    G -->|No| H[❌ Log warning, no envía]
    G -->|Sí| I[firebase-admin.messaging.send]
    I --> J{¿Token válido?}
    J -->|Sí| K[✅ Notificación enviada a FCM]
    J -->|No| L[🗑️ Eliminar token inválido]
    K --> M{¿App en foreground?}
    M -->|Sí| N[onMessage → NGXS → Badge + Panel]
    M -->|No| O[Service Worker → IndexedDB + Notif. nativa OS]

    style B fill:#22c55e,color:#fff
    style K fill:#3b82f6,color:#fff
    style H fill:#ef4444,color:#fff
```
