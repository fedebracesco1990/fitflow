# Constructor Visual de Rutinas - Documentación Técnica

## Descripción General

El Constructor Visual de Rutinas es una funcionalidad que permite a entrenadores y administradores crear rutinas de ejercicios mediante una interfaz de drag & drop, organizando ejercicios por día de la semana.

## Arquitectura

```
RoutineBuilderComponent (Página principal)
├── Sidebar
│   ├── Formulario de rutina (nombre, descripción, dificultad)
│   └── ExercisePanelComponent (biblioteca de ejercicios)
│       ├── Barra de búsqueda
│       ├── Filtro por grupo muscular
│       └── Lista de ejercicios arrastrables
└── WeekBuilder
    └── DayColumnComponent × 7 (drop zones)
        └── RoutineExerciseItemComponent × N
            └── Configuración (series, reps, peso, descanso)
```

## Componentes

### RoutineBuilderComponent
**Ubicación:** `frontend/src/app/features/routines/pages/builder/`

Componente principal que orquesta el constructor visual.

**Responsabilidades:**
- Gestión del estado de la rutina
- Sincronización con el backend
- Coordinación entre panel de ejercicios y días de la semana

**Signals principales:**
- `routineName`, `routineDescription`, `routineDifficulty` - Datos de la rutina
- `dayExercises` - Mapa de ejercicios por día (DayExercisesMap)
- `loading`, `saving`, `error` - Estados de UI

### ExercisePanelComponent
**Ubicación:** `frontend/src/app/features/routines/components/exercise-panel/`

Panel lateral con la biblioteca de ejercicios arrastrables.

**Características:**
- Búsqueda con debounce (300ms)
- Filtro por grupo muscular
- Ejercicios como drag sources (CDK Drag)

### DayColumnComponent
**Ubicación:** `frontend/src/app/features/routines/components/day-column/`

Columna representando un día de la semana.

**Características:**
- Drop zone para ejercicios (CDK DropList)
- Reordenamiento interno de ejercicios
- Transferencia entre días
- Conexión con todas las demás columnas

**Interface DayExercise:**
```typescript
interface DayExercise {
  id?: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  suggestedWeight: number | null;
  isNew?: boolean;
}
```

### RoutineExerciseItemComponent
**Ubicación:** `frontend/src/app/features/routines/components/routine-exercise-item/`

Item de ejercicio dentro de un día con configuración editable.

**Inputs configurables:**
- Series (1-10)
- Repeticiones (1-100)
- Peso sugerido (0-500 kg)
- Descanso (0-300 segundos)

## Modelo de Datos

### Backend: RoutineExercise Entity

```typescript
@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  routineId: string;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'int', default: 3 })
  sets: number;

  @Column({ type: 'int', default: 12 })
  reps: number;

  @Column({ type: 'int', default: 60 })
  restSeconds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  suggestedWeight: number | null;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: true })
  dayOfWeek: DayOfWeek | null;  // NUEVO
}
```

### Frontend: Interfaces

```typescript
// routine.model.ts
interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
  suggestedWeight: number | null;
  dayOfWeek: DayOfWeek | null;  // NUEVO
}

interface AddExerciseDto {
  exerciseId: string;
  order?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  suggestedWeight?: number;
  dayOfWeek?: DayOfWeek;  // NUEVO
}
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/routines/:id` | Obtener rutina con ejercicios |
| POST | `/routines` | Crear nueva rutina |
| PATCH | `/routines/:id` | Actualizar rutina |
| POST | `/routines/:id/exercises` | Agregar ejercicio a rutina |
| PATCH | `/routines/:id/exercises/:exerciseId` | Actualizar ejercicio |
| DELETE | `/routines/:id/exercises/:exerciseId` | Eliminar ejercicio |

### Ejemplo: Agregar ejercicio con día

```json
POST /routines/abc-123/exercises
{
  "exerciseId": "exercise-uuid",
  "order": 1,
  "sets": 4,
  "reps": 10,
  "restSeconds": 90,
  "suggestedWeight": 20,
  "dayOfWeek": "monday"
}
```

## Rutas Frontend

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/routines/builder` | RoutineBuilderComponent | Crear nueva rutina |
| `/routines/:id/builder` | RoutineBuilderComponent | Editar rutina existente |

## Dependencias

- `@angular/cdk@19` - Angular CDK para drag & drop
- `angular-draggable-droppable` - Dependencia de angular-calendar
- `angular-resizable-element` - Dependencia de angular-calendar

## Flujo de Datos

```
1. Usuario arrastra ejercicio del panel
   └── CdkDrag emite evento

2. Usuario suelta en columna de día
   └── CdkDropList.dropped emite CdkDragDrop
   
3. DayColumnComponent procesa el drop
   ├── Si viene del panel: crea DayExercise nuevo
   └── Si viene de otro día: transfiere el item
   
4. RoutineBuilderComponent actualiza dayExercises signal

5. Usuario hace click en "Guardar"
   └── syncExercises() sincroniza con backend
       ├── Elimina ejercicios existentes
       └── Crea ejercicios nuevos con dayOfWeek
```

## Consideraciones de Performance

- **Debounce en búsqueda:** 300ms para evitar llamadas excesivas
- **Signals:** Uso de Angular Signals para reactividad eficiente
- **Lazy loading:** El módulo builder se carga bajo demanda

## Futuras Mejoras

1. **RoutinePreviewComponent** - Vista previa de la rutina completa
2. **Duplicar ejercicios** - Copiar ejercicio a otro día
3. **Templates** - Rutinas predefinidas como punto de partida
4. **Undo/Redo** - Historial de cambios
