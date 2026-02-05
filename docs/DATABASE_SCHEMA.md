# FitFlow - Esquema de Base de Datos (V2)

Este documento muestra el diagrama de entidades y relaciones de la base de datos.

> **Para visualizar**: Instala el plugin "Markdown Preview Mermaid Support" en VS Code o usa https://mermaid.live

## Diagrama ER - Módulo de Rutinas y Programas

```mermaid
erDiagram
    %% ========== USUARIOS ==========
    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    %% ========== EJERCICIOS ==========
    MuscleGroup {
        uuid id PK
        string code UK
        string name
        text description
        int order
    }

    Exercise {
        uuid id PK
        uuid muscleGroupId FK
        string name
        text description
        enum difficulty
        enum equipment
        string videoUrl
        boolean isActive
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
    }

    RoutineExercise {
        uuid id PK
        uuid routineId FK
        uuid exerciseId FK
        int order
        int sets
        int reps
        int restSeconds
        decimal suggestedWeight
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
    }

    ProgramRoutine {
        uuid id PK
        uuid programId FK
        uuid routineId FK
        int order
    }

    ProgramRoutineExercise {
        uuid id PK
        uuid programRoutineId FK
        uuid exerciseId FK
        int order
        int sets
        int reps
        decimal weight
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
    }

    ExerciseLog {
        uuid id PK
        uuid workoutLogId FK
        uuid exerciseId FK
        int setNumber
        int reps
        decimal weight
        boolean completed
        int rir
        decimal rpe
    }

    PersonalRecord {
        uuid id PK
        uuid userId FK
        uuid exerciseId FK
        decimal maxWeight
        int maxWeightReps
        decimal maxVolume
    }

    %% ========== RELACIONES ==========

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

## Entidades Principales

| Entidad                    | Tipo      | Descripción                                 |
| -------------------------- | --------- | ------------------------------------------- |
| **Routine**                | Template  | Rutina base con ejercicios                  |
| **RoutineExercise**        | Template  | Ejercicios de la rutina                     |
| **Program**                | Template  | Programa semanal (agrupa rutinas)           |
| **ProgramRoutine**         | Template  | Rutina dentro del programa                  |
| **ProgramRoutineExercise** | Template  | Ejercicios personalizados para el programa  |
| **UserProgram**            | Snapshot  | Programa asignado a usuario                 |
| **UserProgramRoutine**     | Snapshot  | Rutina copiada para el usuario              |
| **UserProgramExercise**    | Snapshot  | Ejercicios copiados (editables por usuario) |
| **WorkoutLog**             | Ejecución | Registro de sesión de entrenamiento         |
| **ExerciseLog**            | Ejecución | Registro de cada serie realizada            |

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
WorkoutLog → ExerciseLog (cada serie completada)
WorkoutLog.finishedAt → Timer finaliza
UserProgramRoutine.lastCompletedAt → Se actualiza
```

### 4. Próxima ejecución

```
Buscar último WorkoutLog de esta UserProgramRoutine
Cargar ExerciseLogs → Pre-llenar formulario con últimos valores
```

## Entidades Eliminadas

| Entidad                   | Razón                                         |
| ------------------------- | --------------------------------------------- |
| ~~UserRoutine~~           | Solo se asignan programas, no rutinas sueltas |
| ~~dayOfWeek / dayNumber~~ | Sin secuencialidad obligatoria                |
| ~~Routine.type (WEEKLY)~~ | Program es entidad separada                   |
