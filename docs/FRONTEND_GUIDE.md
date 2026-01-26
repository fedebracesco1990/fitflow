# FitFlow Frontend - Guía de Desarrollo

## Tecnologías

- **Framework:** Angular 20 (standalone components)
- **Estado:** NGXS
- **Estilos:** SCSS
- **UI Components:** Componentes propios en `shared/`

---

## Estructura Actual

```
frontend/src/app/
├── app.config.ts          # Configuración de providers
├── app.routes.ts          # Rutas principales con lazy loading
├── app.ts                 # Componente raíz
├── app.html               # Template raíz
├── app.scss               # Estilos globales
├── core/                  # Servicios singleton, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── guest.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── models/
│   │   ├── api-response.model.ts
│   │   ├── auth.model.ts
│   │   ├── dashboard.model.ts
│   │   ├── exercise.model.ts
│   │   ├── low-attendance.model.ts
│   │   ├── membership-type.model.ts
│   │   ├── membership.model.ts
│   │   ├── offline.model.ts
│   │   ├── payment.model.ts
│   │   ├── personal-record.model.ts
│   │   ├── routine.model.ts
│   │   ├── stats.model.ts
│   │   ├── user.model.ts
│   │   ├── websocket.model.ts
│   │   ├── workout.model.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── exercises.service.ts
│   │   ├── membership-types.service.ts
│   │   ├── memberships.service.ts
│   │   ├── muscle-groups.service.ts
│   │   ├── network.service.ts
│   │   ├── offline-db.service.ts
│   │   ├── offline-workouts.service.ts
│   │   ├── page-title.strategy.ts
│   │   ├── payments.service.ts
│   │   ├── personal-records.service.ts
│   │   ├── push-notifications.service.ts
│   │   ├── pwa.service.ts
│   │   ├── routines.service.ts
│   │   ├── stats.service.ts
│   │   ├── storage.service.ts
│   │   ├── sync-manager.service.ts
│   │   ├── sync-queue.service.ts
│   │   ├── token-refresh.service.ts
│   │   ├── user.service.ts
│   │   ├── user-routines.service.ts
│   │   ├── users.service.ts
│   │   ├── websocket.service.ts
│   │   ├── workouts.service.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── auth/
│   │   │   ├── auth.actions.ts
│   │   │   └── auth.state.ts
│   │   ├── notifications/
│   │   │   ├── notifications.actions.ts
│   │   │   └── notifications.state.ts
│   │   ├── personal-records/
│   │   │   ├── personal-records.actions.ts
│   │   │   └── personal-records.state.ts
│   │   ├── user/
│   │   │   ├── user.actions.ts
│   │   │   └── user.state.ts
│   │   └── index.ts
│   └── utils/                 # Utilidades compartidas
├── features/              # Módulos de funcionalidad
│   ├── access/            # Control de acceso QR
│   ├── auth/              # Login, Register, Password Reset
│   ├── dashboard/         # Home con métricas y actividad
│   ├── exercises/         # CRUD Ejercicios
│   ├── membership-types/  # CRUD Tipos de Membresía
│   ├── memberships/       # CRUD Membresías de usuarios
│   ├── my-routines/       # Vista semanal + Workout (Usuario)
│   ├── notifications-admin/ # Panel de notificaciones personalizadas
│   ├── payments/          # CRUD Pagos
│   ├── profile/           # Ver/Editar Perfil
│   ├── progress/          # Mi Progreso (gráficos de evolución)
│   ├── reports/           # Centro de Reportes (exportables)
│   ├── routines/          # CRUD Rutinas (Admin/Trainer)
│   ├── training/          # Gestión de entrenamiento
│   └── users/             # Gestión de usuarios
├── layouts/               # Layouts de página
│   ├── auth-layout/
│   └── main-layout/
└── shared/                # Componentes reutilizables
    ├── charts/            # Gráficos reutilizables (Chart.js)
    ├── components/
    │   ├── alert/
    │   ├── attendance-calendar/
    │   ├── avatar/
    │   ├── badge/
    │   ├── button/
    │   ├── card/
    │   ├── confirm-dialog/
    │   ├── empty-state/
    │   ├── loading-spinner/
    │   ├── notification-bell/
    │   ├── notification-center/
    │   ├── notification-prompt/
    │   ├── offline-banner/
    │   ├── pr-celebration-modal/
    │   ├── pwa-install-prompt/
    │   ├── pwa-update-prompt/
    │   ├── sync-status/
    │   ├── tooltip/
    │   ├── user-selector/
    │   ├── view-toggle/
    │   └── index.ts
    ├── directives/
    ├── pipes/
    ├── utils/
    └── index.ts
```

---

## Flujo de Desarrollo de Features

### Orden de Implementación

```
1. Models     → Interfaces TypeScript
2. Service    → Llamadas HTTP
3. Actions    → Eventos del store
4. State      → Estado y handlers
5. Components → UI (pages y components)
6. Routes     → Navegación
7. Tests      → Unitarios y e2e
```

### Checklist

```markdown
## Feature: [Nombre]

- [ ] **Models**

  - [ ] Crear interfaces en `core/models/`
  - [ ] Exportar en `core/models/index.ts`
  - [ ] Request DTOs
  - [ ] Response interfaces

- [ ] **Service**

  - [ ] Crear service en `core/services/`
  - [ ] Implementar métodos HTTP
  - [ ] Exportar en `core/services/index.ts`

- [ ] **Store (si aplica)**

  - [ ] Crear actions en `core/store/[feature]/`
  - [ ] Crear state con selectors y handlers
  - [ ] Registrar state en `app.config.ts`
  - [ ] Exportar en `core/store/index.ts`

- [ ] **Feature Module**

  - [ ] Crear carpeta en `features/[feature]/`
  - [ ] Crear pages (smart components)
  - [ ] Crear components (presentational)
  - [ ] Crear routes file

- [ ] **Routing**

  - [ ] Agregar rutas en feature routes
  - [ ] Agregar lazy load en app.routes.ts
  - [ ] Aplicar guards necesarios
  - [ ] Agregar títulos de página

- [ ] **UI/UX**
  - [ ] Separar template (.html) y estilos (.scss)
  - [ ] Estados de loading
  - [ ] Manejo de errores
  - [ ] Mensajes de éxito
  - [ ] Responsive design
```

---

## Patrones de Código

### Componentes - Patrón de Bindings

**Regla:** Usar getters para datos derivados, métodos solo para eventos.

```typescript
// ✅ CORRECTO
@Component({...})
export class MyComponent {
  // Signals del store
  readonly isLoading = this.store.selectSignal(MyState.isLoading);

  // Getters para validaciones de forms (reactive forms no son signals)
  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.isLoading() || this.form.invalid;
  }

  // Métodos solo para eventos
  onSubmit(): void {
    // ...
  }
}
```

```html
<!-- Template -->
<input [class.error]="emailInvalid" />
<button [disabled]="isSubmitDisabled" (click)="onSubmit()">
  @if (isLoading()) { Cargando... }
</button>
```

| Tipo                      | En TS            | En HTML                       |
| ------------------------- | ---------------- | ----------------------------- |
| **Signals del store**     | `selectSignal()` | `property()` (con paréntesis) |
| **Validaciones de forms** | `get property()` | `property` (sin paréntesis)   |
| **Eventos**               | `method()`       | `(click)="method()"`          |

### Shared Components - Patrón de Getters

```typescript
// shared/components/button/button.component.ts
@Component({
  selector: 'fit-flow-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  // Inputs
  variant = input<'primary' | 'secondary' | 'outline'>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  // Getters para template (sin paréntesis en HTML)
  protected get btnClass(): Record<string, boolean> {
    return {
      [`btn--${this.variant()}`]: true,
      'btn--loading': this.loading(),
    };
  }

  protected get isDisabled(): boolean {
    return this.disabled() || this.loading();
  }
}
```

```html
<!-- button.component.html -->
<button [ngClass]="btnClass" [disabled]="isDisabled">
  <ng-content />
</button>
```

---

## Plantillas de Código

### Model

```typescript
// core/models/feature.model.ts
export interface Feature {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  name: string;
  description?: string;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
}
```

### Service

```typescript
// core/services/feature.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/features';

  getAll(): Observable<Feature[]> {
    return this.api.get<Feature[]>(this.basePath);
  }

  getById(id: string): Observable<Feature> {
    return this.api.get<Feature>(`${this.basePath}/${id}`);
  }

  create(data: CreateFeatureRequest): Observable<Feature> {
    return this.api.post<Feature>(this.basePath, data);
  }

  update(id: string, data: UpdateFeatureRequest): Observable<Feature> {
    return this.api.put<Feature>(`${this.basePath}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
```

### Store Actions

```typescript
// core/store/feature/feature.actions.ts
import { Feature, CreateFeatureRequest, UpdateFeatureRequest } from '../../models';

// Load
export class LoadFeatures {
  static readonly type = '[Feature] Load All';
}

export class LoadFeaturesSuccess {
  static readonly type = '[Feature] Load All Success';
  constructor(public payload: Feature[]) {}
}

export class LoadFeaturesFailure {
  static readonly type = '[Feature] Load All Failure';
  constructor(public payload: { error: string }) {}
}

// Create
export class CreateFeature {
  static readonly type = '[Feature] Create';
  constructor(public payload: CreateFeatureRequest) {}
}

export class CreateFeatureSuccess {
  static readonly type = '[Feature] Create Success';
  constructor(public payload: Feature) {}
}

export class CreateFeatureFailure {
  static readonly type = '[Feature] Create Failure';
  constructor(public payload: { error: string }) {}
}

// Update, Delete... (mismo patrón)

// Utils
export class ClearFeatureError {
  static readonly type = '[Feature] Clear Error';
}

export class ClearFeatureSuccess {
  static readonly type = '[Feature] Clear Success';
}
```

### Store State

```typescript
// core/store/feature/feature.state.ts
import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FeatureService } from '../../services/feature.service';
import { Feature } from '../../models';
import { LoadFeatures, LoadFeaturesSuccess, LoadFeaturesFailure } from './feature.actions';

export interface FeatureStateModel {
  items: Feature[];
  selectedItem: Feature | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const defaults: FeatureStateModel = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

@State<FeatureStateModel>({
  name: 'feature',
  defaults,
})
@Injectable()
export class FeatureState {
  private readonly featureService = inject(FeatureService);

  // Selectors
  @Selector()
  static items(state: FeatureStateModel): Feature[] {
    return state.items;
  }

  @Selector()
  static isLoading(state: FeatureStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static error(state: FeatureStateModel): string | null {
    return state.error;
  }

  // Actions
  @Action(LoadFeatures)
  loadFeatures(ctx: StateContext<FeatureStateModel>) {
    ctx.patchState({ isLoading: true, error: null });

    return this.featureService.getAll().pipe(
      tap((items) => ctx.dispatch(new LoadFeaturesSuccess(items))),
      catchError((error) => {
        ctx.dispatch(new LoadFeaturesFailure({ error: this.extractError(error) }));
        return of(null);
      })
    );
  }

  @Action(LoadFeaturesSuccess)
  loadFeaturesSuccess(ctx: StateContext<FeatureStateModel>, action: LoadFeaturesSuccess) {
    ctx.patchState({ items: action.payload, isLoading: false });
  }

  @Action(LoadFeaturesFailure)
  loadFeaturesFailure(ctx: StateContext<FeatureStateModel>, action: LoadFeaturesFailure) {
    ctx.patchState({ isLoading: false, error: action.payload.error });
  }

  private extractError(error: unknown): string {
    if (error && typeof error === 'object' && 'friendlyMessage' in error) {
      return (error as { friendlyMessage: string }).friendlyMessage;
    }
    return 'Ha ocurrido un error inesperado';
  }
}
```

### Routes

```typescript
// features/[feature]/[feature].routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Features',
        loadComponent: () =>
          import('./pages/feature-list/feature-list.component').then((m) => m.FeatureListComponent),
      },
      {
        path: 'new',
        title: 'Nuevo Feature',
        loadComponent: () =>
          import('./pages/feature-form/feature-form.component').then((m) => m.FeatureFormComponent),
      },
      {
        path: ':id',
        title: 'Detalle Feature',
        loadComponent: () =>
          import('./pages/feature-detail/feature-detail.component').then(
            (m) => m.FeatureDetailComponent
          ),
      },
    ],
  },
];
```

### Page Component

```typescript
// features/[feature]/pages/feature-list/feature-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { FeatureState, LoadFeatures } from '../../../../core/store';
import { LoadingSpinnerComponent, CardComponent, EmptyStateComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-feature-list',
  standalone: true,
  imports: [LoadingSpinnerComponent, CardComponent, EmptyStateComponent],
  templateUrl: './feature-list.component.html',
  styleUrl: './feature-list.component.scss',
})
export class FeatureListComponent implements OnInit {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(FeatureState.items);
  readonly isLoading = this.store.selectSignal(FeatureState.isLoading);
  readonly error = this.store.selectSignal(FeatureState.error);

  ngOnInit(): void {
    this.store.dispatch(new LoadFeatures());
  }
}
```

---

## Shared Components Disponibles

### Componentes Base

| Componente                | Selector                     | Descripción                             |
| ------------------------- | ---------------------------- | --------------------------------------- |
| `AlertComponent`          | `<fit-flow-alert>`           | Mensajes de error, éxito, warning, info |
| `AvatarComponent`         | `<fit-flow-avatar>`          | Avatar con imagen o iniciales           |
| `BadgeComponent`          | `<fit-flow-badge>`           | Etiquetas de estado                     |
| `ButtonComponent`         | `<fit-flow-button>`          | Botón con variantes y loading           |
| `CardComponent`           | `<fit-flow-card>`            | Contenedor con padding y shadow         |
| `ConfirmDialogComponent`  | `<fit-flow-confirm-dialog>`  | Diálogo de confirmación modal           |
| `EmptyStateComponent`     | `<fit-flow-empty-state>`     | Estado vacío con icono y mensaje        |
| `LoadingSpinnerComponent` | `<fit-flow-loading-spinner>` | Spinner de carga                        |
| `TooltipComponent`        | `<fit-flow-tooltip>`         | Tooltips informativos                   |
| `UserSelectorComponent`   | `<fit-flow-user-selector>`   | Selector de usuarios                    |
| `ViewToggleComponent`     | `<fit-flow-view-toggle>`     | Toggle para cambiar vistas              |

### Componentes de Notificaciones

| Componente                    | Selector                         | Descripción                             |
| ----------------------------- | -------------------------------- | --------------------------------------- |
| `NotificationBellComponent`   | `<fit-flow-notification-bell>`   | Campana con contador de notificaciones  |
| `NotificationCenterComponent` | `<fit-flow-notification-center>` | Centro de notificaciones                |
| `NotificationPromptComponent` | `<fit-flow-notification-prompt>` | Prompt para activar notificaciones push |

### Componentes PWA y Offline

| Componente                  | Selector                        | Descripción                           |
| --------------------------- | ------------------------------- | ------------------------------------- |
| `OfflineBannerComponent`    | `<fit-flow-offline-banner>`     | Banner indicador de modo offline      |
| `SyncStatusComponent`       | `<fit-flow-sync-status>`        | Estado de sincronización con contador |
| `PwaInstallPromptComponent` | `<fit-flow-pwa-install-prompt>` | Prompt para instalar PWA              |
| `PwaUpdatePromptComponent`  | `<fit-flow-pwa-update-prompt>`  | Prompt para actualizar PWA            |

### Componentes Especializados

| Componente                    | Selector                          | Descripción                             |
| ----------------------------- | --------------------------------- | --------------------------------------- |
| `AttendanceCalendarComponent` | `<fit-flow-attendance-calendar>`  | Calendario de asistencia                |
| `PrCelebrationModalComponent` | `<fit-flow-pr-celebration-modal>` | Modal de celebración de Personal Record |

### Uso de Shared Components

```typescript
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  imports: [AlertComponent, ButtonComponent, CardComponent],
  // ...
})
```

```html
<fit-flow-alert type="error" [message]="error()!" />

<fit-flow-button type="submit" [loading]="isLoading()" [disabled]="isSubmitDisabled">
  Guardar
</fit-flow-button>

<fit-flow-card padding="lg">
  <h2>Título</h2>
  <p>Contenido</p>
</fit-flow-card>

<!-- Diálogo de confirmación -->
<fit-flow-confirm-dialog
  [isOpen]="showDeleteDialog()"
  title="Eliminar Item"
  [message]="'¿Estás seguro de eliminar ' + (selectedItem()?.name || '') + '?'"
  confirmText="Eliminar"
  variant="danger"
  (confirmed)="confirmDelete()"
  (cancelled)="closeDeleteDialog()"
></fit-flow-confirm-dialog>
```

### ConfirmDialogComponent

Componente reutilizable para confirmaciones de acciones destructivas.

**Inputs:**
| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controla visibilidad del diálogo |
| `title` | `string` | `'Confirmar acción'` | Título del diálogo |
| `message` | `string` | `'¿Estás seguro...?'` | Mensaje de confirmación |
| `confirmText` | `string` | `'Confirmar'` | Texto del botón confirmar |
| `cancelText` | `string` | `'Cancelar'` | Texto del botón cancelar |
| `variant` | `'danger' \| 'warning' \| 'primary'` | `'danger'` | Estilo del botón confirmar |

**Outputs:**
| Output | Descripción |
|--------|-------------|
| `confirmed` | Emite cuando el usuario confirma |
| `cancelled` | Emite cuando el usuario cancela o presiona ESC |

**Ejemplo de uso en componente:**

```typescript
// Estado del diálogo
showDeleteDialog = signal(false);
selectedItem = signal<Item | null>(null);

openDeleteDialog(item: Item): void {
  this.selectedItem.set(item);
  this.showDeleteDialog.set(true);
}

closeDeleteDialog(): void {
  this.showDeleteDialog.set(false);
  this.selectedItem.set(null);
}

confirmDelete(): void {
  const item = this.selectedItem();
  if (!item) return;

  this.service.delete(item.id).subscribe({
    next: () => {
      this.items.update((list) => list.filter((i) => i.id !== item.id));
      this.closeDeleteDialog();
    },
    error: (err) => {
      this.error.set(err.error?.message || 'Error al eliminar');
      this.closeDeleteDialog();
    },
  });
}
```

---

## Convenciones de Nombres

| Tipo      | Convención             | Ejemplo                           |
| --------- | ---------------------- | --------------------------------- |
| Interface | PascalCase             | `Workout`, `CreateWorkoutRequest` |
| Service   | PascalCase + Service   | `WorkoutService`                  |
| Component | PascalCase + Component | `WorkoutListComponent`            |
| State     | PascalCase + State     | `WorkoutState`                    |
| Action    | PascalCase             | `LoadWorkouts`, `CreateWorkout`   |
| Selector  | camelCase              | `WorkoutState.items`              |
| Archivo   | kebab-case             | `workout.service.ts`              |
| Carpeta   | kebab-case             | `workout-list/`                   |

---

## Comandos Útiles

```bash
# Generar componente
ng g c features/[feature]/pages/[page-name] --standalone

# Generar servicio
ng g s core/services/[service-name]

# Build y verificar
npm run build
npm run lint

# Desarrollo
npm run dev

# Producción (simular Railway)
npm run build && npm start
```

---

## Path Aliases Disponibles

Los siguientes aliases están configurados en `tsconfig.json`:

| Alias         | Ruta Real            |
| ------------- | -------------------- |
| `@core/*`     | `src/app/core/*`     |
| `@shared/*`   | `src/app/shared/*`   |
| `@features/*` | `src/app/features/*` |
| `@layouts/*`  | `src/app/layouts/*`  |
| `@env/*`      | `src/environments/*` |

### Ejemplo de Uso

```typescript
// Antes (imports relativos largos)
import { AuthService } from '../../../../core/services';
import { ButtonComponent } from '../../../../shared';

// Ahora (con aliases)
import { AuthService } from '@core/services';
import { ButtonComponent } from '@shared/components';
```

---

## Mejoras Pendientes

### 🟢 Prioridad Baja

1. **Subdividir features grandes** - Cuando dashboard crezca, agregar `components/` específicos
2. **Migrar imports existentes** - Actualizar imports relativos a usar los nuevos aliases

---

## Notas Importantes

1. **Usar el store para estado compartido** - No para datos locales de un componente
2. **Separar archivos HTML/SCSS** - Mejor mantenibilidad
3. **Agregar títulos a las rutas** - Para el PageTitleStrategy
4. **Exportar en index.ts** - Mantener imports limpios
5. **Manejar loading y errores** - En todos los componentes con llamadas async
6. **Usar getters para forms** - Los `computed()` no funcionan con Reactive Forms
7. **Signals para store** - Usar `selectSignal()` y llamar con `()` en templates
