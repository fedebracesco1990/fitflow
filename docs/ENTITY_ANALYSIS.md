# Análisis de Entidades - FitFlow

> **Estado**: Arquitectura implementada y en producción
>
> **Última actualización**: Febrero 2026

## Casos de Uso

### Usuario (cliente del gimnasio)

| #   | Caso de Uso        | Descripción                                 |
| --- | ------------------ | ------------------------------------------- |
| U1  | Ver mis rutinas    | Ver programa asignado con todas sus rutinas |
| U2  | Ejecutar rutina    | Marcar series, registrar peso/reps/RIR/RPE  |
| U3  | Ver historial      | Ver entrenamientos pasados completados      |
| U4  | Ver progreso       | Ver récords personales y evolución          |
| U5  | Timer de descanso  | Temporizador entre series                   |
| U6  | Acceso al gimnasio | Escaneo QR para registrar entrada           |
| U7  | Ver membresía      | Estado de membresía y pagos                 |

### Admin/Entrenador

| #   | Caso de Uso                | Descripción                                     |
| --- | -------------------------- | ----------------------------------------------- |
| A1  | Crear ejercicios           | Definir ejercicios con descripción, video, etc. |
| A2  | Crear rutina diaria        | Agrupar ejercicios con sets/reps/peso           |
| A3  | Crear programa             | Agrupar rutinas en un programa asignable        |
| A4  | Asignar programa a usuario | Crear snapshot del programa para el usuario     |
| A5  | Ver progreso de usuarios   | Monitorear entrenamientos y récords             |
| A6  | Gestionar membresías       | Crear tipos, asignar, registrar pagos           |
| A7  | Enviar notificaciones      | Push notifications personalizadas               |
| A8  | Control de acceso          | Escanear QR, ver logs de acceso                 |
| A9  | Reportes y dashboard       | Estadísticas del gimnasio                       |

---

## Arquitectura de Entidades (Estado Actual)

### Total: 23 entidades en 7 módulos

```
Módulo Users (2):        User, AccessLog
Módulo Memberships (3):  MembershipType, Membership, Payment
Módulo Notifications (4): NotificationTemplate, DeviceToken, AppNotification, NotificationRead
Módulo Exercises (2):    MuscleGroup, Exercise
Módulo Routines (2):     Routine, RoutineExercise
Módulo Programs (6):     Program, ProgramRoutine, ProgramRoutineExercise,
                         UserProgram, UserProgramRoutine, UserProgramExercise
Módulo Workouts (3):     WorkoutLog, ExerciseLog, PersonalRecord
```

---

## Decisiones Arquitectónicas Tomadas

### 1. Separación Routine vs Program

**Decisión**: `Routine` y `Program` son entidades separadas.

- `Routine` = rutina diaria (colección de ejercicios)
- `Program` = programa (colección ordenada de rutinas)
- `Routine` mantiene campo `type` (daily/weekly) por compatibilidad pero `Program` es la entidad principal para programas

### 2. Un solo camino de asignación

**Decisión**: Solo se asignan **programas** a usuarios, nunca rutinas sueltas.

- Se eliminó `UserRoutine`
- El flujo es: `Program` → `UserProgram` (snapshot) → `WorkoutLog`
- Un usuario siempre tiene un `UserProgram` activo

### 3. Patrón Snapshot para asignaciones

**Decisión**: Al asignar un programa, se crea una **copia inmutable** de la estructura.

```
Program           →  UserProgram (copia nombre)
ProgramRoutine    →  UserProgramRoutine (copia rutina con ejercicios)
ProgramRoutineExercise → UserProgramExercise (copia ejercicios editables)
```

**Ventajas**:

- Si el admin modifica el programa original, NO afecta a usuarios ya asignados
- El usuario puede personalizar pesos/reps de sus ejercicios
- Historial preciso de lo que el usuario hizo

### 4. WorkoutLog simplificado

**Decisión**: `WorkoutLog` solo referencia `UserProgramRoutine`.

- Un solo FK: `userProgramRoutineId`
- Sin FKs opcionales ni múltiples caminos
- Queries simples y directas

### 5. ProgramRoutineExercise se mantiene

**Decisión**: Permite al admin personalizar ejercicios al crear un programa, diferente de la rutina base.

- Ejemplo: Rutina "Piernas" tiene Press 3x12, pero en el Programa "Fuerza" se personaliza a 5x5
- Al asignar, se copian los ejercicios del programa (no de la rutina base)

---

## Modelo Visual

```
┌─────────────────────────────────────────────────────────────┐
│  📋 TEMPLATES (Admin crea y mantiene)                       │
│                                                             │
│  MuscleGroup ──► Exercise                                   │
│                     │                                       │
│  Routine ──► RoutineExercise ──► Exercise                   │
│     │                                                       │
│  Program ──► ProgramRoutine ──► Routine                     │
│                  │                                          │
│                  └─► ProgramRoutineExercise ──► Exercise     │
└─────────────────────────────────────────────────────────────┘
                          │
                    (Asignar = Snapshot)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  📸 SNAPSHOT (Copia para el usuario)                        │
│                                                             │
│  UserProgram ──► UserProgramRoutine ──► UserProgramExercise │
│       │                  │                                  │
│       │                  │                                  │
│       │                  ▼                                  │
│       │           WorkoutLog ──► ExerciseLog                │
│       │                                                     │
│       └──────► PersonalRecord                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Entidades de Soporte

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 GIMNASIO (Gestión del negocio)                          │
│                                                             │
│  User ──► Membership ──► MembershipType                     │
│   │           │                                             │
│   │           └──► Payment                                  │
│   │                                                         │
│   ├──► AccessLog                                            │
│   └──► DeviceToken                                          │
│                                                             │
│  NotificationTemplate (plantillas globales)                 │
│  AppNotification ──► NotificationRead                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Historial de Cambios

| Fecha    | Cambio                                                          |
| -------- | --------------------------------------------------------------- |
| Inicial  | Modelo con `Routine` haciendo doble función                     |
| V2       | Separación `Routine` / `Program`, eliminación `UserRoutine`     |
| V2       | Patrón Snapshot implementado                                    |
| V2       | `WorkoutLog` simplificado a un solo FK                          |
| Feb 2026 | Agregados módulos: Memberships, Payments, Access, Notifications |
| Feb 2026 | `PersonalRecord` ampliado con timestamps y volumen              |
| Feb 2026 | `ExerciseLog` con RIR y RPE                                     |
| Feb 2026 | Agregados `AppNotification` y `NotificationRead` al esquema     |
