# FitFlow - Flujos de Usuario

Este documento describe los flujos de navegación y casos de uso principales por rol en la aplicación FitFlow.

> **Última actualización**: Febrero 2026

---

## Roles del Sistema

| Rol         | Descripción                | Acceso Principal                                                                                                  |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **ADMIN**   | Administrador del gimnasio | Gestión completa: usuarios, membresías, pagos, reportes, notificaciones, auditoría (además de todo lo de TRAINER) |
| **TRAINER** | Entrenador                 | Ejercicios, rutinas, programas, asignación a usuarios, control de acceso                                          |
| **USER**    | Socio/Cliente              | Mi rutina, entrenamientos, progreso, perfil, QR de acceso                                                         |

---

## Mapa de Navegación General

```mermaid
graph TB
    subgraph Auth["🔐 Autenticación"]
        Login[Login]
        ForgotPwd[Forgot Password]
        ResetPwd[Reset Password]
    end

    subgraph Admin["👔 ADMIN"]
        Dashboard[Dashboard]
        Users[Usuarios]
        MembershipTypes[Tipos Membresía]
        Memberships[Membresías]
        Payments[Pagos]
        Reports[Reportes]
        NotifAdmin[Notificaciones]
        AuditLogs[Auditoría]
    end

    subgraph Trainer["🏋️ TRAINER"]
        Exercises[Ejercicios]
        Routines[Rutinas]
        Training[Entrenamiento]
        Access[Control Acceso]
    end

    subgraph User["👤 USER"]
        MyRoutines[Mis Rutinas]
        MyProgress[Mi Progreso]
        Profile[Perfil]
    end

    Login --> Dashboard
    Dashboard --> Admin
    Dashboard --> Trainer
    Dashboard --> User
```

---

## Flujo por Rol

### 🔐 Flujo de Autenticación (Todos los roles)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant L as Login
    participant B as Backend
    participant D as Dashboard

    U->>L: Ingresa email y password
    L->>B: POST /auth/login
    B-->>L: JWT tokens + user data
    L->>L: Guarda en localStorage
    L->>D: Redirect a /dashboard

    Note over D: Dashboard muestra<br/>contenido según rol
```

**Rutas:**

- `/login` - Inicio de sesión
- `/forgot-password` - Recuperar contraseña (`POST /auth/forgot-password` envía por email (SMTP) un enlace de restablecimiento que vence en 1 hora)
- `/reset-password` - Establecer nueva contraseña

> No existe auto-registro: las cuentas las crea un ADMIN (diálogo "Nuevo Usuario" en `/users`).

---

### 👔 Flujo ADMIN

```mermaid
flowchart LR
    subgraph Dashboard["📊 Dashboard"]
        Metrics[Métricas]
        Activity[Actividad en Vivo]
        RecentPayments[Pagos Recientes]
    end

    subgraph Gestion["🏢 Gestión"]
        Users["/users<br/>Directorio Usuarios"]
        MTypes["/membership-types<br/>Tipos Membresía"]
        Memb["/memberships<br/>Membresías"]
        Pay["/payments<br/>Pagos"]
    end

    subgraph Reportes["📈 Reportes"]
        Reports["/reports<br/>Centro Reportes"]
        Export[Exportar PDF/Excel]
    end

    subgraph Notif["🔔 Notificaciones"]
        NotifAdmin["/notifications-admin<br/>Panel Notificaciones"]
        SendPush[Enviar Push]
    end

    subgraph Auditoria["🛡️ Auditoría"]
        Audit["/audit-logs<br/>Logs de Auditoría"]
    end

    Dashboard --> Gestion
    Dashboard --> Reportes
    Dashboard --> Notif
    Dashboard --> Auditoria

    Users --> |Crear| NewUser[Dialog Crear Usuario]
    Users --> |Ver| UserDetail[Detalle Usuario]
    Memb --> |Crear| NewMemb[Dialog Membresía]
    Pay --> |Registrar| NewPay[Dialog Pago]
```

**Permisos ADMIN:**
| Módulo | Acciones |
|--------|----------|
| Usuarios | CRUD completo |
| Tipos Membresía | CRUD completo |
| Membresías | CRUD completo |
| Pagos | CRUD completo |
| Reportes | Ver y exportar |
| Notificaciones | Enviar a todos/individual |
| Auditoría | Ver logs de auditoría |

---

### 🏋️ Flujo TRAINER

```mermaid
flowchart LR
    subgraph Training["💪 Entrenamiento"]
        Exercises["/exercises<br/>Biblioteca Ejercicios"]
        Routines["/training/routines/daily/new<br/>Rutinas Diarias"]
        Programs["/training/routines/weekly/new<br/>Programas Semanales"]
    end

    subgraph Asignacion["📋 Asignación"]
        Assign[Asignar Programa]
        UserList[Lista Usuarios]
    end

    subgraph Access["🚪 Acceso"]
        Scanner["/access/scan<br/>Escáner QR"]
        Logs["/access/logs<br/>Logs de Acceso"]
    end

    Exercises --> |CRUD| ExForm[Form Ejercicio]
    Routines --> |Crear| RoutineBuilder[Constructor Rutina]
    Programs --> |Crear| ProgramBuilder[Constructor Programa]
    Programs --> Assign
    Assign --> UserList
    Assign --> |POST /programs/assign| Snapshot[Snapshot UserProgram]

    Scanner --> |Escanear| ValidateQR[Validar QR]
    ValidateQR --> |Concedido| GrantAccess[✅ Acceso OK]
    ValidateQR --> |Denegado| DenyAccess[❌ Acceso Denegado]
```

**Permisos TRAINER:**
| Módulo | Acciones |
|--------|----------|
| Ejercicios | CRUD completo |
| Rutinas | Crear, ver y editar (eliminar solo ADMIN) |
| Programas | CRUD + Asignar |
| Usuarios | Solo lectura |
| Control Acceso | Escanear y ver logs |

---

### 👤 Flujo USER (Socio)

```mermaid
flowchart TB
    subgraph Rutina["🏋️ Mi Rutina"]
        MyRoutines["/my-routines<br/>Vista Semanal"]
        DayView["/my-routines/:id/start<br/>Entrenamiento Activo"]
        Workout["/my-routines/:id/exercise/:exerciseId<br/>Series del Ejercicio"]
        History["/my-routines/history<br/>Historial"]
    end

    subgraph Ejecucion["⏱️ Ejecución"]
        StartWorkout[Iniciar Workout]
        LogSet[Registrar Serie]
        RestTimer[Timer Descanso]
        Complete[Completar Workout]
    end

    subgraph Progreso["📈 Progreso"]
        MyProgress["/my-progress<br/>Mi Progreso"]
        Charts[Gráficos Evolución]
        PRs["/profile/records<br/>Récords Personales"]
    end

    subgraph Perfil["👤 Perfil"]
        Profile["/profile<br/>Mi Perfil"]
        QRCode["/profile/qr<br/>Mi QR de Acceso"]
        Attendance["/profile/attendance<br/>Mi Asistencia"]
        Notifications[Activar notificaciones push]
    end

    subgraph Offline["📴 Sin conexión"]
        IDB[(IndexedDB)]
        Sync[Sincronización al reconectar]
    end

    MyRoutines --> DayView
    MyRoutines --> History
    DayView --> StartWorkout
    StartWorkout --> Workout
    Workout --> LogSet
    LogSet --> RestTimer
    RestTimer --> LogSet
    LogSet --> Complete
    Complete --> |PR detectado| PRs

    Profile --> QRCode
    Profile --> Attendance
    Profile --> Notifications
    Complete -.->|sin conexión| IDB
    IDB --> Sync
```

> El estado de la membresía del socio se muestra en su dashboard (sección "Mi Membresía").
>
> Los entrenamientos pueden ejecutarse sin conexión: se guardan en IndexedDB y se sincronizan con el backend cuando vuelve la conexión.

**Permisos USER:**
| Módulo | Acciones |
|--------|----------|
| Mis Rutinas | Ver programa asignado, ejecutar |
| Entrenamientos | Registrar series, pesos |
| Progreso | Ver PRs y evolución |
| Perfil | Ver/editar datos propios |
| Membresía | Solo lectura (dashboard) |
| QR | Ver código propio |

---

## Flujos Críticos de Negocio

### 1. Flujo Pago → Membresía → Acceso

```mermaid
sequenceDiagram
    actor A as Admin
    actor U as Usuario
    actor S as Staff (Admin/Trainer)
    participant P as Payments
    participant M as Memberships
    participant Q as QR/Access

    A->>M: Crear membresía para usuario
    M->>M: Estado: ACTIVE
    A->>P: Registrar pago
    P->>M: Asociar pago a membresía

    Note over M: Membresía activa<br/>con cobertura

    U->>S: Muestra su QR en la entrada
    S->>Q: Escanear QR (POST /access/validate-qr)
    Q->>M: Verificar membresía (no cancelada y endDate ≥ hoy)
    M-->>Q: ✅ Membresía válida
    Q->>Q: Registrar AccessLog
    Q-->>S: Acceso concedido
```

### 2. Flujo Asignación de Programa (Patrón Snapshot)

```mermaid
sequenceDiagram
    actor T as Trainer
    participant P as Program
    participant UP as UserProgram
    participant U as Usuario

    T->>P: Crear Programa con Rutinas
    T->>UP: Asignar a Usuario (POST /programs/assign)

    Note over UP: SNAPSHOT:<br/>Copia inmutable del programa

    UP->>UP: Desactivar UserProgram activo previo
    UP->>UP: Crear UserProgram
    UP->>UP: Crear UserProgramRoutines
    UP->>UP: Crear UserProgramExercises

    U->>UP: Ver "Mis Rutinas"
    UP-->>U: Rutinas personalizadas

    Note over P,UP: Si Trainer modifica Program,<br/>NO afecta UserProgram existente
```

### 3. Flujo Ejecución de Workout

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as WorkoutLog
    participant E as ExerciseLog
    participant PR as PersonalRecord

    U->>W: Iniciar Workout
    W->>W: startedAt = now()
    W->>W: status = IN_PROGRESS

    loop Para cada ejercicio
        U->>E: Registrar serie (reps, peso)
        U->>E: Marcar serie completada
        E->>PR: ¿Nuevo PR?
        alt Es récord
            PR->>PR: Actualizar PersonalRecord
            PR-->>U: 🎉 Notificar PR (push)
        end
    end

    U->>W: Completar Workout
    W->>W: finishedAt = now()
    W->>W: status = COMPLETED
    W->>W: duration = tiempo enviado por el cliente (timer)
```

---

## Navegación por Rutas

### Rutas Públicas (guestGuard)

| Ruta               | Componente              | Descripción          |
| ------------------ | ----------------------- | -------------------- |
| `/login`           | LoginComponent          | Inicio de sesión     |
| `/forgot-password` | ForgotPasswordComponent | Recuperar contraseña |
| `/reset-password`  | ResetPasswordComponent  | Nueva contraseña     |

### Rutas Protegidas (authGuard)

| Ruta           | Roles | Descripción                                                                   |
| -------------- | ----- | ----------------------------------------------------------------------------- |
| `/dashboard`   | Todos | Dashboard según rol                                                           |
| `/profile`     | Todos | Perfil del usuario (`edit`, `change-password`, `qr`, `attendance`, `records`) |
| `/my-routines` | Todos | Rutinas asignadas (`history`, `:id/start`, `:id/exercise/:exerciseId`)        |
| `/my-progress` | Todos | Progreso personal                                                             |

### Rutas Admin (roleGuard: ADMIN)

| Ruta                   | Descripción             |
| ---------------------- | ----------------------- |
| `/users`               | Directorio de usuarios  |
| `/membership-types`    | Tipos de membresía      |
| `/memberships`         | Membresías              |
| `/payments`            | Pagos                   |
| `/reports`             | Centro de reportes      |
| `/notifications-admin` | Panel de notificaciones |
| `/audit-logs`          | Logs de auditoría       |

### Rutas Trainer (roleGuard: ADMIN, TRAINER)

| Ruta         | Descripción                                                                         |
| ------------ | ----------------------------------------------------------------------------------- |
| `/exercises` | Biblioteca de ejercicios                                                            |
| `/training`  | Gestión de entrenamiento (builders en `routines/daily/...` y `routines/weekly/...`) |
| `/access`    | Control de acceso QR (`scan`, `logs`, `stats`)                                      |

---

## Estados de Membresía y Acceso

```mermaid
stateDiagram-v2
    [*] --> Active: Crear membresía
    Active --> Expired: endDate vencida (cron diario)
    Active --> GracePeriod: Cambio manual (admin)
    Active --> Cancelled: Cancelar
    Expired --> Active: Registrar pago (renovación)
    GracePeriod --> Active: Registrar pago (renovación)

    state "Acceso QR" as QR {
        Active --> Granted: Escanear (endDate ≥ hoy)
        GracePeriod --> Granted: Escanear (endDate ≥ hoy)
        Expired --> Denied: Escanear (endDate vencida)
        Cancelled --> Denied: Escanear
    }
```

---

## Referencias

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura técnica
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Diagrama de entidades
- [ENTITY_ANALYSIS.md](./ENTITY_ANALYSIS.md) - Decisiones arquitectónicas
