# FitFlow - Esquema de Base de Datos (V3)

Este documento muestra el diagrama de entidades y relaciones de la base de datos.

> **Para visualizar**: Instala el plugin "Markdown Preview Mermaid Support" en VS Code o usa https://mermaid.live
>
> **Última actualización**: Febrero 2026

## Diagrama ER - Completo

```mermaid
erDiagram
    %% ========== USUARIOS ==========
    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        string refreshToken
        string resetPasswordTokenHash
        datetime resetPasswordExpires
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    %% ========== MEMBRESÍAS ==========
    MembershipType {
        uuid id PK
        string name
        text description
        decimal price
        int durationDays
        int gracePeriodDays
        enum accessType
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Membership {
        uuid id PK
        uuid userId FK
        uuid membershipTypeId FK
        date startDate
        date endDate
        enum status
        text notes
        datetime createdAt
        datetime updatedAt
    }

    Payment {
        uuid id PK
        uuid membershipId FK
        uuid registeredById FK
        decimal amount
        enum paymentMethod
        date paymentDate
        date coverageStart
        date coverageEnd
        string reference
        text notes
        datetime createdAt
        datetime updatedAt
    }

    %% ========== ACCESO ==========
    AccessLog {
        uuid id PK
        uuid userId FK
        uuid scannedById FK
        boolean granted
        string reason
        datetime createdAt
    }

    %% ========== NOTIFICACIONES ==========
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

    %% ========== EJERCICIOS ==========
    MuscleGroup {
        uuid id PK
        string code UK
        string name
        text description
        string icon
        int order
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Exercise {
        uuid id PK
        uuid muscleGroupId FK
        string name
        text description
        enum difficulty
        enum equipment
        string videoUrl
        string imageUrl
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    %% ========== RUTINAS (Templates) ==========
    Routine {
        uuid id PK
        uuid createdById FK
        string name
        text description
        enum difficulty
        int estimatedDuration
        boolean isActive
        boolean isTemplate
        boolean isDraft
        enum templateCategory
        enum type
        datetime createdAt
        datetime updatedAt
    }

    RoutineExercise {
        uuid id PK
        uuid routineId FK
        uuid exerciseId FK
        int order
        int sets
        int reps
        int restSeconds
        text notes
        decimal suggestedWeight
        enum dayOfWeek
    }

    %% ========== PROGRAMAS (Templates) ==========
    Program {
        uuid id PK
        uuid createdById FK
        string name
        text description
        enum difficulty
        int totalRoutines
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ProgramRoutine {
        uuid id PK
        uuid programId FK
        uuid routineId FK
        int order
        datetime createdAt
    }

    ProgramRoutineExercise {
        uuid id PK
        uuid programRoutineId FK
        uuid exerciseId FK
        int order
        int sets
        int reps
        int restSeconds
        decimal weight
        text notes
        datetime createdAt
    }

    %% ========== ASIGNACIÓN A USUARIOS (Snapshots) ==========
    UserProgram {
        uuid id PK
        uuid userId FK
        uuid programId FK
        string programName
        date assignedAt
        date endDate
        boolean isActive
        datetime createdAt
    }

    UserProgramRoutine {
        uuid id PK
        uuid userProgramId FK
        uuid originalRoutineId FK
        string name
        text description
        int order
        int estimatedDuration
        datetime lastCompletedAt
        datetime createdAt
    }

    UserProgramExercise {
        uuid id PK
        uuid userProgramRoutineId FK
        uuid exerciseId FK
        int order
        int sets
        int reps
        int restSeconds
        decimal weight
        text notes
        datetime createdAt
        datetime updatedAt
    }

    %% ========== REGISTRO DE ENTRENAMIENTOS ==========
    WorkoutLog {
        uuid id PK
        uuid userProgramRoutineId FK
        datetime startedAt
        datetime finishedAt
        enum status
        int duration
        text notes
        datetime createdAt
    }

    ExerciseLog {
        uuid id PK
        uuid workoutLogId FK
        uuid exerciseId FK
        int setNumber
        int reps
        decimal weight
        boolean completed
        text notes
        int rir
        decimal rpe
    }

    %% ========== RÉCORDS PERSONALES ==========
    PersonalRecord {
        uuid id PK
        uuid userId FK
        uuid exerciseId FK
        decimal maxWeight
        int maxWeightReps
        datetime maxWeightAchievedAt
        decimal maxVolume
        decimal maxVolumeWeight
        int maxVolumeReps
        datetime maxVolumeAchievedAt
        datetime createdAt
        datetime updatedAt
    }

    %% ========== RELACIONES ==========

    %% Membresías y Pagos
    User ||--o{ Membership : "tiene"
    MembershipType ||--o{ Membership : "define"
    Membership ||--o{ Payment : "genera"
    User ||--o{ Payment : "registra"

    %% Acceso
    User ||--o{ AccessLog : "accede"

    %% Notificaciones
    User ||--o{ DeviceToken : "registra dispositivo"

    %% Ejercicios
    MuscleGroup ||--o{ Exercise : "agrupa"

    %% Rutinas (Templates)
    User ||--o{ Routine : "crea"
    Routine ||--o{ RoutineExercise : "contiene"
    Exercise ||--o{ RoutineExercise : "usado en"

    %% Programas (Templates)
    User ||--o{ Program : "crea"
    Program ||--o{ ProgramRoutine : "contiene"
    Routine ||--o{ ProgramRoutine : "referencia"
    ProgramRoutine ||--o{ ProgramRoutineExercise : "personaliza"
    Exercise ||--o{ ProgramRoutineExercise : "usado en"

    %% Asignación (Snapshots)
    User ||--o{ UserProgram : "tiene asignado"
    Program ||--o{ UserProgram : "copiado de"
    UserProgram ||--o{ UserProgramRoutine : "contiene"
    Routine ||--o{ UserProgramRoutine : "copiado de"
    UserProgramRoutine ||--o{ UserProgramExercise : "contiene"
    Exercise ||--o{ UserProgramExercise : "referencia"

    %% Ejecución
    UserProgramRoutine ||--o{ WorkoutLog : "ejecuta"
    WorkoutLog ||--o{ ExerciseLog : "registra"
    Exercise ||--o{ ExerciseLog : "referencia"

    %% Récords
    User ||--o{ PersonalRecord : "tiene"
    Exercise ||--o{ PersonalRecord : "para"
```

## Diagrama de Flujo - Entrenamiento

```mermaid
flowchart TB
    subgraph Templates["📋 Templates (Admin crea)"]
        R[Routine] --> RE[RoutineExercise]
        RE --> E[Exercise]
        P[Program] --> PR[ProgramRoutine]
        PR --> R
        PR --> PRE[ProgramRoutineExercise]
    end

    subgraph Snapshot["📸 Snapshot (Al asignar)"]
        UP[UserProgram]
        UPR[UserProgramRoutine]
        UPE[UserProgramExercise]
        UP --> UPR
        UPR --> UPE
    end

    subgraph Ejecucion["🏋️ Ejecución (Usuario entrena)"]
        WL[WorkoutLog]
        EL[ExerciseLog]
        UPR --> WL
        WL --> EL
    end

    P -.->|"Copia al asignar"| UP
    PR -.->|"Copia"| UPR
    PRE -.->|"Copia"| UPE

    style P fill:#6366f1,color:#fff
    style UP fill:#22c55e,color:#fff
    style WL fill:#f59e0b,color:#fff
```

## Entidades por Módulo

### Módulo de Usuarios y Acceso

| Entidad       | Tipo | Descripción                              |
| ------------- | ---- | ---------------------------------------- |
| **User**      | Core | Usuario del sistema (admin/trainer/user) |
| **AccessLog** | Log  | Registro de acceso al gimnasio (QR)      |

### Módulo de Membresías y Pagos

| Entidad            | Tipo   | Descripción                    |
| ------------------ | ------ | ------------------------------ |
| **MembershipType** | Config | Tipos de membresía disponibles |
| **Membership**     | Core   | Membresía activa de un usuario |
| **Payment**        | Log    | Registro de pagos realizados   |

### Módulo de Notificaciones

| Entidad                  | Tipo   | Descripción                      |
| ------------------------ | ------ | -------------------------------- |
| **NotificationTemplate** | Config | Plantillas de notificación       |
| **DeviceToken**          | Core   | Tokens de dispositivos para push |

### Módulo de Rutinas y Programas

| Entidad                    | Tipo     | Descripción                                 |
| -------------------------- | -------- | ------------------------------------------- |
| **MuscleGroup**            | Config   | Grupos musculares                           |
| **Exercise**               | Config   | Ejercicio individual                        |
| **Routine**                | Template | Rutina base con ejercicios                  |
| **RoutineExercise**        | Template | Ejercicios de la rutina                     |
| **Program**                | Template | Programa (agrupa rutinas)                   |
| **ProgramRoutine**         | Template | Rutina dentro del programa                  |
| **ProgramRoutineExercise** | Template | Ejercicios personalizados para el programa  |
| **UserProgram**            | Snapshot | Programa asignado a usuario                 |
| **UserProgramRoutine**     | Snapshot | Rutina copiada para el usuario              |
| **UserProgramExercise**    | Snapshot | Ejercicios copiados (editables por usuario) |

### Módulo de Entrenamientos

| Entidad            | Tipo      | Descripción                           |
| ------------------ | --------- | ------------------------------------- |
| **WorkoutLog**     | Ejecución | Registro de sesión de entrenamiento   |
| **ExerciseLog**    | Ejecución | Registro de cada serie realizada      |
| **PersonalRecord** | Récord    | Mejor marca por ejercicio por usuario |

## Flujo de Datos

### 1. Admin/Entrenador crea Templates

```
Routine + RoutineExercise → Rutina base
Program + ProgramRoutine + ProgramRoutineExercise → Programa con personalizaciones
```

### 2. Asignar programa a usuario (SNAPSHOT)

```
Program → UserProgram (copia nombre, referencia original)
ProgramRoutine → UserProgramRoutine (copia datos, guarda lastCompletedAt)
ProgramRoutineExercise → UserProgramExercise (copia ejercicios editables)
```

**Importante**: El snapshot es INMUTABLE respecto al template original. Si el admin modifica el programa, NO afecta a usuarios ya asignados.

### 3. Usuario ejecuta rutina

```
UserProgramRoutine → WorkoutLog (startedAt, timer inicia)
WorkoutLog → ExerciseLog (cada serie completada con reps, peso, RIR, RPE)
WorkoutLog.finishedAt → Timer finaliza
UserProgramRoutine.lastCompletedAt → Se actualiza
PersonalRecord → Se verifica y actualiza si hay nuevo PR
```

### 4. Próxima ejecución

```
Buscar último WorkoutLog de esta UserProgramRoutine
Cargar ExerciseLogs → Pre-llenar formulario con últimos valores
```

## Enums Utilizados

| Enum                 | Valores                                                                          | Usado en                   |
| -------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| **Role**             | user, admin, trainer                                                             | User                       |
| **Difficulty**       | beginner, intermediate, advanced                                                 | Exercise, Routine, Program |
| **Equipment**        | none, barbell, dumbbell, etc.                                                    | Exercise                   |
| **RoutineType**      | daily, weekly                                                                    | Routine                    |
| **TemplateCategory** | strength, hypertrophy, endurance, cardio, etc.                                   | Routine                    |
| **DayOfWeek**        | monday-sunday                                                                    | RoutineExercise            |
| **WorkoutStatus**    | pending, in_progress, completed, skipped                                         | WorkoutLog                 |
| **MembershipStatus** | active, expired, cancelled, grace_period                                         | Membership                 |
| **PaymentMethod**    | cash, card, transfer, other                                                      | Payment                    |
| **AccessType**       | all_access, etc.                                                                 | MembershipType             |
| **DevicePlatform**   | web, android, ios                                                                | DeviceToken                |
| **NotificationType** | MEMBERSHIP_EXPIRING, MEMBERSHIP_EXPIRED, LOW_ATTENDANCE, PERSONAL_RECORD, CUSTOM | NotificationTemplate       |

## Entidades Eliminadas (Historial)

| Entidad                   | Razón                                         |
| ------------------------- | --------------------------------------------- |
| ~~UserRoutine~~           | Solo se asignan programas, no rutinas sueltas |
| ~~dayOfWeek / dayNumber~~ | Sin secuencialidad obligatoria en programas   |
