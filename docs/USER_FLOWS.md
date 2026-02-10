# FitFlow - Flujos de Usuario

Este documento describe los flujos de navegación y casos de uso principales por rol en la aplicación FitFlow.

> **Última actualización**: Febrero 2026

---

## Roles del Sistema

| Rol         | Descripción                | Acceso Principal                                                         |
| ----------- | -------------------------- | ------------------------------------------------------------------------ |
| **ADMIN**   | Administrador del gimnasio | Gestión completa: usuarios, membresías, pagos, reportes, notificaciones  |
| **TRAINER** | Entrenador                 | Ejercicios, rutinas, programas, asignación a usuarios, control de acceso |
| **USER**    | Socio/Cliente              | Mi rutina, entrenamientos, progreso, perfil, QR de acceso                |

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
    L->>D: Redirect según rol

    Note over D: Dashboard muestra<br/>contenido según rol
```

**Rutas:**

- `/login` - Inicio de sesión
- `/forgot-password` - Recuperar contraseña
- `/reset-password` - Establecer nueva contraseña

---

### 👔 Flujo ADMIN

```mermaid
flowchart LR
    subgraph Dashboard["📊 Dashboard"]
        Metrics[Métricas]
        Activity[Actividad en Vivo]
        RecentPayments[Pagos Recientes]
        QuickActions[Acciones Rápidas]
    end

    subgraph Gestion["🏢 Gestión"]
        Users["/users<br/>Directorio Usuarios"]
        MTypes["/membership-types<br/>Tipos Membresía"]
        Memb["/memberships<br/>Membresías"]
        Pay["/payments<br/>Pagos"]
    end

    subgraph Reportes["📈 Reportes"]
        Reports["/reports<br/>Centro Reportes"]
        Export[Exportar CSV/PDF]
    end

    subgraph Notif["🔔 Notificaciones"]
        NotifAdmin["/notifications-admin<br/>Panel Notificaciones"]
        SendPush[Enviar Push]
    end

    Dashboard --> Gestion
    Dashboard --> Reportes
    Dashboard --> Notif

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

---

### 🏋️ Flujo TRAINER

```mermaid
flowchart LR
    subgraph Training["💪 Entrenamiento"]
        Exercises["/exercises<br/>Biblioteca Ejercicios"]
        Routines["/training/routines<br/>Rutinas"]
        Programs["/training/programs<br/>Programas"]
    end

    subgraph Asignacion["📋 Asignación"]
        Assign[Asignar Programa]
        UserList[Lista Usuarios]
    end

    subgraph Access["🚪 Acceso"]
        Scanner["/access<br/>Escáner QR"]
        Logs[Logs de Acceso]
    end

    Exercises --> |CRUD| ExForm[Form Ejercicio]
    Routines --> |Crear| RoutineBuilder[Constructor Rutina]
    Programs --> |Crear| ProgramBuilder[Constructor Programa]
    Programs --> Assign
    Assign --> UserList

    Scanner --> |Escanear| ValidateQR[Validar QR]
    ValidateQR --> |Concedido| GrantAccess[✅ Acceso OK]
    ValidateQR --> |Denegado| DenyAccess[❌ Acceso Denegado]
```

**Permisos TRAINER:**
| Módulo | Acciones |
|--------|----------|
| Ejercicios | CRUD completo |
| Rutinas | CRUD completo |
| Programas | CRUD + Asignar |
| Usuarios | Solo lectura |
| Control Acceso | Escanear y ver logs |

---

### 👤 Flujo USER (Socio)

```mermaid
flowchart TB
    subgraph Rutina["🏋️ Mi Rutina"]
        MyRoutines["/my-routines<br/>Vista Semanal"]
        DayView[Vista del Día]
        Workout[Ejecutar Rutina]
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
        PRs[Récords Personales]
    end

    subgraph Perfil["👤 Perfil"]
        Profile["/profile<br/>Mi Perfil"]
        QRCode[Mi QR de Acceso]
        Membership[Mi Membresía]
        Notifications[Notificaciones]
    end

    MyRoutines --> DayView
    DayView --> Workout
    Workout --> StartWorkout
    StartWorkout --> LogSet
    LogSet --> RestTimer
    RestTimer --> LogSet
    LogSet --> Complete
    Complete --> |PR detectado| PRs

    Profile --> QRCode
    Profile --> Membership
```

**Permisos USER:**
| Módulo | Acciones |
|--------|----------|
| Mis Rutinas | Ver programa asignado, ejecutar |
| Entrenamientos | Registrar series, pesos |
| Progreso | Ver PRs y evolución |
| Perfil | Ver/editar datos propios |
| Membresía | Solo lectura |
| QR | Ver código propio |

---

## Flujos Críticos de Negocio

### 1. Flujo Pago → Membresía → Acceso

```mermaid
sequenceDiagram
    actor A as Admin
    actor U as Usuario
    participant P as Payments
    participant M as Memberships
    participant Q as QR/Access

    A->>M: Crear membresía para usuario
    M->>M: Estado: ACTIVE
    A->>P: Registrar pago
    P->>M: Asociar pago a membresía

    Note over M: Membresía activa<br/>con cobertura

    U->>Q: Escanear QR en entrada
    Q->>M: Verificar membresía activa
    M-->>Q: ✅ Membresía válida
    Q->>Q: Registrar AccessLog
    Q-->>U: Acceso concedido
```

### 2. Flujo Asignación de Programa (Patrón Snapshot)

```mermaid
sequenceDiagram
    actor T as Trainer
    participant P as Program
    participant UP as UserProgram
    participant U as Usuario

    T->>P: Crear Programa con Rutinas
    T->>UP: Asignar a Usuario

    Note over UP: SNAPSHOT:<br/>Copia inmutable del programa

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
        E->>PR: ¿Nuevo PR?
        alt Es récord
            PR->>PR: Actualizar PersonalRecord
            PR-->>U: 🎉 Notificar PR
        end
    end

    U->>W: Completar Workout
    W->>W: finishedAt = now()
    W->>W: status = COMPLETED
    W->>W: duration = finishedAt - startedAt
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

| Ruta           | Roles | Descripción         |
| -------------- | ----- | ------------------- |
| `/dashboard`   | Todos | Dashboard según rol |
| `/profile`     | Todos | Perfil del usuario  |
| `/my-routines` | Todos | Rutinas asignadas   |
| `/my-progress` | Todos | Progreso personal   |

### Rutas Admin (roleGuard: ADMIN)

| Ruta                   | Descripción             |
| ---------------------- | ----------------------- |
| `/users`               | Directorio de usuarios  |
| `/membership-types`    | Tipos de membresía      |
| `/memberships`         | Membresías              |
| `/payments`            | Pagos                   |
| `/reports`             | Centro de reportes      |
| `/notifications-admin` | Panel de notificaciones |

### Rutas Trainer (roleGuard: ADMIN, TRAINER)

| Ruta         | Descripción              |
| ------------ | ------------------------ |
| `/exercises` | Biblioteca de ejercicios |
| `/training`  | Gestión de entrenamiento |
| `/access`    | Control de acceso QR     |

---

## Estados de Membresía y Acceso

```mermaid
stateDiagram-v2
    [*] --> Active: Crear membresía
    Active --> GracePeriod: Fecha fin alcanzada
    GracePeriod --> Expired: Grace period terminado
    Active --> Cancelled: Cancelar
    Expired --> Active: Renovar
    GracePeriod --> Active: Renovar

    state "Acceso QR" as QR {
        Active --> Granted: Escanear
        GracePeriod --> Granted: Escanear (con aviso)
        Expired --> Denied: Escanear
        Cancelled --> Denied: Escanear
    }
```

---

## Referencias

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura técnica
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Diagrama de entidades
- [ENTITY_ANALYSIS.md](./ENTITY_ANALYSIS.md) - Decisiones arquitectónicas
