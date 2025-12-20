# Centro de Reportes con Tabs - Documentación Técnica

**Tasks Relacionadas:**

- FITFLOW-DS-09: Página Centro de Reportes con Tabs
- FITFLOW-DS-10: Reporte Financiero - Filtros y Métricas
- FITFLOW-DS-11: Reporte Financiero - Tabla Desglose de Transacciones
- FITFLOW-DS-12: Reporte Uso y Comportamiento - Métricas
- FITFLOW-DS-13: Reporte Uso y Comportamiento - Tabla Análisis

## Descripción General

El Centro de Reportes es una funcionalidad que consolida los reportes financieros y de comportamiento de miembros en una única interfaz con navegación por tabs. Reemplaza la página de dashboard financiero independiente y reorganiza los reportes existentes.

Esta implementación cubre todas las funcionalidades de reportes financieros y de comportamiento, incluyendo filtros, métricas, tablas de análisis y exportación CSV.

## Arquitectura

### Diseño Seleccionado

**Opción C: Arquitectura Híbrida con Componentes Tab Dedicados**

Cada tab es un componente standalone y self-contained que:

- Gestiona su propio estado y lógica
- Tiene sus propios sub-componentes (filtros, tablas, métricas)
- Se comunica con su servicio dedicado
- Es independiente de otros tabs

### Estructura de Componentes

```
ReportsComponent (Contenedor Principal)
├── Header con botón "Exportar CSV"
├── Tab Navigation (Financiero | Uso y Comportamiento)
└── Tab Content
    ├── FinancialTabComponent
    │   ├── MonthYearFilterComponent
    │   ├── Métricas (Cards inline)
    │   └── TransactionsTableComponent
    └── BehaviorTabComponent
        ├── Filtros de fecha (inline)
        ├── BehaviorMetricsComponent
        └── MemberAnalysisTableComponent
```

## Backend - API Endpoints

### 1. Reporte Financiero

**Endpoint:** `GET /api/dashboard/reports/financial`

**Query Parameters:**

- `month` (opcional): Número del mes (1-12)
- `year` (opcional): Año (ej: 2024)

**Response:**

```typescript
{
  ingresoTotal: number;
  transacciones: number;
  morososActuales: number;
  desglose: Array<{
    fecha: Date;
    monto: number;
    metodo: 'CASH' | 'TRANSFER' | 'CARD';
    miembro: string;
  }>;
}
```

**Lógica:**

- Si no se especifica mes/año, usa el mes actual
- Calcula ingreso total sumando todos los pagos del período
- Cuenta transacciones totales
- Obtiene cantidad de membresías expiradas (morosos)
- Retorna desglose completo de transacciones con email del miembro

### 2. Reporte de Comportamiento

**Endpoint:** `GET /api/dashboard/reports/behavior`

**Query Parameters:**

- `startDate` (opcional): Fecha inicio en formato ISO
- `endDate` (opcional): Fecha fin en formato ISO

**Response:**

```typescript
{
  visitasPromActivos: number;
  visitasPromMorosos: number;
  rutinasActivas: number;
  analisis: Array<{
    userId: string;
    miembro: string;
    email: string;
    estado: 'ACTIVE' | 'OVERDUE' | 'INACTIVE';
    visitasTotales: number;
    rutinaActiva: boolean;
    membershipEndDate: Date;
  }>;
  totalMembers: number;
}
```

**Lógica:**

- Si no se especifica período, usa el mes actual
- Calcula promedio de visitas para miembros activos vs morosos
- Cuenta rutinas activas totales
- Genera análisis completo de todos los miembros con:
  - Visitas totales en el período
  - Estado de membresía
  - Si tiene rutina activa asignada

### 3. Exportación CSV

**Endpoint:** `GET /api/dashboard/reports/export-csv`

**Query Parameters:**

- `type`: 'financial' | 'behavior'
- `month` (opcional): Para tipo financial
- `year` (opcional): Para tipo financial
- `startDate` (opcional): Para tipo behavior
- `endDate` (opcional): Para tipo behavior

**Response:** Archivo CSV como string

**Formatos:**

**Financial CSV:**

```
Fecha,Monto,Método,Miembro
19/12/2024,5000,CASH,usuario@email.com
18/12/2024,3500,TRANSFER,otro@email.com
```

**Behavior CSV:**

```
Miembro,Email,Estado,Visitas Totales,Rutina Activa
usuario,usuario@email.com,ACTIVE,15,Sí
otro,otro@email.com,OVERDUE,3,No
```

## Frontend - Componentes

### ReportsComponent

**Responsabilidades:**

- Gestión de navegación entre tabs
- Exportación CSV del tab activo
- Layout general de la página

**Signals:**

- `activeTab`: 'financial' | 'behavior'
- `isExporting`: boolean
- `exportError`: string | null

**Métodos:**

- `setActiveTab(tab)`: Cambia el tab activo
- `exportToCsv()`: Exporta datos del tab actual
- `downloadCsv(blob, filename)`: Descarga el archivo CSV

### FinancialTabComponent

**Responsabilidades:**

- Gestión de filtros mes/año
- Carga de datos financieros
- Visualización de métricas y transacciones

**Signals:**

- `report`: FinancialReport | null
- `loading`: boolean
- `error`: string | null
- `currentMonth`: number
- `currentYear`: number

**Sub-componentes:**

- `MonthYearFilterComponent`: Selectores de mes y año
- `TransactionsTableComponent`: Tabla paginada de transacciones

### BehaviorTabComponent

**Responsabilidades:**

- Gestión de filtros de fecha
- Carga de datos de comportamiento
- Visualización de métricas y análisis de miembros

**Signals:**

- `report`: BehaviorReport | null
- `loading`: boolean
- `error`: string | null
- `startDate`: string
- `endDate`: string

**Sub-componentes:**

- `BehaviorMetricsComponent`: Cards de métricas
- `MemberAnalysisTableComponent`: Tabla paginada de análisis

## Servicios

### FinancialReportService

```typescript
getFinancialReport(month?, year?): Observable<FinancialReport>
exportFinancialCsv(month?, year?): Observable<Blob>
```

### BehaviorReportService

```typescript
getBehaviorReport(startDate?, endDate?): Observable<BehaviorReport>
exportBehaviorCsv(startDate?, endDate?, status?): Observable<Blob>
```

**Parámetros de exportación:**

- `startDate`: Fecha inicio del período (opcional)
- `endDate`: Fecha fin del período (opcional)
- `status`: Filtro de estado de membresía ('ACTIVE' | 'OVERDUE' | 'INACTIVE') (opcional)

## Helpers y Utilidades

### Backend Helpers (DashboardService)

**`roundToOneDecimal(value: number): number`**

- Redondea números a un decimal
- Usado para promedios de visitas

**`mapMembershipStatusToReportStatus(status): 'ACTIVE' | 'OVERDUE' | 'INACTIVE'`**

- Mapea estados de membresía a estados de reporte
- Centraliza lógica de mapeo

**`getMembershipsByStatus(status): Promise<Membership[]>`**

- Query reutilizable para obtener membresías por estado
- Reduce duplicación de código

### Frontend Pipes

**`MembershipStatusBadgePipe`**

- Transforma estado a variante de badge ('success' | 'error' | 'warning')
- Reutilizable en toda la aplicación

**`MembershipStatusLabelPipe`**

- Transforma estado a label en español
- Consistencia en toda la UI

## Flujo de Datos

### Carga de Reporte Financiero

1. Usuario selecciona mes/año en filtros
2. `MonthYearFilterComponent` emite evento `filterChanged`
3. `FinancialTabComponent` recibe evento y llama `loadReport()`
4. `FinancialReportService.getFinancialReport()` hace request HTTP
5. Backend ejecuta queries en paralelo (Promise.all):
   - Pagos del período
   - Conteo de morosos
6. Backend calcula métricas y retorna DTO
7. Frontend actualiza signals y renderiza UI

### Exportación CSV

1. Usuario hace clic en "Exportar CSV"
2. `ReportsComponent.exportToCsv()` identifica tab activo
3. Obtiene filtros actuales del tab (usando ViewChild):
   - Tab Financiero: `month`, `year`
   - Tab Comportamiento: `startDate`, `endDate`, `status` (filtro de estado activo)
4. Llama al servicio correspondiente con filtros
5. Backend genera string CSV aplicando filtros:
   - Filtra datos por período
   - **Filtra por estado de membresía** si se especifica (ACTIVE, OVERDUE, INACTIVE)
6. Frontend recibe Blob y descarga archivo con nombre dinámico

## Performance Considerations

### Optimizaciones Implementadas

1. **Queries en Paralelo**: Uso de `Promise.all()` para ejecutar queries simultáneamente
2. **Paginación**: Tablas paginadas (10-15 items por página) para reducir renderizado
3. **Signals**: Uso de Angular signals para reactividad eficiente
4. **Lazy Loading**: Componentes cargados solo cuando se activa el tab
5. **Computed Values**: Uso de `computed()` para cálculos derivados

### Limitaciones Conocidas

- Exportación CSV genera todo el dataset en memoria (no streaming)
- No hay cache de reportes (cada cambio de filtro hace nueva request)
- Análisis de comportamiento carga todos los miembros (puede ser lento con >1000 miembros)

## Decisiones de Diseño

### ¿Por qué tabs en lugar de páginas separadas?

- **UX mejorado**: Navegación más rápida sin cambio de página
- **Contexto compartido**: Filtros y período en un solo lugar
- **Exportación unificada**: Un solo botón para exportar cualquier reporte

### ¿Por qué CSV en lugar de Excel?

- **Simplicidad**: No requiere librería pesada (exceljs)
- **Universalidad**: CSV se abre en cualquier aplicación
- **Performance**: Generación más rápida
- **Tamaño**: Archivos más pequeños

### ¿Por qué componentes dedicados por tab?

- **Separación de responsabilidades**: Cada tab gestiona su propia lógica
- **Mantenibilidad**: Cambios en un tab no afectan al otro
- **Testabilidad**: Componentes independientes más fáciles de testear
- **Escalabilidad**: Fácil agregar nuevos tabs en el futuro

## Mapeo de Tasks a Componentes

### FITFLOW-DS-09: Página Centro de Reportes con Tabs

**Componentes:**

- `ReportsComponent` - Contenedor principal con navegación de tabs
- Sistema de tabs con estado activo
- Botón "Exportar CSV" en header
- Routing en `/reports`

**Archivos:**

- `frontend/src/app/features/reports/pages/reports/reports.component.ts`
- `frontend/src/app/features/reports/pages/reports/reports.component.html`
- `frontend/src/app/features/reports/pages/reports/reports.component.scss`

### FITFLOW-DS-10: Reporte Financiero - Filtros y Métricas

**Componentes:**

- `MonthYearFilterComponent` - Selectores de mes y año
- `FinancialTabComponent` - Cards de métricas (Ingreso Total, Transacciones, Morosos)

**Endpoint:**

- `GET /api/dashboard/reports/financial?month=X&year=Y`

**Archivos:**

- `frontend/src/app/features/reports/components/month-year-filter/`
- `frontend/src/app/features/reports/components/financial-tab/`
- `backend/src/modules/dashboard/dto/financial-report.dto.ts`
- `backend/src/modules/dashboard/dto/financial-report-filters.dto.ts`

### FITFLOW-DS-11: Reporte Financiero - Tabla Desglose de Transacciones

**Componentes:**

- `TransactionsTableComponent` - Tabla paginada con columnas: Fecha, Monto, Método, Miembro

**Características:**

- Paginación (10 registros por página)
- Formato de moneda ($ 40.500)
- Formato de fecha (19/07/2025 00:00)
- Ordenamiento por fecha descendente

**Archivos:**

- `frontend/src/app/features/reports/components/transactions-table/`

### FITFLOW-DS-12: Reporte Uso y Comportamiento - Métricas

**Componentes:**

- `BehaviorMetricsComponent` - Cards de métricas (Visitas Prom. Activos, Visitas Prom. Morosos, Rutinas Activas)

**Endpoint:**

- `GET /api/dashboard/reports/behavior?startDate=X&endDate=Y`

**Archivos:**

- `frontend/src/app/features/reports/components/behavior-metrics/`
- `backend/src/modules/dashboard/dto/behavior-report.dto.ts`
- `backend/src/modules/dashboard/dto/behavior-report-filters.dto.ts`

### FITFLOW-DS-13: Reporte Uso y Comportamiento - Tabla Análisis

**Componentes:**

- `MemberAnalysisTableComponent` - Tabla paginada con análisis de miembros
- `MembershipStatusBadgePipe` - Pipe para badges de estado
- `MembershipStatusLabelPipe` - Pipe para labels de estado

**Características:**

- **Filtrado por estado:**
  - Botones: Todos, Activos, Morosos, Inactivos
  - Colores temáticos por estado (Verde, Rojo, Naranja)
  - Contador de resultados filtrados
- **Ordenamiento interactivo:**
  - Click en columnas para ordenar (Miembro, Estado, Visitas)
  - Toggle ascendente/descendente
  - Indicador visual (▲/▼) del ordenamiento activo
  - Ordenamiento por estado: ACTIVE → OVERDUE → INACTIVE
- **Paginación:**
  - 15 registros por página
  - Reset automático al filtrar u ordenar
- **Columnas:** Miembro, Email, Estado, Visitas Totales, Rutina Activa
- **Badges de color:** Verde=Activo, Rojo=Moroso, Amarillo=Inactivo

**Archivos:**

- `frontend/src/app/features/reports/components/member-analysis-table/`
- `frontend/src/app/features/reports/pipes/membership-status-badge.pipe.ts`

## Migraciones y Cambios

### Código Eliminado

- Ruta `/dashboard/financial` eliminada de routing
- Item "Finanzas" eliminado del sidebar
- Componente `FinancialDashboardComponent` ya no se usa desde reportes

### Código Mantenido

Los siguientes componentes se mantuvieron por precaución (podrían usarse en otras partes):

- `AttendanceChartComponent`
- `MembershipsChartComponent`
- `RevenueChartComponent`
- `ReportFiltersComponent`

**Recomendación**: Verificar uso y eliminar si no se usan.

## Testing

### Áreas Críticas para Testing

1. **Cálculo de métricas**: Verificar sumas, promedios y conteos
2. **Filtros**: Validar que filtros se apliquen correctamente
3. **Paginación**: Verificar navegación entre páginas
4. **Exportación CSV**: Validar formato y contenido del CSV
5. **Manejo de errores**: Verificar estados de error y loading

### Casos de Prueba Sugeridos

**Backend:**

- Reporte financiero con mes/año específico
- Reporte financiero sin parámetros (mes actual)
- Reporte de comportamiento con período específico
- Reporte de comportamiento sin parámetros (mes actual)
- Exportación CSV de ambos tipos
- Manejo de períodos sin datos

**Frontend:**

- Navegación entre tabs
- Cambio de filtros y recarga de datos
- Paginación en tablas
- Exportación CSV
- Estados de loading y error
- Formato de moneda y fechas

## Desarrollo Futuro

### Mejoras Potenciales

1. **Cache de reportes**: Implementar cache para evitar requests repetidas
2. **Filtros avanzados**: Agregar más opciones de filtrado
3. **Gráficos**: Agregar visualizaciones gráficas de datos
4. **Exportación Excel**: Agregar opción de exportar a Excel con formato
5. **Streaming CSV**: Para datasets grandes, implementar streaming
6. **Comparación de períodos**: Permitir comparar dos períodos
7. **Reportes programados**: Enviar reportes por email automáticamente

### Extensibilidad

Para agregar un nuevo tab:

1. Crear DTOs en backend (`new-report.dto.ts`)
2. Agregar método en `DashboardService`
3. Agregar endpoint en `DashboardController`
4. Crear modelo en frontend (`new-report.model.ts`)
5. Crear servicio en frontend (`new-report.service.ts`)
6. Crear componente tab (`NewTabComponent`)
7. Agregar tab a `ReportsComponent`
8. Actualizar lógica de exportación

## Referencias

- Task ID: FITFLOW-DS-09
- Diseño: Opción C - Arquitectura Híbrida
- Archivos creados: 30 (7 backend, 23 frontend)
- Fecha implementación: 2024-12-19
