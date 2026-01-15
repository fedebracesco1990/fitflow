# Sistema de Sincronización Offline - Documentación Técnica

## Descripción

El sistema de sincronización offline permite a los usuarios de FitFlow completar entrenamientos sin conexión a internet. Los datos se almacenan localmente en IndexedDB y se sincronizan automáticamente cuando se recupera la conexión.

## Arquitectura

### Componentes Principales

```
core/
├── models/
│   └── offline.model.ts       # Tipos e interfaces
├── services/
│   ├── offline-db.service.ts      # Wrapper Dexie/IndexedDB
│   ├── sync-queue.service.ts      # Cola de operaciones
│   ├── sync-manager.service.ts    # Orquestador de sync
│   └── offline-workouts.service.ts # API offline-first
shared/
└── components/
    ├── offline-banner/        # Banner "Sin conexión"
    └── sync-status/           # Indicador de estado
```

### Dependencias

- **Dexie.js** (^4.x) - Wrapper de IndexedDB con API Promise

## API de Servicios

### OfflineDbService

Wrapper de bajo nivel para operaciones IndexedDB.

```typescript
// Tablas disponibles
interface FitFlowDatabase {
  syncQueue: Table<SyncOperation>;
  cachedRoutines: Table<CachedRoutine>;
  cachedUserRoutines: Table<CachedUserRoutine>;
  cachedWorkouts: Table<CachedWorkout>;
  cachedExerciseLogs: Table<CachedExerciseLog>;
  idMappings: Table<IdMapping>;
}

// Métodos principales
class OfflineDbService {
  // Sync Queue
  addToSyncQueue(operation: SyncOperation): Promise<void>;
  getSyncQueue(): Promise<SyncOperation[]>;
  updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void>;
  
  // Cached Workouts
  cacheWorkout(workout: CachedWorkout): Promise<void>;
  getCachedWorkout(id: string): Promise<CachedWorkout | undefined>;
  
  // ID Mappings
  addIdMapping(mapping: IdMapping): Promise<void>;
  getServerIdByTempId(tempId: string): Promise<string | undefined>;
}
```

### SyncQueueService

Gestiona la cola FIFO de operaciones pendientes.

```typescript
class SyncQueueService {
  // Signals reactivos
  readonly pendingCount: Signal<number>;
  readonly syncStatus: Signal<SyncStatus>;
  readonly hasPendingOperations: Signal<boolean>;
  
  // Métodos
  enqueue(type, endpoint, method, payload, tempId?): Promise<string>;
  peek(): Promise<SyncOperation | undefined>;
  dequeue(): Promise<SyncOperation | undefined>;
  markAsCompleted(id: string, serverId?: string): Promise<void>;
  markAsFailed(id: string, error: string): Promise<void>;
}
```

### SyncManagerService

Orquesta la sincronización automática.

```typescript
class SyncManagerService {
  // Signals
  readonly isSyncing: Signal<boolean>;
  readonly lastSyncAt: Signal<number | null>;
  
  // Métodos
  processQueue(): Promise<void>;      // Procesa toda la cola
  forcSync(): Promise<void>;          // Fuerza sincronización
  resolveId(tempId: string): Promise<string>; // Resuelve ID temporal
}
```

### OfflineWorkoutsService

API de alto nivel para operaciones offline-first.

```typescript
class OfflineWorkoutsService {
  // Mismo API que WorkoutsService, pero offline-first
  create(data: CreateWorkoutDto): Observable<WorkoutLog>;
  start(id: string): Observable<WorkoutLog>;
  complete(id: string, duration?: number): Observable<WorkoutLog>;
  getById(id: string): Observable<WorkoutLog>;
  logExercise(workoutId: string, data: LogExerciseDto): Observable<ExerciseLog>;
  updateExerciseLog(workoutId, logId, data): Observable<UpdateExerciseLogResponse>;
  deleteExerciseLog(workoutId: string, logId: string): Observable<void>;
}
```

## Modelos de Datos

### SyncOperation

```typescript
interface SyncOperation {
  id: string;                           // ID único de la operación
  type: SyncOperationType;              // Tipo de operación
  endpoint: string;                     // Endpoint API
  method: 'POST' | 'PATCH' | 'DELETE';  // Método HTTP
  payload: unknown;                     // Datos a enviar
  timestamp: number;                    // Timestamp de creación
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;                   // Intentos realizados
  tempId?: string;                      // ID temporal (si aplica)
  serverId?: string;                    // ID del servidor (post-sync)
  error?: string;                       // Mensaje de error
}
```

### SyncStatus

```typescript
enum SyncStatus {
  IDLE = 'idle',         // Sin operaciones pendientes
  SYNCING = 'syncing',   // Sincronizando
  SYNCED = 'synced',     // Recién sincronizado
  PENDING = 'pending',   // Hay operaciones pendientes
  ERROR = 'error',       // Error en sincronización
}
```

## Flujo de Datos

### 1. Operación Online

```
Usuario → OfflineWorkoutsService → WorkoutsService → API
                ↓
         Cache local (opcional)
```

### 2. Operación Offline

```
Usuario → OfflineWorkoutsService → IndexedDB (cache)
                ↓
         SyncQueueService (encolar)
                ↓
         Respuesta inmediata con datos locales
```

### 3. Sincronización

```
NetworkService detecta conexión
        ↓
SyncManagerService.processQueue()
        ↓
Para cada operación:
  1. Marcar como "processing"
  2. Ejecutar request HTTP
  3. Si éxito: guardar mapping ID, marcar "completed"
  4. Si error: incrementar retry, marcar "failed" si max
```

## Configuración

### Constantes

```typescript
export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas
export const MAX_RETRY_COUNT = 3;                    // Máx reintentos
export const RETRY_DELAY_MS = 1000;                  // Delay base
```

## Componentes UI

### OfflineBannerComponent

Muestra un banner amarillo cuando el usuario está offline.

```html
<fit-flow-offline-banner />
```

### SyncStatusComponent

Indicador de estado de sincronización en el header.

```html
<fit-flow-sync-status />
```

Estados visuales:
- **Idle**: Icono de nube
- **Pending**: Icono de reloj con badge de contador
- **Syncing**: Icono girando
- **Synced**: Check verde (temporal)
- **Error**: Icono de alerta rojo

## Integración

### Usar en componentes existentes

Para habilitar offline en un componente:

```typescript
// Antes (solo online)
private readonly workoutsService = inject(WorkoutsService);

// Después (offline-first)
private readonly workoutsService = inject(OfflineWorkoutsService);
```

### Verificar estado de red

```typescript
private readonly networkService = inject(NetworkService);

// Signal reactivo
isOnline = this.networkService.isOnline;
isOffline = this.networkService.isOffline;

// Observable
this.networkService.isOnline$.subscribe(online => {
  console.log('Online:', online);
});
```

## Limitaciones Conocidas

1. **Solo workouts**: Actualmente solo las operaciones de workout están habilitadas para offline
2. **Sin merge automático**: Conflictos se resuelven con last-write-wins
3. **Tamaño de cache**: Sin límite explícito, depende del navegador
4. **IDs temporales**: Visibles en UI hasta sincronización

## Mejoras Futuras

- [ ] Cache de rutinas para visualización offline
- [ ] Merge inteligente de conflictos
- [ ] Límite de tamaño de cache con LRU
- [ ] Background sync con Service Worker
- [ ] Notificación push post-sync
