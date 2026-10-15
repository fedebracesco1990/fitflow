# FitFlow - Diccionario de Datos

Este documento describe en detalle cada entidad de la base de datos, sus campos, tipos y relaciones.

> **Última actualización**: Febrero 2026
>
> **Total de Entidades**: 24

---

## Índice

1. [Módulo Usuarios](#módulo-usuarios)
2. [Módulo Membresías](#módulo-membresías)
3. [Módulo Notificaciones](#módulo-notificaciones)
4. [Módulo Ejercicios](#módulo-ejercicios)
5. [Módulo Rutinas](#módulo-rutinas)
6. [Módulo Programas](#módulo-programas)
7. [Módulo Entrenamientos](#módulo-entrenamientos)
8. [Módulo Auditoría](#módulo-auditoría)
9. [Enums](#enums)

---

## Módulo Usuarios

### User

Tabla: `users`

| Campo                    | Tipo         | Nullable | Default | Descripción                              |
| ------------------------ | ------------ | -------- | ------- | ---------------------------------------- |
| `id`                     | UUID         | No       | auto    | Identificador único                      |
| `name`                   | VARCHAR(100) | No       | -       | Nombre completo                          |
| `email`                  | VARCHAR(255) | No       | -       | Email único (lowercase)                  |
| `password`               | VARCHAR      | No       | -       | Hash bcrypt (select: false)              |
| `role`                   | ENUM(Role)   | No       | 'user'  | Rol del usuario                          |
| `refreshToken`           | VARCHAR      | Sí       | null    | Token de refresco (select: false)        |
| `resetPasswordTokenHash` | VARCHAR      | Sí       | null    | Hash para reset password (select: false) |
| `resetPasswordExpires`   | TIMESTAMP    | Sí       | null    | Expiración del token reset               |
| `failedLoginAttempts`    | INT          | No       | 0       | Intentos de login fallidos               |
| `lockedUntil`            | TIMESTAMP    | Sí       | null    | Cuenta bloqueada hasta                   |
| `isActive`               | BOOLEAN      | No       | true    | Usuario activo/inactivo                  |
| `createdAt`              | DATETIME     | No       | auto    | Fecha de creación                        |
| `updatedAt`              | DATETIME     | No       | auto    | Última actualización                     |

**Relaciones:**

- `OneToMany` → Membership (un usuario tiene muchas membresías)

---

### AccessLog

Tabla: `access_logs`

| Campo         | Tipo         | Nullable | Default | Descripción               |
| ------------- | ------------ | -------- | ------- | ------------------------- |
| `id`          | UUID         | No       | auto    | Identificador único       |
| `userId`      | UUID         | No       | -       | Usuario que accede (FK)   |
| `scannedById` | UUID         | Sí       | null    | Usuario que escanea (FK)  |
| `granted`     | BOOLEAN      | No       | -       | Acceso concedido/denegado |
| `reason`      | VARCHAR(100) | Sí       | null    | Razón si fue denegado     |
| `createdAt`   | DATETIME     | No       | auto    | Fecha del acceso          |

**Relaciones:**

- `ManyToOne` → User (userId) - CASCADE
- `ManyToOne` → User (scannedById) - SET NULL

---

## Módulo Membresías

### MembershipType

Tabla: `membership_types`

| Campo             | Tipo             | Nullable | Default      | Descripción          |
| ----------------- | ---------------- | -------- | ------------ | -------------------- |
| `id`              | UUID             | No       | auto         | Identificador único  |
| `name`            | VARCHAR(100)     | No       | -            | Nombre del tipo      |
| `description`     | TEXT             | Sí       | null         | Descripción          |
| `price`           | DECIMAL(10,2)    | No       | -            | Precio               |
| `durationDays`    | INT              | No       | -            | Duración en días     |
| `gracePeriodDays` | INT              | No       | 0            | Días de gracia       |
| `accessType`      | ENUM(AccessType) | No       | 'all_access' | Tipo de acceso       |
| `isActive`        | BOOLEAN          | No       | true         | Tipo activo          |
| `createdAt`       | DATETIME         | No       | auto         | Fecha de creación    |
| `updatedAt`       | DATETIME         | No       | auto         | Última actualización |

---

### Membership

Tabla: `memberships`

| Campo              | Tipo                   | Nullable | Default  | Descripción            |
| ------------------ | ---------------------- | -------- | -------- | ---------------------- |
| `id`               | UUID                   | No       | auto     | Identificador único    |
| `userId`           | UUID                   | No       | -        | Usuario (FK)           |
| `membershipTypeId` | UUID                   | No       | -        | Tipo de membresía (FK) |
| `startDate`        | DATE                   | No       | -        | Fecha inicio           |
| `endDate`          | DATE                   | No       | -        | Fecha fin              |
| `status`           | ENUM(MembershipStatus) | No       | 'active' | Estado                 |
| `notes`            | TEXT                   | Sí       | null     | Notas                  |
| `createdAt`        | DATETIME               | No       | auto     | Fecha de creación      |
| `updatedAt`        | DATETIME               | No       | auto     | Última actualización   |

**Relaciones:**

- `ManyToOne` → User (userId) - CASCADE
- `ManyToOne` → MembershipType (membershipTypeId) - RESTRICT

---

### Payment

Tabla: `payments`

| Campo            | Tipo                | Nullable | Default | Descripción             |
| ---------------- | ------------------- | -------- | ------- | ----------------------- |
| `id`             | UUID                | No       | auto    | Identificador único     |
| `membershipId`   | UUID                | No       | -       | Membresía asociada (FK) |
| `amount`         | DECIMAL(10,2)       | No       | -       | Monto del pago          |
| `paymentMethod`  | ENUM(PaymentMethod) | No       | 'cash'  | Método de pago          |
| `paymentDate`    | DATE                | No       | -       | Fecha del pago          |
| `coverageStart`  | DATE                | Sí       | null    | Inicio cobertura        |
| `coverageEnd`    | DATE                | Sí       | null    | Fin cobertura           |
| `reference`      | VARCHAR(100)        | Sí       | null    | Referencia/comprobante  |
| `notes`          | TEXT                | Sí       | null    | Notas                   |
| `registeredById` | UUID                | Sí       | null    | Quién registró (FK)     |
| `createdAt`      | DATETIME            | No       | auto    | Fecha de creación       |
| `updatedAt`      | DATETIME            | No       | auto    | Última actualización    |
| `deletedAt`      | DATETIME            | Sí       | null    | Soft delete             |

**Relaciones:**

- `ManyToOne` → Membership (membershipId) - CASCADE
- `ManyToOne` → User (registeredById) - SET NULL

---

## Módulo Notificaciones

### NotificationTemplate

Tabla: `notification_templates`

| Campo       | Tipo                   | Nullable | Default | Descripción            |
| ----------- | ---------------------- | -------- | ------- | ---------------------- |
| `id`        | UUID                   | No       | auto    | Identificador único    |
| `type`      | ENUM(NotificationType) | No       | -       | Tipo único             |
| `title`     | VARCHAR(100)           | No       | -       | Título de la plantilla |
| `body`      | VARCHAR(500)           | No       | -       | Cuerpo del mensaje     |
| `isActive`  | BOOLEAN                | No       | true    | Plantilla activa       |
| `createdAt` | DATETIME               | No       | auto    | Fecha de creación      |
| `updatedAt` | DATETIME               | No       | auto    | Última actualización   |

---

### DeviceToken

Tabla: `device_tokens`

| Campo       | Tipo                 | Nullable | Default | Descripción                  |
| ----------- | -------------------- | -------- | ------- | ---------------------------- |
| `id`        | UUID                 | No       | auto    | Identificador único          |
| `userId`    | UUID                 | No       | -       | Usuario (FK)                 |
| `token`     | VARCHAR(500)         | No       | -       | Token del dispositivo        |
| `platform`  | ENUM(DevicePlatform) | No       | 'web'   | Plataforma (web/android/ios) |
| `createdAt` | DATETIME             | No       | auto    | Fecha de creación            |
| `updatedAt` | DATETIME             | No       | auto    | Última actualización         |

**Índices:**

- `(userId, token)` - UNIQUE

**Relaciones:**

- `ManyToOne` → User (userId) - CASCADE

---

### AppNotification

Tabla: `notifications`

| Campo          | Tipo                         | Nullable | Default | Descripción              |
| -------------- | ---------------------------- | -------- | ------- | ------------------------ |
| `id`           | UUID                         | No       | auto    | Identificador único      |
| `title`        | VARCHAR(200)                 | No       | -       | Título                   |
| `body`         | VARCHAR(1000)                | No       | -       | Cuerpo del mensaje       |
| `type`         | VARCHAR(50)                  | Sí       | null    | Tipo de notificación     |
| `targetType`   | ENUM(NotificationTargetType) | No       | 'user'  | Destino (user/broadcast) |
| `targetUserId` | VARCHAR(36)                  | Sí       | null    | Usuario destino (FK)     |
| `senderUserId` | VARCHAR(36)                  | Sí       | null    | Usuario que envía (FK)   |
| `data`         | JSON                         | Sí       | null    | Datos adicionales        |
| `createdAt`    | DATETIME                     | No       | auto    | Fecha de creación        |

**Índices:**

- `(targetUserId, createdAt)`
- `(targetType, createdAt)`

**Relaciones:**

- `ManyToOne` → User (targetUserId) - CASCADE
- `ManyToOne` → User (senderUserId) - SET NULL

---

### NotificationRead

Tabla: `notification_reads`

| Campo            | Tipo        | Nullable | Default | Descripción           |
| ---------------- | ----------- | -------- | ------- | --------------------- |
| `id`             | UUID        | No       | auto    | Identificador único   |
| `notificationId` | VARCHAR(36) | No       | -       | Notificación (FK)     |
| `userId`         | VARCHAR(36) | No       | -       | Usuario que leyó (FK) |
| `readAt`         | DATETIME    | No       | auto    | Fecha de lectura      |

**Índices:**

- `(notificationId, userId)` - UNIQUE

**Relaciones:**

- `ManyToOne` → AppNotification (notificationId) - CASCADE
- `ManyToOne` → User (userId) - CASCADE

---

## Módulo Ejercicios

### MuscleGroup

Tabla: `muscle_groups`

| Campo         | Tipo         | Nullable | Default | Descripción                |
| ------------- | ------------ | -------- | ------- | -------------------------- |
| `id`          | UUID         | No       | auto    | Identificador único        |
| `code`        | VARCHAR(50)  | No       | -       | Código único (ej: 'chest') |
| `name`        | VARCHAR(100) | No       | -       | Nombre (ej: 'Pecho')       |
| `description` | TEXT         | Sí       | null    | Descripción                |
| `icon`        | VARCHAR(10)  | Sí       | null    | Icono                      |
| `order`       | INT          | No       | 0       | Orden de visualización     |
| `isActive`    | BOOLEAN      | No       | true    | Activo                     |
| `createdAt`   | DATETIME     | No       | auto    | Fecha de creación          |
| `updatedAt`   | DATETIME     | No       | auto    | Última actualización       |

---

### Exercise

Tabla: `exercises`

| Campo           | Tipo             | Nullable | Default    | Descripción               |
| --------------- | ---------------- | -------- | ---------- | ------------------------- |
| `id`            | UUID             | No       | auto       | Identificador único       |
| `name`          | VARCHAR(100)     | No       | -          | Nombre del ejercicio      |
| `description`   | TEXT             | Sí       | null       | Descripción/instrucciones |
| `muscleGroupId` | UUID             | Sí       | null       | Grupo muscular (FK)       |
| `difficulty`    | ENUM(Difficulty) | No       | 'beginner' | Dificultad                |
| `equipment`     | ENUM(Equipment)  | No       | 'none'     | Equipamiento requerido    |
| `videoUrl`      | VARCHAR(255)     | Sí       | null       | URL de video              |
| `imageUrl`      | VARCHAR(255)     | Sí       | null       | URL de imagen             |
| `isActive`      | BOOLEAN          | No       | true       | Activo                    |
| `createdAt`     | DATETIME         | No       | auto       | Fecha de creación         |
| `updatedAt`     | DATETIME         | No       | auto       | Última actualización      |

**Relaciones:**

- `ManyToOne` → MuscleGroup (muscleGroupId) - SET NULL

---

## Módulo Rutinas

### Routine

Tabla: `routines`

| Campo               | Tipo                   | Nullable | Default    | Descripción             |
| ------------------- | ---------------------- | -------- | ---------- | ----------------------- |
| `id`                | UUID                   | No       | auto       | Identificador único     |
| `createdById`       | UUID                   | Sí       | null       | Creador (FK)            |
| `name`              | VARCHAR(100)           | No       | -          | Nombre                  |
| `description`       | TEXT                   | Sí       | null       | Descripción             |
| `difficulty`        | ENUM(Difficulty)       | No       | 'beginner' | Dificultad              |
| `estimatedDuration` | INT                    | No       | 60         | Duración estimada (min) |
| `isActive`          | BOOLEAN                | No       | true       | Activa                  |
| `isTemplate`        | BOOLEAN                | No       | false      | Es plantilla            |
| `isDraft`           | BOOLEAN                | No       | false      | Es borrador             |
| `templateCategory`  | ENUM(TemplateCategory) | Sí       | null       | Categoría de plantilla  |
| `type`              | ENUM(RoutineType)      | No       | 'daily'    | Tipo (daily/weekly)     |
| `createdAt`         | DATETIME               | No       | auto       | Fecha de creación       |
| `updatedAt`         | DATETIME               | No       | auto       | Última actualización    |

**Relaciones:**

- `ManyToOne` → User (createdById) - SET NULL
- `OneToMany` → RoutineExercise (cascade)
- `OneToMany` → ProgramRoutine

---

### RoutineExercise

Tabla: `routine_exercises`

| Campo             | Tipo            | Nullable | Default | Descripción         |
| ----------------- | --------------- | -------- | ------- | ------------------- |
| `id`              | UUID            | No       | auto    | Identificador único |
| `routineId`       | UUID            | No       | -       | Rutina (FK)         |
| `exerciseId`      | UUID            | No       | -       | Ejercicio (FK)      |
| `order`           | INT             | No       | 1       | Orden en la rutina  |
| `sets`            | INT             | No       | 3       | Número de series    |
| `reps`            | INT             | No       | 12      | Repeticiones        |
| `restSeconds`     | INT             | No       | 60      | Descanso (seg)      |
| `notes`           | TEXT            | Sí       | null    | Notas               |
| `suggestedWeight` | DECIMAL(5,2)    | Sí       | null    | Peso sugerido       |
| `dayOfWeek`       | ENUM(DayOfWeek) | Sí       | null    | Día de la semana    |

**Relaciones:**

- `ManyToOne` → Routine (routineId) - CASCADE
- `ManyToOne` → Exercise (exerciseId) - CASCADE

---

## Módulo Programas

### Program

Tabla: `programs`

| Campo           | Tipo             | Nullable | Default    | Descripción          |
| --------------- | ---------------- | -------- | ---------- | -------------------- |
| `id`            | UUID             | No       | auto       | Identificador único  |
| `createdById`   | UUID             | Sí       | null       | Creador (FK)         |
| `name`          | VARCHAR(100)     | No       | -          | Nombre               |
| `description`   | TEXT             | Sí       | null       | Descripción          |
| `difficulty`    | ENUM(Difficulty) | No       | 'beginner' | Dificultad           |
| `totalRoutines` | INT              | No       | 0          | Total de rutinas     |
| `isActive`      | BOOLEAN          | No       | true       | Activo               |
| `createdAt`     | DATETIME         | No       | auto       | Fecha de creación    |
| `updatedAt`     | DATETIME         | No       | auto       | Última actualización |

**Relaciones:**

- `ManyToOne` → User (createdById) - SET NULL
- `OneToMany` → ProgramRoutine (cascade)

---

### ProgramRoutine

Tabla: `program_routines`

| Campo       | Tipo     | Nullable | Default | Descripción          |
| ----------- | -------- | -------- | ------- | -------------------- |
| `id`        | UUID     | No       | auto    | Identificador único  |
| `programId` | UUID     | No       | -       | Programa (FK)        |
| `routineId` | UUID     | No       | -       | Rutina base (FK)     |
| `order`     | INT      | No       | 1       | Orden en el programa |
| `createdAt` | DATETIME | No       | auto    | Fecha de creación    |

**Relaciones:**

- `ManyToOne` → Program (programId) - CASCADE
- `ManyToOne` → Routine (routineId) - CASCADE
- `OneToMany` → ProgramRoutineExercise

---

### ProgramRoutineExercise

Tabla: `program_routine_exercises`

| Campo              | Tipo         | Nullable | Default | Descripción         |
| ------------------ | ------------ | -------- | ------- | ------------------- |
| `id`               | UUID         | No       | auto    | Identificador único |
| `programRoutineId` | UUID         | No       | -       | ProgramRoutine (FK) |
| `exerciseId`       | UUID         | No       | -       | Ejercicio (FK)      |
| `order`            | INT          | No       | 1       | Orden               |
| `sets`             | INT          | No       | 3       | Series              |
| `reps`             | INT          | No       | 12      | Repeticiones        |
| `restSeconds`      | INT          | No       | 60      | Descanso            |
| `weight`           | DECIMAL(5,2) | Sí       | null    | Peso personalizado  |
| `notes`            | TEXT         | Sí       | null    | Notas               |
| `createdAt`        | DATETIME     | No       | auto    | Fecha de creación   |

**Relaciones:**

- `ManyToOne` → ProgramRoutine (programRoutineId) - CASCADE
- `ManyToOne` → Exercise (exerciseId) - CASCADE

---

### UserProgram (Snapshot)

Tabla: `user_programs`

| Campo         | Tipo         | Nullable | Default | Descripción            |
| ------------- | ------------ | -------- | ------- | ---------------------- |
| `id`          | UUID         | No       | auto    | Identificador único    |
| `userId`      | UUID         | No       | -       | Usuario asignado (FK)  |
| `programId`   | UUID         | No       | -       | Programa original (FK) |
| `programName` | VARCHAR(100) | No       | -       | Nombre copiado         |
| `assignedAt`  | DATE         | No       | -       | Fecha de asignación    |
| `endDate`     | DATE         | Sí       | null    | Fecha fin              |
| `isActive`    | BOOLEAN      | No       | true    | Activo                 |
| `createdAt`   | DATETIME     | No       | auto    | Fecha de creación      |

**Índices:**

- `(userId, isActive)`

**Relaciones:**

- `ManyToOne` → User (userId) - CASCADE
- `ManyToOne` → Program (programId) - CASCADE
- `OneToMany` → UserProgramRoutine (cascade)

---

### UserProgramRoutine (Snapshot)

Tabla: `user_program_routines`

| Campo               | Tipo         | Nullable | Default | Descripción          |
| ------------------- | ------------ | -------- | ------- | -------------------- |
| `id`                | UUID         | No       | auto    | Identificador único  |
| `userProgramId`     | UUID         | No       | -       | UserProgram (FK)     |
| `originalRoutineId` | UUID         | Sí       | null    | Rutina original (FK) |
| `name`              | VARCHAR(100) | No       | -       | Nombre copiado       |
| `description`       | TEXT         | Sí       | null    | Descripción copiada  |
| `order`             | INT          | No       | 1       | Orden                |
| `estimatedDuration` | INT          | No       | 60      | Duración (min)       |
| `lastCompletedAt`   | TIMESTAMP    | Sí       | null    | Último completado    |
| `createdAt`         | DATETIME     | No       | auto    | Fecha de creación    |

**Relaciones:**

- `ManyToOne` → UserProgram (userProgramId) - CASCADE
- `ManyToOne` → Routine (originalRoutineId) - SET NULL
- `OneToMany` → UserProgramExercise (cascade)

---

### UserProgramExercise (Snapshot)

Tabla: `user_program_exercises`

| Campo                  | Tipo         | Nullable | Default | Descripción             |
| ---------------------- | ------------ | -------- | ------- | ----------------------- |
| `id`                   | UUID         | No       | auto    | Identificador único     |
| `userProgramRoutineId` | UUID         | No       | -       | UserProgramRoutine (FK) |
| `exerciseId`           | UUID         | No       | -       | Ejercicio (FK)          |
| `order`                | INT          | No       | 1       | Orden                   |
| `sets`                 | INT          | No       | 3       | Series                  |
| `reps`                 | INT          | No       | 12      | Repeticiones            |
| `restSeconds`          | INT          | No       | 60      | Descanso                |
| `weight`               | DECIMAL(5,2) | Sí       | null    | Peso personalizado      |
| `notes`                | TEXT         | Sí       | null    | Notas                   |
| `createdAt`            | DATETIME     | No       | auto    | Fecha de creación       |
| `updatedAt`            | DATETIME     | No       | auto    | Última actualización    |

**Relaciones:**

- `ManyToOne` → UserProgramRoutine (userProgramRoutineId) - CASCADE
- `ManyToOne` → Exercise (exerciseId) - CASCADE

---

## Módulo Entrenamientos

### WorkoutLog

Tabla: `workout_logs`

| Campo                  | Tipo                | Nullable | Default   | Descripción           |
| ---------------------- | ------------------- | -------- | --------- | --------------------- |
| `id`                   | UUID                | No       | auto      | Identificador único   |
| `userProgramRoutineId` | UUID                | No       | -         | Rutina ejecutada (FK) |
| `startedAt`            | TIMESTAMP           | No       | -         | Hora de inicio        |
| `finishedAt`           | TIMESTAMP           | Sí       | null      | Hora de fin           |
| `status`               | ENUM(WorkoutStatus) | No       | 'pending' | Estado                |
| `duration`             | INT                 | Sí       | null      | Duración real (min)   |
| `notes`                | TEXT                | Sí       | null      | Notas                 |
| `createdAt`            | DATETIME            | No       | auto      | Fecha de creación     |

**Relaciones:**

- `ManyToOne` → UserProgramRoutine (userProgramRoutineId) - CASCADE
- `OneToMany` → ExerciseLog (cascade)

---

### ExerciseLog

Tabla: `exercise_logs`

| Campo          | Tipo         | Nullable | Default | Descripción                       |
| -------------- | ------------ | -------- | ------- | --------------------------------- |
| `id`           | UUID         | No       | auto    | Identificador único               |
| `workoutLogId` | UUID         | No       | -       | WorkoutLog (FK)                   |
| `exerciseId`   | UUID         | No       | -       | Ejercicio (FK)                    |
| `setNumber`    | INT          | No       | -       | Número de serie                   |
| `reps`         | INT          | No       | -       | Repeticiones realizadas           |
| `weight`       | DECIMAL(6,2) | Sí       | null    | Peso usado (kg)                   |
| `completed`    | BOOLEAN      | No       | false   | Serie completada                  |
| `notes`        | TEXT         | Sí       | null    | Notas                             |
| `rir`          | INT          | Sí       | null    | Reps In Reserve (0-5)             |
| `rpe`          | DECIMAL(3,1) | Sí       | null    | Rate of Perceived Exertion (1-10) |

**Relaciones:**

- `ManyToOne` → WorkoutLog (workoutLogId) - CASCADE
- `ManyToOne` → Exercise (exerciseId) - CASCADE

---

### PersonalRecord

Tabla: `personal_records`

| Campo                 | Tipo          | Nullable | Default | Descripción                  |
| --------------------- | ------------- | -------- | ------- | ---------------------------- |
| `id`                  | UUID          | No       | auto    | Identificador único          |
| `userId`              | UUID          | No       | -       | Usuario (FK)                 |
| `exerciseId`          | UUID          | No       | -       | Ejercicio (FK)               |
| `maxWeight`           | DECIMAL(6,2)  | Sí       | null    | Peso máximo                  |
| `maxWeightReps`       | INT           | Sí       | null    | Reps con peso máximo         |
| `maxWeightAchievedAt` | TIMESTAMP     | Sí       | null    | Fecha del récord             |
| `maxVolume`           | DECIMAL(10,2) | Sí       | null    | Volumen máximo (peso × reps) |
| `maxVolumeWeight`     | DECIMAL(6,2)  | Sí       | null    | Peso del récord volumen      |
| `maxVolumeReps`       | INT           | Sí       | null    | Reps del récord volumen      |
| `maxVolumeAchievedAt` | TIMESTAMP     | Sí       | null    | Fecha récord volumen         |
| `createdAt`           | DATETIME      | No       | auto    | Fecha de creación            |
| `updatedAt`           | DATETIME      | No       | auto    | Última actualización         |

**Índices:**

- `(userId, exerciseId)` - UNIQUE

**Relaciones:**

- `ManyToOne` → User (userId) - CASCADE
- `ManyToOne` → Exercise (exerciseId) - CASCADE

---

## Módulo Auditoría

### AuditLog

Tabla: `audit_logs`

| Campo           | Tipo              | Nullable | Default | Descripción                        |
| --------------- | ----------------- | -------- | ------- | ---------------------------------- |
| `id`            | UUID              | No       | auto    | Identificador único                |
| `action`        | ENUM(AuditAction) | No       | -       | Acción (CREATE/UPDATE/DELETE)      |
| `entity`        | VARCHAR(100)      | No       | -       | Entidad afectada                   |
| `entityId`      | UUID              | Sí       | null    | ID del registro afectado           |
| `performedById` | UUID              | Sí       | null    | Usuario que realizó la acción (FK) |
| `details`       | JSON              | Sí       | null    | Detalles adicionales               |
| `createdAt`     | DATETIME          | No       | auto    | Fecha del evento                   |

**Relaciones:**

- `ManyToOne` → User (performedById) - SET NULL

---

### AuthAuditLog

Tabla: `auth_audit_logs`

| Campo       | Tipo         | Nullable | Default | Descripción                     |
| ----------- | ------------ | -------- | ------- | ------------------------------- |
| `id`        | UUID         | No       | auto    | Identificador único             |
| `event`     | VARCHAR(50)  | No       | -       | Tipo de evento (AuditEventType) |
| `email`     | VARCHAR(255) | Sí       | null    | Email involucrado               |
| `userId`    | VARCHAR(36)  | Sí       | null    | Usuario (sin FK)                |
| `ipAddress` | VARCHAR(45)  | Sí       | null    | IP de origen                    |
| `userAgent` | VARCHAR(500) | Sí       | null    | User agent del cliente          |
| `createdAt` | DATETIME     | No       | auto    | Fecha del evento                |

---

## Enums

### Role

```typescript
enum Role {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  USER = 'user',
}
```

### MembershipStatus

```typescript
enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  GRACE_PERIOD = 'grace_period',
}
```

### PaymentMethod

```typescript
enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  OTHER = 'other',
}
```

### AccessType

```typescript
enum AccessType {
  GYM_ONLY = 'gym_only',
  ALL_ACCESS = 'all_access',
  CLASSES_ONLY = 'classes_only',
}
```

### Difficulty

```typescript
enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}
```

### Equipment

```typescript
enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  BANDS = 'bands',
  NONE = 'none',
}
```

### RoutineType

```typescript
enum RoutineType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}
```

### TemplateCategory

```typescript
enum TemplateCategory {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  FUNCTIONAL = 'functional',
  FULL_BODY = 'full_body',
}
```

### DayOfWeek

```typescript
enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}
```

### WorkoutStatus

```typescript
enum WorkoutStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}
```

### NotificationTargetType

```typescript
enum NotificationTargetType {
  USER = 'user',
  BROADCAST = 'broadcast',
}
```

### DevicePlatform

```typescript
enum DevicePlatform {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}
```

### NotificationType

```typescript
enum NotificationType {
  MEMBERSHIP_EXPIRING = 'MEMBERSHIP_EXPIRING',
  MEMBERSHIP_EXPIRED = 'MEMBERSHIP_EXPIRED',
  LOW_ATTENDANCE = 'LOW_ATTENDANCE',
  PERSONAL_RECORD = 'PERSONAL_RECORD',
  CUSTOM = 'CUSTOM',
}
```

### AuditAction

```typescript
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
```

### AuditEventType (AuthAuditLog.event)

```typescript
type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS';
```

---

## Referencias

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Diagrama ER visual
- [ENTITY_ANALYSIS.md](./ENTITY_ANALYSIS.md) - Decisiones arquitectónicas
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura general
