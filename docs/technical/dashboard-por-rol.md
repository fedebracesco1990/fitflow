# Dashboard Principal por Rol - Documentación Técnica

## Resumen

Implementación de dashboards personalizados por rol (Admin, Entrenador, Socio) usando arquitectura widget-based con componentes modulares reutilizables.

## Arquitectura

```
HomeComponent (Orquestador)
├── AdminDashboardComponent (rol: admin)
│   ├── StatCardWidget (6 KPIs)
│   ├── ActivityLiveComponent
│   ├── RecentPaymentsComponent
│   └── QuickActionsWidget
├── TrainerDashboardComponent (rol: trainer)
│   ├── StatCardWidget (4 KPIs)
│   ├── StudentsListWidget
│   ├── ActivityLiveComponent
│   └── QuickActionsWidget
└── UserDashboardComponent (rol: user)
    ├── StatCardWidget (4 KPIs)
    ├── MembershipCard
    ├── TodayRoutineCard
    └── QuickActionsWidget
```

## Flujo de Datos

### Admin y Trainer

```typescript
// HomeComponent
ngOnInit() {
  if (this.isAdmin() || this.isTrainer()) {
    this.dashboardService.getUnifiedDashboard().subscribe(data => {
      if (isAdminDashboard(data)) this.adminData.set(data);
      if (isTrainerDashboard(data)) this.trainerData.set(data);
    });
  }
}
```

**API Endpoint:** `GET /dashboard` (FITFLOW-61)
- Retorna `AdminDashboardDto | TrainerDashboardDto` según rol del token JWT

### User (Socio)

```typescript
// UserDashboardComponent - Composición de múltiples servicios
forkJoin({
  todayRoutine: this.userRoutinesService.getToday(),
  monthlyStats: this.statsService.getMyMonthlyComparison(),
}).subscribe(({ todayRoutine, monthlyStats }) => {
  // Combina datos de múltiples APIs
});
```

**APIs utilizadas:**
- `GET /user-routines/today` - Rutina del día
- `GET /stats/me/monthly` - Estadísticas mensuales

## Componentes

### Widgets (`features/dashboard/widgets/`)

| Widget | Props | Descripción |
|--------|-------|-------------|
| `stat-card` | `title`, `value`, `label`, `icon`, `variant` | Card KPI con variantes de color |
| `quick-actions` | `actions[]` | Grid de botones de navegación rápida |
| `students-list` | `students[]` | Lista de alumnos del trainer |

### Dashboard Components (`features/dashboard/components/`)

| Componente | Rol | Datos |
|------------|-----|-------|
| `AdminDashboardComponent` | ADMIN | `AdminDashboard` desde API unificada |
| `TrainerDashboardComponent` | TRAINER | `TrainerDashboard` desde API unificada |
| `UserDashboardComponent` | USER | Composición de stats + routines + profile |

## Interfaces TypeScript

```typescript
// core/models/dashboard.model.ts

interface AdminDashboard {
  role: 'admin';
  ingresosMes: number;
  ingresosHoy: number;
  morosos: number;
  proyeccionMes: number;
  asistenciasHoy: number;
  miembrosActivos: number;
  expiranPronto: number;
  rutinasActivas: number;
  prsDelMes: number;
  ingresosMensuales: MonthlyRevenue[];
  distribucionMetodosPago: PaymentMethodDistribution[];
}

interface TrainerDashboard {
  role: 'trainer';
  totalAlumnos: number;
  alumnosActivos: number;
  rutinasActivasCreadas: number;
  prsAlumnosMes: number;
  alumnosRecientes: TrainerStudentSummary[];
}

type UnifiedDashboard = AdminDashboard | TrainerDashboard;

// Type guards
function isAdminDashboard(data: UnifiedDashboard): data is AdminDashboard;
function isTrainerDashboard(data: UnifiedDashboard): data is TrainerDashboard;
```

## Estructura de Archivos

```
frontend/src/app/features/dashboard/
├── components/
│   ├── admin-dashboard/
│   │   ├── admin-dashboard.component.ts
│   │   ├── admin-dashboard.component.html
│   │   └── admin-dashboard.component.scss
│   ├── trainer-dashboard/
│   │   └── ... (3 files)
│   ├── user-dashboard/
│   │   └── ... (3 files)
│   ├── activity-live/        # Existente
│   └── recent-payments/      # Existente
├── widgets/
│   ├── stat-card/
│   │   └── ... (3 files)
│   ├── quick-actions/
│   │   └── ... (3 files)
│   └── students-list/
│       └── ... (3 files)
└── pages/
    └── home/
        ├── home.component.ts   # Orquestador simplificado
        ├── home.component.html # 37 líneas (antes 307)
        └── home.component.scss # 29 líneas (antes 244)
```

## KPIs por Rol

### Admin Dashboard

| KPI | Fuente | Variante |
|-----|--------|----------|
| Miembros Activos | `miembrosActivos` | default |
| Expiran Pronto | `expiranPronto` | warning |
| Morosos | `morosos` | danger |
| Ingresos del Mes | `ingresosMes` | success |
| Asistencias Hoy | `asistenciasHoy` | default |
| Rutinas Activas | `rutinasActivas` | default |

### Trainer Dashboard

| KPI | Fuente | Variante |
|-----|--------|----------|
| Total Alumnos | `totalAlumnos` | default |
| Alumnos Activos | `alumnosActivos` | success |
| Mis Rutinas | `rutinasActivasCreadas` | default |
| PRs del Mes | `prsAlumnosMes` | warning |

### User Dashboard

| KPI | Fuente | Variante |
|-----|--------|----------|
| Entrenamientos | `monthlyStats.currentMonth.totalWorkouts` | default |
| Volumen Total | `monthlyStats.currentMonth.totalVolume` | success |
| Ejercicios | `monthlyStats.currentMonth.uniqueExercises` | default |
| Récords | `monthlyStats.currentMonth.personalRecords` | warning |

## Quick Actions por Rol

### Admin
- Directorio de Usuarios → `/memberships`
- Nuevo Miembro → `/memberships/new`
- Nuevo Pago → `/payments/new`
- Check-in → `/access/scan`

### Trainer
- Crear Rutina → `/routines/new`
- Ver Clientes → `/training`
- Biblioteca Ejercicios → `/exercises`
- Check-in → `/access/scan`

### User
- Mi Rutina de Hoy → `/my-routines/today`
- Mi Semana → `/my-routines`
- Mi Progreso → `/my-progress`
- Mi QR → `/profile/qr`

## Dependencias

- FITFLOW-61: API Dashboard Unificado (backend)
- Angular Signals para estado local
- Lucide Icons para iconografía
- fit-flow-card, fit-flow-button (shared components)

## Decisiones de Diseño

1. **Widget-Based Architecture**: Permite reutilización de componentes en otras páginas
2. **No NGXS State**: Datos son read-only, no requieren estado global
3. **User Dashboard Composition**: Sin endpoint backend dedicado, se compone de APIs existentes
4. **HomeComponent como Orquestador**: Simplifica mantenimiento delegando a sub-componentes
