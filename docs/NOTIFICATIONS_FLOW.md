# FitFlow - Sistema de Notificaciones

Documento que describe el flujo completo de notificaciones implementado en la aplicación.

> **Para visualizar**: Instala el plugin "Markdown Preview Mermaid Support" en VS Code o usa https://mermaid.live
>
> **Última actualización**: Febrero 2026

---

## Arquitectura General

```mermaid
flowchart TB
    subgraph Backend["🖥️ Backend (NestJS)"]
        SCHED[Scheduler Service<br/>Cron Jobs]
        WORK[Workouts Service<br/>Personal Records]
        ADMIN_API[Notifications Controller<br/>POST /notifications/send]
        NS[Notifications Service]
        FCM_ADMIN[Firebase Admin SDK]
        WS[WebSocket Gateway<br/>Socket.io]
        RT[Realtime Service]
        DB_TOKENS[(DeviceToken)]
        DB_TEMPLATES[(NotificationTemplate)]
    end

    subgraph Frontend["📱 Frontend (Angular PWA)"]
        SW[Service Worker<br/>firebase-messaging-sw.js]
        PUSH_SVC[PushNotifications Service<br/>Firebase Messaging SDK]
        STORAGE[NotificationStorage Service<br/>IndexedDB]
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

    %% Notification service flow
    NS --> DB_TOKENS
    NS --> DB_TEMPLATES
    NS --> FCM_ADMIN
    FCM_ADMIN -->|HTTP| FIREBASE

    %% Firebase to frontend
    FIREBASE -->|Push Background| SW
    FIREBASE -->|Push Foreground| PUSH_SVC

    %% Frontend processing
    SW -->|Guarda en| STORAGE
    SW -->|showNotification| OS_NOTIF[Notificación Nativa OS]
    PUSH_SVC -->|onMessage| NGXS
    NGXS -->|Guarda en| STORAGE
    NGXS --> BELL
    NGXS --> CENTER

    %% WebSocket (realtime events, no push)
    RT --> WS
    WS -.->|Socket.io| PUSH_SVC

    %% Admin UI
    ADMIN_UI -->|POST /send| ADMIN_API

    %% Prompt flow
    PROMPT -->|requestPermission| PUSH_SVC
    PUSH_SVC -->|POST /register-token| ADMIN_API

    %% Styles
    style FIREBASE fill:#f59e0b,color:#000
    style FCM_ADMIN fill:#6366f1,color:#fff
    style NS fill:#22c55e,color:#fff
    style SCHED fill:#3b82f6,color:#fff
    style SW fill:#ec4899,color:#fff
    style NGXS fill:#8b5cf6,color:#fff
```

---

## Canales de Notificación

La app tiene **2 canales** de comunicación en tiempo real:

### 1. Firebase Cloud Messaging (FCM) — Push Notifications

Canal principal para notificaciones al usuario. Funciona en background y foreground.

```mermaid
sequenceDiagram
    participant Backend as Backend (NestJS)
    participant FCM as Firebase Cloud<br/>Messaging
    participant SW as Service Worker
    participant App as Angular App
    participant IDB as IndexedDB
    participant User as Usuario

    Note over Backend,User: 📲 REGISTRO DE TOKEN (una vez)
    App->>App: checkSupport() + requestPermission()
    App->>SW: navigator.serviceWorker.register()
    App->>FCM: getToken(vapidKey)
    FCM-->>App: fcm-token-abc123
    App->>Backend: POST /notifications/register-token<br/>{token, platform: 'web'}
    Backend->>Backend: Guarda DeviceToken en DB

    Note over Backend,User: 📤 ENVÍO (background - app cerrada/minimizada)
    Backend->>FCM: admin.messaging().send({token, notification, data})
    FCM->>SW: onBackgroundMessage(payload)
    SW->>IDB: saveNotificationToIndexedDB()
    SW->>User: self.registration.showNotification()<br/>🔔 Notificación nativa del OS

    Note over Backend,User: 📤 ENVÍO (foreground - app abierta)
    Backend->>FCM: admin.messaging().send({token, notification, data})
    FCM->>App: onMessage(payload)
    App->>IDB: saveNotification()
    App->>App: NGXS AddNotification
    App->>User: 🔔 Badge en campana + panel
```

### 2. WebSocket (Socket.io) — Eventos en Tiempo Real

Canal secundario para eventos de la app (NO push notifications).

```mermaid
sequenceDiagram
    participant Client as Angular App
    participant GW as WebSocket Gateway<br/>/events
    participant RT as Realtime Service
    participant Module as Otros Módulos

    Note over Client,Module: 🔌 CONEXIÓN
    Client->>GW: connect (Bearer token)
    GW->>GW: validateToken(JWT)
    GW->>GW: join room user:{userId}
    GW->>GW: join room admin (si admin)
    GW->>GW: join room trainer:{id} (si trainer)

    Note over Client,Module: 📡 EVENTOS DISPONIBLES
    Module->>RT: notifyRoutineUpdate(userId, event)
    RT->>GW: emitToUser('routine.updated', data)
    GW->>Client: evento routine.updated

    Module->>RT: notifyProgressLogged(trainerId, event)
    RT->>GW: emitToTrainer('progress.logged', data)
    GW->>Client: evento progress.logged

    Module->>RT: notifyNewNotification(userId, event)
    RT->>GW: emitToUser('notification.new', data)
    GW->>Client: evento notification.new
```

> **Nota**: El evento `notification.new` por WebSocket fue **deshabilitado** en `sendToUser()` para evitar duplicados con FCM. El comentario en el código dice: _"Don't send WebSocket notification - FCM handles it. WebSocket was causing duplicate notifications."_

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

    T -->|FCM Push| U[Usuario]

    style T fill:#22c55e,color:#fff
    style U fill:#3b82f6,color:#fff
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
    User ||--o{ Membership : "tiene"
    Membership ||--o{ Payment : "genera"

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

---

## Frontend: Flujo de Permisos y Preferencias

```mermaid
stateDiagram-v2
    [*] --> AppLoad: Usuario inicia sesión

    AppLoad --> CheckAuth: MainLayout.ngOnInit()
    CheckAuth --> NotAuthenticated: No autenticado
    CheckAuth --> CheckSupport: Autenticado

    NotAuthenticated --> [*]: Skip

    CheckSupport --> iOSNoPWA: iOS sin PWA instalada
    CheckSupport --> NotSupported: Navegador no soporta
    CheckSupport --> Supported: Navegador soporta

    iOSNoPWA --> ShowPWAPrompt: Mostrar "Instala la app"
    NotSupported --> [*]: Skip silencioso

    Supported --> CheckPermission

    CheckPermission --> PermDefault: permission = 'default'
    CheckPermission --> PermGranted: permission = 'granted'
    CheckPermission --> PermDenied: permission = 'denied'

    PermDefault --> ShowPrompt: Mostrar prompt "Activar notificaciones"
    PermDenied --> [*]: No se puede hacer nada

    PermGranted --> CheckUserPref
    CheckUserPref --> Enabled: localStorage = 'enabled'
    CheckUserPref --> NoPref: Sin preferencia
    CheckUserPref --> Dismissed: localStorage = 'dismissed'

    NoPref --> ShowPrompt: Mostrar prompt
    Dismissed --> [*]: No mostrar

    ShowPrompt --> UserAccepts: Click "Activar"
    ShowPrompt --> UserDismisses: Click "Ahora no"

    UserAccepts --> RequestPermission: Notification.requestPermission()
    RequestPermission --> GetToken: permission granted
    GetToken --> RegisterToken: getToken(vapidKey)
    RegisterToken --> SavePref: POST /register-token
    SavePref --> Active: localStorage = 'enabled'

    UserDismisses --> SaveDismissed: localStorage = 'dismissed'
    SaveDismissed --> [*]

    Enabled --> RegisterFCM: getAndRegisterToken()
    RegisterFCM --> SyncIDB: Cargar de IndexedDB
    SyncIDB --> ListenForeground: onMessage listener
    ListenForeground --> Active

    Active --> ReceiveNotification: FCM push llega
    ReceiveNotification --> Active
```

---

## Frontend: Almacenamiento Local

```mermaid
flowchart TB
    subgraph Storage["💾 Persistencia de Notificaciones"]
        IDB[(IndexedDB<br/>fitflow-notifications)]
        LS[(localStorage<br/>Preferencias)]
        NGXS_S[NGXS State<br/>En memoria]
    end

    subgraph Writes["Escrituras"]
        SW_W[Service Worker<br/>Background msg] -->|put| IDB
        FG_W[Foreground msg] -->|saveNotification| IDB
        FG_W -->|AddNotification| NGXS_S
        PREF[User Preference] -->|setItem| LS
    end

    subgraph Reads["Lecturas"]
        IDB -->|getAllNotifications<br/>on visibility change| NGXS_S
        LS -->|getItem<br/>notification_preference_{userId}| INIT[Initialization Check]
        NGXS_S -->|selectSignal| BELL_R[Bell Badge]
        NGXS_S -->|selectSignal| CENTER_R[Notification List]
    end

    subgraph Keys["Claves localStorage"]
        K1["notification_preference_{userId}<br/>= 'enabled' | 'dismissed' | null"]
    end
```

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
