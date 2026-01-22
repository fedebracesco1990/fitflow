# Checklist de Funcionalidades

Backlog del Proyecto - Sistema de Gestión de Gimnasio

---

## Funcionalidades Requeridas

### [FITFLOW-10] Configuración de Repositorio y Estructura del Proyecto

**Tipo:** DevOps / Configuración

**Descripción:** Como equipo de desarrollo, necesitamos configurar los repositorios y la estructura base del proyecto.

**Criterios de Aceptación:**

- [x] Repositorio Git creado con estructura monorepo o repos separados
- [x] README.md con instrucciones de setup
- [x] .gitignore configurado
- [x] Estructura de carpetas frontend (Angular) y backend (NestJS)
- [x] Package.json con dependencias base

---

### [FITFLOW-11] Diseño de Arquitectura del Sistema

**Tipo:** Arquitectura

**Descripción:** Como arquitecto del sistema, necesito documentar la arquitectura cliente-servidor y las decisiones técnicas.

**Criterios de Aceptación:**

- [x] Diagrama de arquitectura en Confluence/Wiki
- [x] Especificación de API REST (endpoints principales)
- [x] Estrategia de autenticación definida (JWT)
- [x] Decisiones sobre PWA documentadas

---

### [FITFLOW-12] Diseño del Modelo de Base de Datos

**Tipo:** Backend / Base de Datos

**Descripción:** Como desarrollador backend, necesito diseñar el modelo de datos completo del sistema.

**Criterios de Aceptación:**

- [x] Diagrama ER completo
- [x] Definición de tablas: Usuario, Rol, Membresía, TipoMembresía, Pago, Ejercicio, Rutina, RegistroEjercicio, PersonalRecord, ClaseGrupal, Asistencia
- [x] Índices y constraints documentados
- [x] Scripts de migración iniciales (TypeORM/Prisma)

---

### [FITFLOW-13] Taller de Deploy y DevOps

**Tipo:** DevOps

**Descripción:** Como equipo, necesitamos aprender sobre estrategias de despliegue.

**Criterios de Aceptación:**

- [x] Participación en taller
- [x] Documentación de aprendizajes clave
- [x] Plan de deploy definido (Azure)

---

### [FITFLOW-14] API de Registro de Usuarios

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear los endpoints de registro para que los usuarios puedan crear cuentas.

**Criterios de Aceptación:**

- [x] POST /api/auth/register creado
- [x] Validación de datos (email único, password seguro)
- [x] Hashing de contraseñas con bcrypt
- [x] Creación de usuario en BD con rol por defecto
- [x] Tests unitarios de validación

---

### [FITFLOW-15] Formulario de Registro

**Tipo:** Frontend

**Descripción:** Como usuario nuevo, quiero registrarme en el sistema para poder acceder a la plataforma.

**Criterios de Aceptación:**

- [x] Formulario de registro con validaciones
- [x] Campos: nombre, email, password, confirmar password
- [x] Manejo de errores del backend
- [x] Redirección al login tras registro exitoso
- [x] Responsive design

---

### [FITFLOW-16] API de Login y Generación JWT

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito implementar el sistema de autenticación con JWT.

**Criterios de Aceptación:**

- [x] POST /api/auth/login creado
- [x] Validación de credenciales
- [x] Generación de JWT con payload (userId, role)
- [x] Refresh token strategy implementada
- [x] Guards de autenticación configurados

---

### [FITFLOW-17] Formulario de Login

**Tipo:** Frontend

**Descripción:** Como usuario registrado, quiero iniciar sesión para acceder a mi cuenta.

**Criterios de Aceptación:**

- [x] Formulario de login (email, password)
- [x] Almacenamiento seguro del token JWT
- [x] HTTP Interceptor para añadir token a requests
- [x] Redirección según rol (admin/entrenador/socio)
- [x] Manejo de errores de autenticación

---

### [FITFLOW-18] Sistema de Cierre de Sesión

**Tipo:** Frontend

**Descripción:** Como usuario autenticado, quiero cerrar sesión de forma segura.

**Criterios de Aceptación:**

- [x] Botón de logout visible en navbar
- [x] Eliminación del token del storage
- [x] Redirección a página de login
- [x] Limpieza del estado global

---

### [FITFLOW-19] Sistema de Roles y Permisos

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito implementar el sistema de roles con permisos diferenciados.

**Criterios de Aceptación:**

- [x] Tabla Roles en BD (Admin, Entrenador, Socio)
- [x] Decoradores @Roles() para proteger endpoints
- [x] RolesGuard implementado
- [x] Endpoints protegidos según rol
- [x] Tests de autorización

---

### [FITFLOW-20] Rutas Protegidas y Guards

**Tipo:** Frontend

**Descripción:** Como sistema, necesito proteger las rutas según el rol del usuario.

**Criterios de Aceptación:**

- [x] AuthGuard implementado
- [x] RoleGuard implementado
- [x] Rutas protegidas en routing
- [x] Redirección automática si no autorizado
- [x] Diferentes dashboards por rol

---

### [FITFLOW-21] API de Recuperación de Contraseña

**Tipo:** Backend

**Descripción:** Como usuario, necesito poder recuperar mi contraseña si la olvido.

**Criterios de Aceptación:**

- [x] POST /api/auth/forgot-password creado
- [x] Generación de token temporal
- [ ] Envío de email con link de recuperación
- [x] POST /api/auth/reset-password creado
- [x] Validación de token temporal

---

### [FITFLOW-22] Flujo de Recuperación de Contraseña

**Tipo:** Frontend

**Descripción:** Como usuario, quiero recuperar mi contraseña desde la interfaz.

**Criterios de Aceptación:**

- [x] Link "¿Olvidaste tu contraseña?" en login
- [x] Formulario para solicitar recuperación
- [x] Página de reset con validación de token
- [x] Feedback de éxito/error

---

### [FITFLOW-23] API de Gestión de Tipos de Membresía

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear el CRUD de tipos de membresía.

**Criterios de Aceptación:**

- [x] GET /api/membership-types
- [x] POST /api/membership-types (solo admin)
- [x] PUT /api/membership-types/:id
- [x] DELETE /api/membership-types/:id
- [x] Campos: nombre, precio, duración, descripción, días de gracia

---

### [FITFLOW-24] Panel de Gestión de Tipos de Membresía

**Tipo:** Frontend

**Descripción:** Como administrador, quiero gestionar los tipos de membresía disponibles.

**Criterios de Aceptación:**

- [x] Tabla con lista de tipos de membresía
- [x] Formulario de creación/edición
- [x] Confirmación de eliminación
- [x] Validaciones de campos

---

### [FITFLOW-25] API de Gestión de Pagos

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear los endpoints para registrar y consultar pagos.

**Criterios de Aceptación:**

- [x] POST /api/payments (registrar pago)
- [x] GET /api/payments (con filtros: usuario, fecha, estado)
- [x] GET /api/payments/:id
- [x] GET /api/payments/user/:userId/status (estado de cuenta)
- [x] Cálculo automático de vencimientos
- [x] Identificación de morosos

---

### [FITFLOW-26] Formulario de Registro de Pagos

**Tipo:** Frontend

**Descripción:** Como administrador/staff, quiero registrar pagos de los socios.

**Criterios de Aceptación:**

- [x] Selector de usuario (autocomplete)
- [x] Campos: monto, método de pago, fecha, concepto
- [x] Validación de campos
- [x] Confirmación visual de registro exitoso
- [x] Actualización automática de estado del socio

---

### [FITFLOW-27] Lista y Consulta de Pagos

**Tipo:** Frontend

**Descripción:** Como administrador, quiero consultar el historial de pagos con filtros.

**Criterios de Aceptación:**

- [x] Tabla paginada de pagos
- [x] Filtros: usuario, rango de fechas, método de pago
- [x] Indicador visual de estado (al día, vencido)
- [x] Exportación a Excel/PDF
- [x] Vista detallada del estado de cuenta por usuario

---

### [FITFLOW-28] API de Dashboard Financiero

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear endpoints para métricas financieras.

**Criterios de Aceptación:**

- [x] GET /api/dashboard/financial
- [x] KPIs: total recaudado mes actual, morosos, vencimientos próximos (7 días)
- [x] Distribución de pagos por método
- [x] Gráfico de ingresos mensuales (últimos 6 meses)

---

### [FITFLOW-29] Dashboard Financiero

**Tipo:** Frontend

**Descripción:** Como administrador, quiero visualizar métricas financieras clave del gimnasio.

**Criterios de Aceptación:**

- [x] Cards con KPIs principales
- [x] Gráfico de ingresos mensuales (Chart.js)
- [x] Lista de morosos con acciones rápidas
- [x] Lista de vencimientos próximos
- [x] Actualización en tiempo real

---

### [FITFLOW-30] Generación de Códigos QR por Usuario

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito generar códigos QR únicos para cada usuario.

**Criterios de Aceptación:**

- [x] Generación de UUID único por usuario al crear cuenta
- [x] GET /api/users/:id/qr (devuelve imagen QR)
- [x] QR contiene: userId encriptado, timestamp
- [x] Regeneración de QR si es necesario

---

### [FITFLOW-31] Visualización de QR Personal

**Tipo:** Frontend

**Descripción:** Como socio, quiero ver mi código QR para poder ingresar al gimnasio.

**Criterios de Aceptación:**

- [x] Página "Mi QR" en perfil de usuario
- [x] Visualización del QR en tamaño grande
- [x] Opción de descargar QR
- [x] Instrucciones de uso

---

### [FITFLOW-32] API de Validación de Acceso por QR

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito validar el acceso según el estado de pago al escanear QR.

**Criterios de Aceptación:**

- [x] POST /api/access/validate-qr
- [x] Decodificación del QR
- [x] Validación de estado de pago
- [x] Validación de tipo de membresía (sala/clase)
- [x] Registro de ingreso en tabla Asistencia
- [x] Respuesta: permitido/denegado + razón

---

### [FITFLOW-33] Lector de QR para Control de Acceso

**Tipo:** Frontend

**Descripción:** Como staff del gimnasio, necesito escanear QR para validar el ingreso de los socios.

**Criterios de Aceptación:**

- [x] Página de escaneo de QR con cámara
- [x] Integración con WebRTC/librería QR
- [x] Feedback visual inmediato (verde: permitido, rojo: denegado)
- [x] Mensaje explicativo del resultado
- [x] Sonido de confirmación/error
- [x] Historial de últimos escaneos

---

### [FITFLOW-34] API de Historial de Asistencia ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para consultar el historial de asistencia.

**Criterios de Aceptación:**

- [x] GET /api/attendance (con filtros: usuario, fecha, tipo)
- [x] GET /api/attendance/user/:userId (historial personal)
- [x] GET /api/attendance/stats (estadísticas por horario, día)
- [x] Conteo de asistencias mensuales por usuario

**Implementación:**

- Módulo `attendance/` separado que reutiliza `AccessLog` entity
- Estadísticas: asistencias por día de la semana, promedio mensual
- Permisos: Admin/Trainer para stats globales, Socio para su propio historial

---

### [FITFLOW-35] Visualización de Historial de Asistencia ✅

**Tipo:** Frontend

**Descripción:** Como socio, quiero ver mi historial de asistencia al gimnasio.

**Criterios de Aceptación:**

- [x] Calendario con marcas de asistencia
- [x] Contador de asistencias del mes
- [x] Gráfico de asistencias por mes (últimos 6 meses)
- [ ] Filtro por rango de fechas (pendiente para mejora futura)

**Implementación:**

- `AttendanceCalendarComponent` - Wrapper reutilizable de angular-calendar
- `MyAttendanceComponent` - Página `/profile/attendance` para socios
- `AttendanceStatsComponent` - Página `/access/stats` para Admin/Trainer
- `AttendanceService` - Servicio HTTP para la API
- Seeder con ~260 registros de prueba

---

### [FITFLOW-36] Sistema de Notificaciones con Firebase ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito integrar Firebase Cloud Messaging para enviar notificaciones.

**Criterios de Aceptación:**

- [x] Configuración de Firebase Admin SDK
- [x] Servicio de notificaciones creado
- [x] POST /api/notifications/send
- [x] Almacenamiento de tokens de dispositivos
- [x] Templates de notificaciones predefinidos

**Implementación:**

- `NotificationsModule` con service, controller, DTOs
- Entidades: `DeviceToken`, `NotificationTemplate`
- 4 templates predefinidos: MEMBERSHIP_EXPIRING, MEMBERSHIP_EXPIRED, LOW_ATTENDANCE, CUSTOM
- Soporte multi-dispositivo por usuario

---

### [FITFLOW-37] Gestión de Notificaciones Push ✅

**Tipo:** Frontend

**Descripción:** Como usuario, quiero recibir notificaciones push en mi dispositivo.

**Criterios de Aceptación:**

- [x] Solicitud de permisos de notificaciones
- [x] Registro de token FCM en backend
- [x] Service Worker configurado para notificaciones
- [x] Manejo de notificaciones en primer/segundo plano
- [x] Centro de notificaciones en la app

**Implementación:**

- `PushNotificationsService` - Integración Firebase Messaging
- `NotificationsState` (NGXS) - State management con persistencia
- `NotificationBellComponent` - Icono con badge de no leídas
- `NotificationCenterComponent` - Panel con lista de notificaciones
- `NotificationPromptComponent` - Modal para solicitar permisos
- `firebase-messaging-sw.js` - Service Worker para background

---

### [FITFLOW-38] Cron Job de Notificaciones Automáticas ✅ COMPLETO

**Tipo:** Backend

**Descripción:** Como sistema, necesito enviar notificaciones automáticas de vencimientos y baja asistencia.

**Criterios de Aceptación:**

- [x] Cron job diario para revisar vencimientos
- [x] Notificación 3 días antes del vencimiento
- [x] Notificación al vencer la cuota
- [x] Notificación de baja asistencia (<8 visitas/mes)
- [x] Configuración de días de anticipación

**Implementación:**

- `SchedulerModule` con `@nestjs/schedule`
- `SchedulerService` con 3 cron jobs:
  - `handleExpiringMemberships()` - Diario 8:00 AM (America/Montevideo)
  - `handleExpiredMemberships()` - Diario 8:00 AM
  - `handleLowAttendance()` - Semanal Lunes 9:00 AM
- Constantes configurables: `EXPIRATION_DAYS_AHEAD`, `MIN_MONTHLY_VISITS`
- Método `findUsersWithLowAttendance()` en AttendanceService

---

### [FITFLOW-39] API de Biblioteca de Ejercicios ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear el CRUD de ejercicios.

**Criterios de Aceptación:**

- [x] GET /api/exercises (con filtros: grupo muscular, nivel, equipamiento, búsqueda)
- [x] POST /api/exercises (crear ejercicio) - Admin/Trainer
- [x] PATCH /api/exercises/:id - Admin/Trainer
- [x] DELETE /api/exercises/:id - Admin/Trainer
- [x] Campos: nombre, descripción, grupo muscular, nivel, equipamiento, imagen, video
- [x] Seed inicial con 156 ejercicios

**Implementación:**

- Equipment enum con 8 valores (barbell, dumbbell, machine, cable, bodyweight, kettlebell, bands, none)
- FilterExercisesDto con filtros dinámicos y búsqueda LIKE
- Seed desde archivo JSON (`exercises-seed.json`)

---

## Funcionalidades Nuevas

### [FITFLOW-40] Biblioteca de Ejercicios para Entrenador ✅ COMPLETO

**Tipo:** Frontend

**Descripción:** Como entrenador, quiero navegar por una biblioteca de ejercicios para armar rutinas

**Criterios de Aceptación:**

- [x] Vista de grid/lista de ejercicios
- [x] Filtros: grupo muscular, nivel, equipamiento
- [x] Buscador por nombre
- [x] Vista detallada con imagen/video
- [x] Formulario de creación/edición

**Implementación:**

- Equipment enum + EquipmentLabels en exercise.model.ts
- ExercisesService con filtros completos
- ViewToggleComponent (shared)
- ExerciseCardComponent, ExerciseFiltersComponent
- ExerciseDetailComponent (nueva página /exercises/:id)
- Formulario actualizado con campo equipment

---

### [FITFLOW-41] API Completa de Rutinas ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear la API completa de rutinas

**Criterios de Aceptación:**

- [x] POST /api/routines (crear rutina)
- [x] GET /api/routines (listar rutinas del trainer) - con filtro `createdBy` opcional
- [x] GET /api/routines/:id (detalle de rutina con ejercicios)
- [x] PATCH /api/routines/:id (editar rutina) - usa PATCH, equivalente a PUT
- [x] DELETE /api/routines/:id
- [x] POST /api/routines/:id/assign (asignar a usuarios) - wrapper de user-routines
- [x] Estructura JSON para ejercicios por día con sets/reps/peso - campo `suggestedWeight` agregado

**Implementación:**

- Módulo `routines/` con CRUD completo + ejercicios anidados
- `FilterRoutinesDto` con filtro `createdBy` para trainer
- Endpoint `/routines/:id/assign` que delega a `UserRoutinesService`
- Campo `suggestedWeight` en `RoutineExercise` para peso sugerido

---

### [FITFLOW-42] Constructor Visual de Rutinas (Drag & Drop) ✅

**Tipo:** Frontend + Backend

**Descripción:** Como entrenador, quiero crear rutinas arrastrando ejercicios de forma visual

**Criterios de Aceptación:**

- [x] Panel izquierdo: biblioteca de ejercicios (drag source)
- [x] Panel derecho: días de la semana (drop zones)
- [x] Drag & drop funcional con Angular CDK
- [x] Configuración por ejercicio: sets, reps, peso, descanso
- [x] Reordenamiento de ejercicios dentro del día
- [x] Eliminación de ejercicios de la rutina
- [ ] Preview de la rutina completa

**Implementación:**

- Campo `dayOfWeek` agregado a `RoutineExercise` entity (nullable enum)
- `@angular/cdk` instalado para drag & drop
- Componentes: `RoutineBuilderComponent`, `ExercisePanelComponent`, `DayColumnComponent`, `RoutineExerciseItemComponent`
- Rutas: `/routines/builder` (nueva) y `/routines/:id/builder` (editar)
- Documentación técnica: `docs/technical/constructor-visual-rutinas.md`
- Guía de usuario: `docs/user_manuals/constructor-visual-rutinas-guia.md`

---

### [FITFLOW-43] Sistema de Plantillas de Rutinas ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito permitir guardar rutinas como plantillas reutilizables

**Criterios de Aceptación:**

- [x] Flag isTemplate en tabla Rutinas
- [x] GET /api/routines/templates (listar plantillas)
- [x] POST /api/routines/:id/save-as-template
- [x] POST /api/routines/from-template/:templateId (duplicar)
- [x] Categorización de plantillas (fuerza, hipertrofia, etc.)

**Implementación:**

- Submódulo `routines/templates/` con TemplatesService y TemplatesController
- Enum `TemplateCategory` con 7 categorías: strength, hypertrophy, endurance, cardio, flexibility, functional, full_body
- Campos `isTemplate` y `templateCategory` en Routine entity
- 3 plantillas de ejemplo en seeder

---

### [FITFLOW-44] Gestión de Plantillas de Rutinas ✅

**Tipo:** Frontend

**Descripción:** Como entrenador, quiero guardar y reutilizar plantillas de rutinas

**Criterios de Aceptación:**

- [x] Botón "Guardar como plantilla" en editor de rutinas
- [x] Modal de categorización de plantilla
- [x] Sección "Mis Plantillas" con grid de plantillas
- [x] Botón "Usar plantilla" que carga en editor
- [x] Preview de plantilla antes de usar

**Implementación:**

- Página `/routines/templates` con grid filtrable por categoría
- `TemplateCardComponent` con nombre, categoría, stats y acciones
- `SaveAsTemplateDialogComponent` para seleccionar categoría al guardar
- `TemplatePreviewDialogComponent` para vista previa de ejercicios por día
- Botón "📋 Guardar como Plantilla" en builder (modo edición)
- Link "📋 Mis Plantillas" en lista de rutinas

---

### [FITFLOW-45] Asignación de Rutinas a Usuarios ✅

**Tipo:** Frontend + Backend

**Descripción:** Como entrenador, quiero asignar rutinas a mis alumnos

**Criterios de Aceptación:**

- [x] Selector múltiple de usuarios
- [x] Fecha de inicio de rutina
- [x] Opción de clonar rutina por usuario o compartir
- [x] Confirmación de asignación
- [x] Notificación al usuario de nueva rutina

**Implementación:**

- `AssignRoutineDialogComponent` con selector múltiple de usuarios y búsqueda
- `POST /user-routines/bulk` endpoint para asignación masiva con notificaciones
- Botón "👥 Asignar" en lista de rutinas (`/routines`)
- Botón "👥 Asignar a Usuarios" en constructor visual (modo edición)
- Date picker para fecha de inicio (default: hoy)
- Selector de día de la semana
- Notificación push automática vía Firebase a usuarios asignados
- Mensajes de éxito/error con auto-dismiss

---

### [FITFLOW-46] API de Rutinas del Usuario ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para que los usuarios accedan a sus rutinas

**Criterios de Aceptación:**

- [x] GET /user-routines/my-week (rutinas activas) - Ya existía
- [x] GET /workouts/my-history (historial) - Ya existía
- [x] GET /user-routines/today (rutina del día actual con historial)
- [x] Cálculo de día de la semana para mostrar ejercicios

**Notas de Implementación:**

- Endpoint `/user-routines/today` devuelve la rutina del día con ejercicios enriquecidos
- Incluye `lastWorkout` con pesos/reps de la última sesión de esa rutina
- Helper `getCurrentDayOfWeek()` extraído a `common/utils/date.utils.ts`

---

### [FITFLOW-47] Visualización de Rutina del Día (Socio) ✅

**Tipo:** Frontend

**Descripción:** Como socio, quiero ver mi rutina del día con los ejercicios que debo hacer

**Criterios de Aceptación:**

- [x] Página "Mi Rutina de Hoy"
- [x] Lista de ejercicios del día con imagen
- [x] Visualización de: sets, reps, peso sugerido
- [x] Navegación entre días de la semana
- [x] Acceso offline (PWA)

**Implementación:**

- `TodayRoutineComponent` con navegación semanal (DayNavigator)
- `ExerciseCardComponent` con historial de última sesión
- `WorkoutComponent` mejorado con agregar/eliminar series
- Ruta `/my-routines/today` como landing principal para socios
- PWA config en `ngsw-config.json` con dataGroups para API caching
- Shared util `getCurrentDayOfWeek()` en `core/utils/`

---

### [FITFLOW-48] API de Registro de Progreso ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para registrar el progreso de entrenamientos

**Criterios de Aceptación:**

- [x] POST /api/workout-logs (registrar sesión completa) - Usa POST /workouts
- [x] POST /api/exercise-logs (registrar ejercicio individual) - Usa POST /workouts/:id/exercises
- [x] Campos por set: peso, reps completadas, RIR/RPE
- [x] Timestamp automático
- [x] Asociación con usuario, rutina y ejercicio

**Implementación:**

- Campos `rir` (int 0-5) y `rpe` (decimal 1-10) en ExerciseLog
- Endpoint `POST /workouts/:id/exercises/bulk` para registro masivo
- Validaciones completas con class-validator

---

### [FITFLOW-49] Registro de Progreso en Rutina ✅

**Tipo:** Frontend

**Descripción:** Como socio, quiero registrar los pesos y repeticiones que realicé en cada ejercicio

**Criterios de Aceptación:**

- [x] Botones +/- para ajustar peso por set
- [x] Checkbox para marcar set completado
- [x] Visualización del peso usado la sesión anterior
- [x] Guardado automático en segundo plano
- [x] Feedback visual de guardado exitoso
- [x] Sincronización cuando vuelva conexión (offline)

**Implementación:**

- `WorkoutComponent` con auto-guardado cada cambio de peso/reps
- Botones +/- para incrementar/decrementar peso (±2.5kg) y reps (±1)
- Peso sugerido basado en última sesión del ejercicio
- `SavingIndicatorComponent` con estados: idle, saving, saved, error
- PWA con dataGroups para caching de API y sync offline

---

### [FITFLOW-50] Detección de Personal Records

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito detectar automáticamente cuando un usuario supera su récord personal

**Criterios de Aceptación:**

- [x] Trigger/servicio que detecta nuevo PR al guardar log
- [x] Tabla PersonalRecords con: userId, exerciseId, peso, reps, fecha
- [x] Actualización automática del PR si se supera
- [x] GET /api/users/:userId/personal-records
- [x] Generación de notificación de logro

**Implementación:**

- PersonalRecordsModule
- Hooks en WorkoutsService
- Notificaciones de PR integradas

---

### [FITFLOW-51] Notificación y Visualización de Personal Records ✅

**Tipo:** Frontend

**Descripción:** Como socio, quiero ser notificado cuando rompo un récord personal

**Criterios de Aceptación:**

- [x] Modal de celebración al lograr PR
- [x] Animación de confetti/stars
- [x] Sección "Mis Récords" en perfil
- [x] Listado de todos los PRs con fecha
- [x] Insignias/badges por cantidad de PRs

**Implementación (2026-01-13):**

- `PrCelebrationModalComponent` con canvas-confetti integrado globalmente en MainLayout
- `PersonalRecordsState` (NGXS) para gestión de estado
- `MyRecordsComponent` en `/profile/records` con lista de PRs y badges
- Sistema de insignias: Novato (5), Dedicado (10), Veterano (25), Élite (50), Leyenda (100)
- Backend modificado para retornar `prResult` en respuesta de exercise log

---

## Fase de Optimización y Escala

### [FITFLOW-52] API de Estadísticas y Progreso ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para generar estadísticas de progreso

**Criterios de Aceptación:**

- [x] GET /api/stats/me/progress/:exerciseId (evolución de un ejercicio)
- [x] GET /api/stats/me/volume (volumen total por período)
- [x] GET /api/stats/me/monthly (comparativa mensual)
- [x] Cálculo de estancamientos (sin progreso X semanas)
- [x] Datos para gráficos de líneas/barras

**Implementación (2026-01-13):**

- Nuevo módulo `stats/` con StatsController, StatsService
- 6 endpoints: 3 /me (usuario autenticado) + 3 /users/:userId (Admin/Trainer)
- DTOs tipados: ExerciseProgressDto, VolumeStatsDto, MonthlyComparisonDto
- Detección de estancamiento: compara últimas 3 semanas sin incremento de peso
- Volumen por grupo muscular con porcentajes
- Comparativa mensual incluye PRs del período

---

### [FITFLOW-53] Gráficos de Evolución de Progreso ✅

**Tipo:** Frontend

**Descripción:** Como socio, quiero visualizar gráficamente mi evolución en los ejercicios

**Criterios de Aceptación:**

- [x] Página "Mi Progreso"
- [x] Selector de ejercicio
- [x] Gráfico de línea: peso vs fecha (Chart.js)
- [x] Gráfico de volumen total mensual
- [x] Comparativa mes actual vs anterior
- [x] Indicadores de estancamiento
- [ ] Exportación a imagen/PDF

**Implementación (2026-01-13):**

- Página `/profile/progress` con `MyProgressComponent`
- Componentes: `ExerciseProgressChartComponent`, `VolumeChartComponent`, `MuscleGroupChartComponent`
- `PeriodFilterComponent` para selección de rango de fechas
- `ExerciseSelectorComponent` para filtrar por ejercicio
- `MonthlyComparisonCardComponent` con comparativa mensual
- Integración con StatsService (endpoints de FITFLOW-52)
- Gráficos con Chart.js via ng2-charts

---

### [FITFLOW-54] Historial de Rutinas por Usuario ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito mantener historial de rutinas previas

**Criterios de Aceptación:**

- [x] Marca de fecha_fin cuando se asigna nueva rutina
- [x] GET /api/users/:userId/routines/history
- [x] Información de duración de cada rutina
- [x] Acceso a rutinas archivadas

**Implementación (2026-01-13):**

- `deactivate()` ahora setea `endDate` automáticamente
- `assign()` desactiva rutina anterior del mismo día antes de asignar nueva
- Endpoints: GET /user-routines/my-history, GET /user-routines/users/:userId/history
- Response incluye: routineName, startDate, endDate, durationDays, workoutsCompleted

---

### [FITFLOW-55] Historial de Rutinas ✅

**Tipo:** Frontend

**Descripción:** Como socio/entrenador, quiero ver el historial de rutinas previas

**Criterios de Aceptación:**

- [x] Timeline de rutinas anteriores
- [x] Vista detallada de rutina archivada
- [x] Indicador de duración y progreso logrado

**Implementación:**

- Grid de cards responsive en `/my-routines/history`
- Stats: rutinas completadas, entrenamientos totales
- Cada card muestra: nombre, día, fechas, duración, workouts completados
- Navegación desde "Mi Semana" con link "Ver Historial"
- Componentes: `RoutineHistoryComponent`, `RoutineHistoryCardComponent`
- Service: `getMyHistory()` en `UserRoutinesService`

---

### [FITFLOW-56] Configuración de PWA con Service Workers ✅

**Tipo:** Frontend

**Descripción:** Como desarrollador frontend, necesito convertir la aplicación en una PWA funcional

**Criterios de Aceptación:**

- [x] Configuración de @angular/pwa
- [x] Manifest.json con iconos y configuración
- [x] Service Worker para caching de assets
- [x] Estrategias de cache (Network First, Cache First)
- [x] Precaching de rutas principales
- [x] Funcionalidad offline para rutinas y progreso
- [x] Prompt de instalación de PWA

**Implementación (2026-01-15):**

- `PwaService` con SwUpdate para detección de actualizaciones y `beforeinstallprompt` para instalación
- `PwaUpdatePromptComponent` - Modal para notificar nueva versión disponible
- `PwaInstallPromptComponent` - Modal de instalación con lista de beneficios (después de 2+ visitas)
- `manifest.webmanifest` completado con theme_color (#3b82f6), background_color (#f5f7fa), description
- Meta tags PWA en index.html: theme-color, apple-mobile-web-app-capable, apple-touch-icon
- `ngsw-config.json` expandido con dataGroups: routines-api, stats-api, personal-records-api
- Estrategias: freshness (5s timeout) para datos dinámicos, performance (1d) para ejercicios

---

### [FITFLOW-57] Sistema de Sincronización Offline ✅

**Tipo:** Frontend

**Descripción:** Como usuario, quiero que mis datos se sincronicen automáticamente cuando recupere conexión

**Criterios de Aceptación:**

- [x] IndexedDB para almacenamiento local
- [x] Cola de sincronización para operaciones offline
- [x] Detección de conectividad (online/offline)
- [x] Sincronización automática al recuperar conexión
- [x] Indicador visual de estado de sincronización
- [x] Manejo de conflictos de datos

**Implementación:**

- `OfflineDbService` (Dexie.js), `SyncQueueService`, `SyncManagerService`
- `OfflineWorkoutsService`, `OfflineBannerComponent`, `SyncStatusComponent`
- Dexie.js ^4.x

---

### [FITFLOW-58] WebSocket Server para Tiempo Real ✅

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito configurar WebSockets para comunicación en tiempo real

**Criterios de Aceptación:**

- [x] Gateway de WebSockets en NestJS
- [x] Autenticación de conexiones WS con JWT
- [x] Rooms por usuario/trainer
- [x] Eventos: routine.updated, progress.logged, notification.new
- [x] Manejo de desconexiones

**Implementación:**

- `src/modules/websocket/` - Nuevo módulo WebSocket
- `EventsGateway` con namespace `/events`
- `WsJwtGuard` para autenticación
- `RealtimeService`

---

### [FITFLOW-59] Cliente WebSocket y Sincronización en Tiempo Real ✅

**Tipo:** Frontend

**Descripción:** Como usuario, quiero ver actualizaciones en tiempo real sin refrescar la página

**Criterios de Aceptación:**

- [x] Servicio de WebSocket en Angular
- [x] Conexión automática al autenticar
- [x] Escucha de eventos del servidor
- [x] Actualización de UI reactiva (RxJS)
- [x] Reconexión automática si se pierde conexión

**Implementación:**

- `WebSocketService`, Models, Auth Integration
- Angular Signals, RxJS Subjects
- socket.io-client ^4.x

---

### [FITFLOW-60] Testing de Rendimiento y Optimización

**Tipo:** DevOps / Frontend

**Estado:** ✅ COMPLETO

**Descripción:** Como equipo, necesitamos asegurar que la aplicación cumpla con los requisitos de rendimiento

**Criterios de Aceptación:**

- [x] Lighthouse audit score >90
- [x] Lazy loading de módulos implementado
- [x] Optimización de imágenes (WebP, lazy loading)
- [x] Bundle size analysis y optimización
- [x] Tiempo de carga inicial <3s
- [x] Tests de carga con herramientas (JMeter/Artillery)

**Implementación:**

- `PreloadAllModules`, `@font-face` optimization, `@defer`
- `ChangeDetectionStrategy.OnPush`
- Lighthouse CI, Artillery load tests

---

### [FITFLOW-61] API de Dashboard Unificado

**Tipo:** Backend

**Estado:** ✅ COMPLETO

**Descripción:** Como desarrollador backend, necesito consolidar todas las métricas en un dashboard unificado

**Criterios de Aceptación:**

- [x] GET /api/dashboard (datos según rol)
- [x] KPIs financieros: ingresos, morosos, proyección
- [x] KPIs operativos: asistencias del día, usuarios activos
- [x] KPIs de entrenamientos: rutinas activas, PRs del mes
- [x] Datos para gráficos de distribución y tendencias

**Implementación:**

- `dashboard/` module, `UnifiedDashboardDto`, `AdminDashboardDto`, `TrainerDashboardDto`
- Endpoint polimórfico `@Roles(ADMIN, TRAINER)`

---

### [FITFLOW-62] Dashboard Principal por Rol

**Tipo:** Frontend

**Estado:** ✅ COMPLETO

**Descripción:** Como usuario, quiero ver un dashboard personalizado según mi rol al ingresar

**Criterios de Aceptación:**

- [x] Dashboard Admin: métricas financieras, asistencias, alertas
- [x] Dashboard Entrenador: mis alumnos, rutinas, próximas sesiones
- [x] Dashboard Socio: mi rutina, mi progreso, próximo pago
- [x] Widgets interactivos y navegables
- [x] Diseño responsive y moderno

**Implementación:**

- Widget-based architecture (`dashboard/widgets/`)
- Components: `AdminDashboard`, `TrainerDashboard`, `UserDashboard`
- Home component orchestrator

---

## Fase Final: Reportes, Comunicación y Lanzamiento

### [FITFLOW-63] API de Reportes Exportables

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para generar reportes en PDF/Excel

**Criterios de Aceptación:**

- [ ] POST /api/reports/financial (genera PDF/Excel)
- [ ] POST /api/reports/attendance
- [ ] POST /api/reports/users
- [ ] Parámetros: formato, rango de fechas, filtros
- [ ] Generación con librerías (pdfmake, exceljs)
- [ ] Envío por email opcional

---

### [FITFLOW-64] Generación y Exportación de Reportes

**Tipo:** Frontend

**Descripción:** Como administrador, quiero generar y exportar reportes personalizados

**Criterios de Aceptación:**

- [ ] Página "Reportes" con opciones de tipo
- [ ] Selector de rango de fechas
- [ ] Selector de formato (PDF/Excel)
- [ ] Preview del reporte antes de exportar
- [ ] Descarga automática del archivo
- [ ] Historial de reportes generados

---

### [FITFLOW-65] API de Comunicación Trainer-Usuario

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito un sistema de mensajería entre trainers y usuarios

**Criterios de Aceptación:**

- [ ] POST /api/messages (enviar mensaje)
- [ ] GET /api/messages/conversation/:userId (conversación con usuario)
- [ ] GET /api/messages/unread (contador de no leídos)
- [ ] WebSocket event para nuevo mensaje
- [ ] Marca de leído

---

### [FITFLOW-66] Chat Trainer-Usuario

**Tipo:** Frontend

**Descripción:** Como entrenador/socio, quiero comunicarme con mi trainer/alumno dentro de la app

**Criterios de Aceptación:**

- [ ] Lista de conversaciones
- [ ] Vista de chat con historial
- [ ] Envío de mensajes en tiempo real
- [ ] Indicador de mensaje no leído
- [ ] Notificación push de nuevo mensaje
- [ ] Opción de adjuntar imágenes

---

### [FITFLOW-67] Panel de Notificaciones Personalizadas (Admin)

**Tipo:** Frontend

**Descripción:** Como administrador, quiero enviar notificaciones personalizadas a usuarios seleccionados

**Criterios de Aceptación:**

- [ ] Página "Enviar Notificación"
- [ ] Selector múltiple de usuarios o "Todos"
- [ ] Editor de mensaje con preview
- [ ] Programación de envío (inmediato/programado)
- [ ] Historial de notificaciones enviadas

---

### [FITFLOW-68] Detección de Usuarios con Baja Asistencia

**Tipo:** Backend

**Descripción:** Como sistema, necesito identificar usuarios con baja asistencia para intervención

**Criterios de Aceptación:**

- [ ] Cron job mensual que identifica usuarios <8 asistencias
- [ ] GET /api/users/low-attendance
- [ ] Generación de lista para contacto manual
- [ ] Opción de envío automático de notificación motivacional

---

### [FITFLOW-69] Lista de Usuarios para Retención

**Tipo:** Frontend

**Descripción:** Como administrador, quiero ver una lista de usuarios con baja asistencia para contactarlos

**Criterios de Aceptación:**

- [ ] Sección "Alerta de Retención" en dashboard
- [ ] Tabla con usuarios de baja asistencia
- [ ] Indicador de última asistencia
- [ ] Botones de acción rápida: llamar, enviar mensaje
- [ ] Marcar como "contactado"

---

### [FITFLOW-70] Pulido Final de UI/UX

**Tipo:** Frontend / UX

**Descripción:** Como equipo, necesitamos pulir y mejorar la experiencia de usuario antes del lanzamiento

**Criterios de Aceptación:**

- [ ] Revisión de consistencia visual en todas las páginas
- [ ] Mejora de animaciones y transiciones
- [ ] Validación de accesibilidad (WCAG)
- [ ] Tooltips y ayudas contextuales
- [ ] Mensajes de error amigables
- [ ] Loading states y skeletons
- [ ] Onboarding para usuarios nuevos

---

### [FITFLOW-71] Testing de Integración E2E

**Tipo:** Testing / QA

**Descripción:** Como equipo, necesitamos realizar pruebas end-to-end completas antes del lanzamiento

**Criterios de Aceptación:**

- [ ] Suite de tests E2E con Cypress/Playwright
- [ ] Flujos críticos testeados: login, crear rutina, registrar progreso, escanear QR
- [ ] Tests en diferentes navegadores
- [ ] Tests en dispositivos móviles
- [ ] Documentación de casos de prueba

---

### [FITFLOW-72] UAT con Cliente

**Tipo:** Management

**Descripción:** Como equipo, necesitamos validar el sistema completo con el cliente en producción

**Criterios de Aceptación:**

- [ ] Sesión de UAT con cliente (2-3 horas)
- [ ] Walkthrough de todas las funcionalidades
- [ ] Checklist de aceptación firmada
- [ ] Lista de ajustes menores (si los hay)
- [ ] Feedback documentado

---

### [FITFLOW-73] Ajustes Post-UAT

**Tipo:** Development

**Descripción:** Como equipo, necesitamos implementar los ajustes identificados en UAT

**Criterios de Aceptación:**

- [ ] Todos los bugs críticos corregidos
- [ ] Ajustes menores de UI implementados
- [ ] Re-validación con cliente

---

### [FITFLOW-74] Documentación Final

**Tipo:** Documentation

**Descripción:** Como equipo, necesitamos completar toda la documentación del proyecto

**Criterios de Aceptación:**

- [ ] Manual de usuario (PDF)
- [ ] Guía de instalación para el cliente
- [ ] Documentación técnica (arquitectura, APIs)
- [ ] README actualizado en repositorio
- [ ] Video tutorial de uso (opcional)

---

### [FITFLOW-75] Despliegue en Producción (Azure)

**Tipo:** DevOps

**Descripción:** Como equipo, necesitamos desplegar la aplicación en el ambiente de producción

**Criterios de Aceptación:**

- [ ] Frontend desplegado en Azure Static Web Apps
- [ ] Backend desplegado en Azure App Service
- [ ] Base de datos MySQL en Azure Database
- [ ] Configuración de dominios y SSL
- [ ] Variables de entorno configuradas
- [ ] Backups automáticos configurados
- [ ] Monitoreo básico activo

---

## Estado de Implementación - Tareas Requeridas

| ID         | Funcionalidad                               | Estado       | Notas                                                                   |
| :--------- | :------------------------------------------ | :----------- | :---------------------------------------------------------------------- |
| FITFLOW-10 | Configuración de Repositorio                | ✅ COMPLETO  | Monorepo, README, .gitignore, estructura Angular/NestJS, package.json   |
| FITFLOW-11 | Diseño de Arquitectura                      | ✅ COMPLETO  | ARCHITECTURE.md con diagramas Mermaid, modelo de datos, PWA             |
| FITFLOW-12 | Modelo de Base de Datos                     | ✅ COMPLETO  | User, MembershipType, Membership, Payment, Exercise, Routine, etc.      |
| FITFLOW-13 | Taller de Deploy                            | ✅ COMPLETO  | Documentación externa al repositorio                                    |
| FITFLOW-14 | API de Registro                             | ✅ COMPLETO  | POST /auth/register, validación, bcrypt, rol por defecto                |
| FITFLOW-15 | Formulario de Registro                      | ✅ COMPLETO  | Formulario con validaciones, campos requeridos, responsive              |
| FITFLOW-16 | API de Login/JWT                            | ✅ COMPLETO  | POST /auth/login, JWT con payload, refresh token, guards                |
| FITFLOW-17 | Formulario de Login                         | ✅ COMPLETO  | Formulario, localStorage, interceptor, manejo errores                   |
| FITFLOW-18 | Sistema de Logout                           | ✅ COMPLETO  | Botón en navbar, elimina tokens, redirige, limpia estado                |
| FITFLOW-19 | Sistema de Roles (Backend)                  | ✅ COMPLETO  | Roles enum, @Roles decorator, RolesGuard                                |
| FITFLOW-20 | Rutas Protegidas (Frontend)                 | ✅ COMPLETO  | AuthGuard, RoleGuard, rutas protegidas, dashboard por rol               |
| FITFLOW-21 | API Recuperación Contraseña                 | ⚠️ PARCIAL   | Endpoints creados. Falta: envío real de email                           |
| FITFLOW-22 | Flujo Recuperación Contraseña               | ✅ COMPLETO  | Link en login, formulario solicitud, página reset, feedback             |
| FITFLOW-23 | API Tipos de Membresía                      | ✅ COMPLETO  | CRUD completo con validaciones y roles                                  |
| FITFLOW-24 | Panel Tipos de Membresía                    | ✅ COMPLETO  | Lista, formulario crear/editar, eliminar, solo admin                    |
| FITFLOW-25 | API de Pagos                                | ✅ COMPLETO  | CRUD completo con validaciones y roles                                  |
| FITFLOW-26 | Formulario de Pagos                         | ✅ COMPLETO  | Formulario crear/editar pago, selección membresía                       |
| FITFLOW-27 | Lista de Pagos                              | ✅ COMPLETO  | Lista con tabla, filtros, acciones, solo admin                          |
| FITFLOW-28 | API Dashboard Financiero                    | ✅ COMPLETO  | GET /dashboard/financial con KPIs, morosos, vencimientos                |
| FITFLOW-29 | Dashboard Financiero                        | ✅ COMPLETO  | KPIs, gráfico ingresos, distribución pagos, morosos                     |
| FITFLOW-30 | Generación de Códigos QR                    | ✅ COMPLETO  | QrService con JWT, endpoints GET /users/:id/qr y /profile/me/qr         |
| FITFLOW-31 | Visualización de QR Personal                | ✅ COMPLETO  | Página Mi QR con fullscreen, descarga PNG, instrucciones                |
| FITFLOW-32 | API Validación de Acceso por QR             | ✅ COMPLETO  | POST /access/validate-qr, verificación membresía, registro accesos      |
| FITFLOW-33 | Lector de QR para Control de Acceso         | ✅ COMPLETO  | Escáner QR con html5-qrcode, feedback visual, historial paginado        |
| FITFLOW-34 | API de Historial de Asistencia              | ✅ COMPLETO  | Módulo attendance, stats por día/mes, permisos por rol                  |
| FITFLOW-35 | Visualización Historial de Asistencia       | ✅ COMPLETO  | Calendario, contador, gráficos, vista admin                             |
| FITFLOW-36 | Sistema de Notificaciones Firebase          | ✅ COMPLETO  | NotificationsModule, DeviceToken, templates, FCM SDK                    |
| FITFLOW-37 | Gestión de Notificaciones Push              | ✅ COMPLETO  | PushNotificationsService, NotificationsState, UI components             |
| FITFLOW-38 | Cron Job Notificaciones Automáticas         | ✅ COMPLETO  | SchedulerModule, 3 cron jobs, constantes configurables                  |
| FITFLOW-39 | API de Biblioteca de Ejercicios             | ✅ COMPLETO  | CRUD ejercicios, filtros avanzados, equipment enum, seed 156 ejercicios |
| FITFLOW-40 | Biblioteca de Ejercicios para Entrenador    | ✅ COMPLETO  | Grid/lista, filtros, detail page, form con equipment                    |
| FITFLOW-41 | API Completa de Rutinas                     | ✅ COMPLETO  | CRUD + filtro createdBy + assign + suggestedWeight                      |
| FITFLOW-42 | Constructor Visual de Rutinas (Drag & Drop) | ✅ COMPLETO  | CDK Drag&Drop, panel ejercicios, días semana, config sets/reps/peso     |
| FITFLOW-43 | Sistema de Plantillas de Rutinas            | ✅ COMPLETO  | Submódulo templates, 3 endpoints, enum TemplateCategory                 |
| FITFLOW-44 | Gestión de Plantillas de Rutinas            | ✅ COMPLETO  | Templates page, save/use dialogs, category filter                       |
| FITFLOW-45 | Asignación de Rutinas a Usuarios            | ✅ COMPLETO  | AssignRoutineDialog, bulk assign, user search, notifications            |
| FITFLOW-46 | API de Rutinas del Usuario                  | ✅ COMPLETO  | GET /user-routines/today con historial de última sesión                 |
| FITFLOW-47 | Visualización de Rutina del Día (Socio)     | ✅ COMPLETO  | TodayRoutine page, week navigation, workout flow, add/remove sets       |
| FITFLOW-48 | API de Registro de Progreso                 | ✅ COMPLETO  | RIR/RPE fields, bulk endpoint, validaciones                             |
| FITFLOW-49 | Registro de Progreso en Rutina              | ✅ COMPLETO  | Auto-save, +/- buttons, peso sugerido, feedback visual                  |
| FITFLOW-50 | Detección de Personal Records               | ✅ COMPLETO  | PersonalRecordsModule, hooks en WorkoutsService, notificaciones PR      |
| FITFLOW-51 | Notificación y Visualización de PR          | ✅ COMPLETO  | Modal celebración, página Mis Récords, badges por hitos                 |
| FITFLOW-52 | API de Estadísticas y Progreso              | ✅ COMPLETO  | Módulo stats/, 6 endpoints, detección estancamiento, volumen por grupo  |
| FITFLOW-53 | Gráficos de Evolución de Progreso           | ✅ COMPLETO  | Página /profile/progress, 3 gráficos Chart.js, comparativas mensuales   |
| FITFLOW-54 | Historial de Rutinas por Usuario (BE)       | ✅ COMPLETO  | endDate auto-set, GET /user-routines/my-history, duración calculada     |
| FITFLOW-55 | Historial de Rutinas (FE)                   | ✅ COMPLETO  | Grid de cards, stats, navegación desde Mi Semana                        |
| FITFLOW-56 | Configuración PWA / Service Workers         | ✅ COMPLETO  | PwaService, manifest.webmanifest, ngsw-config, install/update prompts   |
| FITFLOW-57 | Sistema de Sincronización Offline           | ✅ COMPLETO  | Dexie.js, IndexedDB, sync queue, auto-sync, UI indicators               |
| FITFLOW-58 | WebSocket Server                            | ✅ COMPLETO  | Gateway NestJS, events, auth, RealtimeService                           |
| FITFLOW-59 | Cliente WebSocket y Sincronización Realtime | ✅ COMPLETO  | WebSocketService con signals, auto-reconnect, integration con auth      |
| FITFLOW-60 | Testing Rendimiento y Optimización          | ✅ COMPLETO  | PreloadAllModules, OnPush, @defer, Lighthouse CI, Artillery             |
| FITFLOW-61 | API Dashboard Unificado                     | ✅ COMPLETO  | GET /dashboard polimórfico, Admin + Trainer DTOs                        |
| FITFLOW-62 | Dashboard Principal por Rol                 | ✅ COMPLETO  | Widget-based architecture, 3 dashboards por rol                         |
| FITFLOW-63 | API de Reportes Exportables                 | ⬜ PENDIENTE | Endpoints para PDF/Excel                                                |
| FITFLOW-64 | Generación y Exportación de Reportes        | ⬜ PENDIENTE | UI Reportes, filtros y descarga                                         |
| FITFLOW-65 | API de Comunicación Trainer-Usuario         | ⬜ PENDIENTE | Mensajería, WS events, unread count                                     |
| FITFLOW-66 | Chat Trainer-Usuario                        | ⬜ PENDIENTE | UI Chat, realtime, imágenes                                             |
| FITFLOW-67 | Panel Notificaciones Personalizadas         | ⬜ PENDIENTE | Envío manual a grupos de usuarios                                       |
| FITFLOW-68 | Detección Usuarios Baja Asistencia          | ⬜ PENDIENTE | Cron job mensual, lista de alerta                                       |
| FITFLOW-69 | Lista de Usuarios para Retención            | ⬜ PENDIENTE | UI Dashboard alerta, acciones rápidas                                   |
| FITFLOW-70 | Pulido Final de UI/UX                       | ⬜ PENDIENTE | Consistencia, animaciones, a11y, onboarding                             |
| FITFLOW-71 | Testing de Integración E2E                  | ⬜ PENDIENTE | Cypress/Playwright suite                                                |
| FITFLOW-72 | UAT con Cliente                             | ⬜ PENDIENTE | Validación final y firma                                                |
| FITFLOW-73 | Ajustes Post-UAT                            | ⬜ PENDIENTE | Correcciones finales                                                    |
| FITFLOW-74 | Documentación Final                         | ⬜ PENDIENTE | Manuales y guías técnicas                                               |
| FITFLOW-75 | Despliegue en Producción                    | ⬜ PENDIENTE | Azure full deployment                                                   |

---

## Tareas Secundarias

Tareas adicionales implementadas durante el desarrollo que complementan las funcionalidades requeridas.

### Ejercicios y Grupos Musculares

| Tarea                    | Estado      | Descripción                                         |
| :----------------------- | :---------- | :-------------------------------------------------- |
| API de Ejercicios        | ✅ COMPLETO | CRUD completo, filtro por grupo muscular            |
| Panel de Ejercicios      | ✅ COMPLETO | Lista, formulario crear/editar, filtros por músculo |
| API de Grupos Musculares | ✅ COMPLETO | GET /muscle-groups, seed automático con 10 grupos   |

### Rutinas y Entrenamiento

| Tarea                 | Estado      | Descripción                                    |
| :-------------------- | :---------- | :--------------------------------------------- |
| API de Rutinas        | ✅ COMPLETO | CRUD rutinas + ejercicios, asignación usuarios |
| Panel de Rutinas      | ✅ COMPLETO | Lista, formulario, gestión ejercicios          |
| Mis Rutinas (Usuario) | ✅ COMPLETO | Vista semanal de rutinas asignadas             |
| Workout Tracking      | ✅ COMPLETO | Componente para registrar entrenamientos       |

### Membresías

| Tarea                  | Estado      | Descripción                                        |
| :--------------------- | :---------- | :------------------------------------------------- |
| API de Membresías      | ✅ COMPLETO | CRUD completo, cancelación, estados                |
| Panel de Membresías    | ✅ COMPLETO | Lista, formulario crear/editar, eliminar, cancelar |
| Auto-fill precio pagos | ✅ COMPLETO | Precio se carga automáticamente desde membresía    |

### Infraestructura y UX

| Tarea                    | Estado      | Descripción                                                  |
| :----------------------- | :---------- | :----------------------------------------------------------- |
| Seeder Automático        | ✅ COMPLETO | Seed de usuarios, ejercicios, rutinas al iniciar             |
| Seeder Expandido         | ✅ COMPLETO | Datos completos: membresías, pagos, vencimientos             |
| ConfirmDialogComponent   | ✅ COMPLETO | Diálogo de confirmación reutilizable                         |
| Diálogos de confirmación | ✅ COMPLETO | Aplicado a: ejercicios, membresías, tipos, pagos             |
| FITFLOW-00: Nuevo Layout | ✅ COMPLETO | Sidebar responsive con Lucide Icons, menú dinámico por roles |

---

## Resumen

### Estado General del Proyecto

- **FITFLOW-10 a FITFLOW-62 (Core & Features):** 52 ✅ / 1 ⚠️
- **FITFLOW-63 a FITFLOW-75 (Final Phase):** 0 ✅ / 13 ⬜

### Total

- ✅ **Completadas:** 52 + 15 secundarias = 67
- ⬜ **Pendientes:** 13
- ⚠️ **Parciales:** 1 (Email Service)

---

## Próximos Pasos Recomendados

### Sprint 16: Reportes y Comunicación

1. **FITFLOW-63/64:** Implementar motor de reportes para administración.
2. **FITFLOW-65/66:** Desarrollar sistema de chat en tiempo real aprovechando la infraestructura WebSocket existente.
3. **FITFLOW-67:** Panel de notificaciones masivas.

### Sprint 17: Retención y Pulido

1. **FITFLOW-68/69:** Sistema de alerta de baja asistencia (Retención).
2. **FITFLOW-70:** Sprint dedicado exclusivamente a UI/UX y Onboarding.
3. **FITFLOW-71:** Escritura de tests E2E críticos.

### Sprint 18: Lanzamiento

1. **FITFLOW-72/73:** UAT y ajustes finales.
2. **FITFLOW-74:** Documentación.
3. **FITFLOW-75:** Despliegue final en Producción.
