# API de Dashboard Unificado - Documentación Técnica

## Overview

El endpoint `GET /api/dashboard` proporciona un dashboard unificado que retorna diferentes datos según el rol del usuario autenticado. Soporta roles **Admin** y **Trainer**.

## Endpoint

```
GET /api/dashboard
Authorization: Bearer <JWT_TOKEN>
```

### Roles Permitidos

- `admin` - Acceso completo a KPIs financieros, operativos y de entrenamientos
- `trainer` - Acceso a KPIs de sus alumnos y entrenamientos creados

## Response por Rol

### Admin Response

```typescript
interface AdminDashboardDto {
  role: 'admin';
  
  // KPIs financieros
  ingresosMes: number;      // Ingresos del mes actual
  ingresosHoy: number;      // Ingresos del día
  morosos: number;          // Cantidad de miembros morosos
  proyeccionMes: number;    // Proyección de ingresos del mes
  
  // KPIs operativos
  asistenciasHoy: number;   // Asistencias registradas hoy
  miembrosActivos: number;  // Total de membresías activas
  expiranPronto: number;    // Membresías que expiran en 7 días
  
  // KPIs entrenamientos
  rutinasActivas: number;   // Rutinas activas en el sistema
  prsDelMes: number;        // Personal records del mes
  
  // Datos para gráficos
  ingresosMensuales: MonthlyRevenueDto[];           // Últimos 6 meses
  distribucionMetodosPago: PaymentMethodDistributionDto[];
}
```

### Trainer Response

```typescript
interface TrainerDashboardDto {
  role: 'trainer';
  
  // KPIs de alumnos
  totalAlumnos: number;         // Total de usuarios con rutinas creadas por el trainer
  alumnosActivos: number;       // Alumnos con rutina activa
  
  // KPIs entrenamientos
  rutinasActivasCreadas: number; // Rutinas activas creadas por el trainer
  prsAlumnosMes: number;         // PRs de sus alumnos este mes
  
  // Lista de alumnos recientes (top 10)
  alumnosRecientes: TrainerStudentSummaryDto[];
}

interface TrainerStudentSummaryDto {
  userId: string;
  userName: string;
  userEmail: string;
  rutinasAsignadas: number;
  ultimaActividad: Date | null;
  tieneRutinaActiva: boolean;
}
```

## Arquitectura

### Flujo de Datos

```
Request → JwtAuthGuard → RolesGuard → Controller → Service → Database
                                           ↓
                                   getUnifiedDashboard(userId, role)
                                           ↓
                            ┌──────────────┴──────────────┐
                            ↓                             ↓
                   role === 'admin'              role === 'trainer'
                            ↓                             ↓
                   getAdminDashboard()        getTrainerDashboard(trainerId)
                            ↓                             ↓
                   Promise.all([...])          Promise.all([...])
                   (10 queries paralelas)      (3 queries paralelas)
```

### Relación Trainer → Alumnos

Los alumnos de un trainer se determinan a través de las rutinas:

```
Routine.createdById = trainerId
        ↓
UserRoutine.routineId = routine.id
        ↓
UserRoutine.userId = alumno
```

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `dashboard.module.ts` | Agregados Routine y PersonalRecord entities |
| `dashboard.service.ts` | Nuevo método getUnifiedDashboard() + helpers |
| `dashboard.controller.ts` | Nuevo endpoint GET /dashboard |
| `dto/admin-dashboard.dto.ts` | Nuevo DTO |
| `dto/trainer-dashboard.dto.ts` | Nuevo DTO |
| `dto/trainer-student-summary.dto.ts` | Nuevo DTO |
| `dto/unified-dashboard.dto.ts` | Union type |
| `dto/index.ts` | Exports actualizados |

## Métodos del Service

### Públicos

| Método | Descripción |
|--------|-------------|
| `getUnifiedDashboard(userId, role)` | Dispatcher principal |
| `getAdminDashboard()` | Dashboard para admin |
| `getTrainerDashboard(trainerId)` | Dashboard para trainer |

### Privados (helpers)

| Método | Descripción |
|--------|-------------|
| `getPRsThisMonth()` | Cuenta PRs del mes actual |
| `getTodayAttendance()` | Cuenta asistencias del día |
| `getTrainerStudents()` | Obtiene alumnos del trainer |
| `getTrainerActiveRoutinesCount()` | Cuenta rutinas activas del trainer |
| `getTrainerStudentsPRsThisMonth()` | PRs de alumnos del trainer |

## Ejemplo de Uso

### cURL

```bash
# Admin
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <admin_token>"

# Trainer
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <trainer_token>"
```

### Angular Service

```typescript
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  
  getUnifiedDashboard(): Observable<AdminDashboardDto | TrainerDashboardDto> {
    return this.http.get<AdminDashboardDto | TrainerDashboardDto>('/api/dashboard');
  }
}
```

## Performance

- Todas las queries se ejecutan en paralelo con `Promise.all()`
- Admin: 10 queries paralelas
- Trainer: 3 queries paralelas
- Tiempo estimado: < 200ms

## Seguridad

- Requiere autenticación JWT
- Validación de rol via `@Roles(Role.ADMIN, Role.TRAINER)`
- Trainers solo pueden ver datos de sus propios alumnos
