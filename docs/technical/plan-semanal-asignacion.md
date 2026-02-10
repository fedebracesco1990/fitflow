# Plan Semanal - Asignación y Reasignación

## Descripción

Sistema que permite a administradores y entrenadores asignar planes semanales a usuarios, incluyendo reasignación con confirmación, notificaciones automáticas, y vista de historial de planes.

## Arquitectura

### Backend

#### Entidades

- **Program** → Template del plan semanal
  - `ProgramRoutine` → Rutinas del programa (referencia a `Routine`)
  - `ProgramRoutineExercise` → Ejercicios personalizados por rutina
- **UserProgram** → Plan asignado a un usuario (copia independiente)
  - `UserProgramRoutine` → Rutinas copiadas al usuario
  - `UserProgramExercise` → Ejercicios copiados al usuario

#### Flujo de Asignación

```
POST /programs/assign { programId, userId }
    │
    ├─ 1. Busca programa con rutinas y ejercicios (findOne)
    ├─ 2. Desactiva planes activos del usuario (isActive → false, endDate → now)
    ├─ 3. Crea UserProgram con isActive: true
    ├─ 4. Copia rutinas → UserProgramRoutine
    ├─ 5. Copia ejercicios → UserProgramExercise
    ├─ 6. Envía notificación (NotificationsService.sendToUser)
    └─ 7. Retorna UserProgram completo
```

#### Servicios Involucrados

- **ProgramsService** — Gestión de programas, asignación, historial
- **NotificationsService** — Notificación push/websocket al asignar

### Frontend

#### Componentes

- **AssignRoutineDialogComponent** (`features/routines/components/assign-routine-dialog/`)
  - Carga usuarios con rol USER
  - Consulta plan activo de cada usuario vía `forkJoin`
  - Muestra badge amarillo con nombre del plan activo
  - Modal de confirmación antes de reemplazar plan existente
- **UserProgramHistoryComponent** (`features/users/components/user-program-history/`)
  - Vista expandible de planes activos e históricos
  - Integrado en la vista de detalle de usuario

#### Servicios

- **UserProgramsService** (`core/services/user-programs.service.ts`)
  - `assign(data)` → `POST /programs/assign`
  - `getActiveByUser(userId)` → `GET /programs/user/:userId/active`
  - `getUserProgramHistory(userId)` → `GET /programs/user/:userId/history`

## API Endpoints

| Método | Ruta                             | Descripción                                 |
| ------ | -------------------------------- | ------------------------------------------- |
| `POST` | `/programs/assign`               | Asignar programa (reasigna si ya tiene uno) |
| `GET`  | `/programs/user/:userId/active`  | Plan activo de un usuario                   |
| `GET`  | `/programs/user/:userId/history` | Historial completo de planes                |

## Flujo de Datos

### Asignación desde UI

```
Admin/Trainer abre diálogo de asignación
    │
    ├─ Carga usuarios (UsersService.getAll)
    ├─ Carga plan activo por usuario (forkJoin → getActiveByUser)
    │
    ├─ Usuario selecciona usuarios y confirma
    │   │
    │   ├─ Si hay usuarios con plan activo:
    │   │   └─ Muestra modal de confirmación de reemplazo
    │   │       ├─ Confirma → executeAssignment()
    │   │       └─ Cancela → vuelve al diálogo
    │   │
    │   └─ Si no hay planes activos:
    │       └─ executeAssignment() directo
    │
    └─ assignWeeklyProgram() → POST /programs/assign por cada usuario
        └─ Backend desactiva plan anterior + crea nuevo + notifica
```

## Consideraciones de Performance

- `getActiveByUser()` usa query simple con `findOne` (índice en `userId` + `isActive`)
- `getUserProgramHistory()` carga todas las relaciones anidadas — aceptable para volúmenes actuales
- `loadActivePrograms()` en el diálogo usa `forkJoin` para paralelizar requests por usuario

## Notas de Desarrollo

- La reasignación es atómica: desactiva plan anterior y crea nuevo en la misma transacción implícita de TypeORM
- Los datos del historial son los datos **base** tal como fueron asignados, antes de cualquier ejecución del usuario
- La notificación usa el tipo `program_assigned` para identificación
