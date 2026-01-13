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

- [ ] Trigger/servicio que detecta nuevo PR al guardar log
- [ ] Tabla PersonalRecords con: userId, exerciseId, peso, reps, fecha
- [ ] Actualización automática del PR si se supera
- [ ] GET /api/users/:userId/personal-records
- [ ] Generación de notificación de logro

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

### [FITFLOW-52] API de Estadísticas y Progreso

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para generar estadísticas de progreso

**Criterios de Aceptación:**

- [ ] GET /api/users/:userId/progress/:exerciseId (evolución de un ejercicio)
- [ ] GET /api/users/:userId/volume (volumen total por período)
- [ ] GET /api/users/:userId/stats/monthly (comparativa mensual)
- [ ] Cálculo de estancamientos (sin progreso X semanas)
- [ ] Datos para gráficos de líneas/barras

---

### [FITFLOW-53] Gráficos de Evolución de Progreso

**Tipo:** Frontend

**Descripción:** Como socio, quiero visualizar gráficamente mi evolución en los ejercicios

**Criterios de Aceptación:**

- [ ] Página "Mi Progreso"
- [ ] Selector de ejercicio
- [ ] Gráfico de línea: peso vs fecha (Chart.js)
- [ ] Gráfico de volumen total mensual
- [ ] Comparativa mes actual vs anterior
- [ ] Indicadores de estancamiento
- [ ] Exportación a imagen/PDF

---

### [FITFLOW-54] Historial de Rutinas por Usuario

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito mantener historial de rutinas previas

**Criterios de Aceptación:**

- [ ] Marca de fecha_fin cuando se asigna nueva rutina
- [ ] GET /api/users/:userId/routines/history
- [ ] Información de duración de cada rutina
- [ ] Acceso a rutinas archivadas

---

### [FITFLOW-55] Historial de Rutinas

**Tipo:** Frontend

**Descripción:** Como socio/entrenador, quiero ver el historial de rutinas previas

**Criterios de Aceptación:**

- [ ] Timeline de rutinas anteriores
- [ ] Vista detallada de rutina archivada
- [ ] Indicador de duración y progreso logrado

---

### [FITFLOW-56] Configuración de PWA con Service Workers

**Tipo:** Frontend

**Descripción:** Como desarrollador frontend, necesito convertir la aplicación en una PWA funcional

**Criterios de Aceptación:**

- [ ] Configuración de @angular/pwa
- [ ] Manifest.json con iconos y configuración
- [ ] Service Worker para caching de assets
- [ ] Estrategias de cache (Network First, Cache First)
- [ ] Precaching de rutas principales
- [ ] Funcionalidad offline para rutinas y progreso
- [ ] Prompt de instalación de PWA

---

### [FITFLOW-57] Sistema de Sincronización Offline

**Tipo:** Frontend

**Descripción:** Como usuario, quiero que mis datos se sincronicen automáticamente cuando recupere conexión

**Criterios de Aceptación:**

- [ ] IndexedDB para almacenamiento local
- [ ] Cola de sincronización para operaciones offline
- [ ] Detección de conectividad (online/offline)
- [ ] Sincronización automática al recuperar conexión
- [ ] Indicador visual de estado de sincronización
- [ ] Manejo de conflictos de datos

---

### [FITFLOW-58] WebSocket Server para Tiempo Real

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito configurar WebSockets para comunicación en tiempo real

**Criterios de Aceptación:**

- [ ] Gateway de WebSockets en NestJS
- [ ] Autenticación de conexiones WS con JWT
- [ ] Rooms por usuario/trainer
- [ ] Eventos: routine.updated, progress.logged, notification.new
- [ ] Manejo de desconexiones

---

### [FITFLOW-59] Cliente WebSocket y Sincronización en Tiempo Real

**Tipo:** Frontend

**Descripción:** Como usuario, quiero ver actualizaciones en tiempo real sin refrescar la página

**Criterios de Aceptación:**

- [ ] Servicio de WebSocket en Angular
- [ ] Conexión automática al autenticar
- [ ] Escucha de eventos del servidor
- [ ] Actualización de UI reactiva (RxJS)
- [ ] Reconexión automática si se pierde conexión

---

### [FITFLOW-60] Testing de Rendimiento y Optimización

**Tipo:** DevOps / Frontend

**Descripción:** Como equipo, necesitamos asegurar que la aplicación cumpla con los requisitos de rendimiento

**Criterios de Aceptación:**

- [ ] Lighthouse audit score >90
- [ ] Lazy loading de módulos implementado
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] Bundle size analysis y optimización
- [ ] Tiempo de carga inicial <3s
- [ ] Tests de carga con herramientas (JMeter/Artillery)

---

### [FITFLOW-61] API de Dashboard Unificado

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito consolidar todas las métricas en un dashboard unificado

**Criterios de Aceptación:**

- [ ] GET /api/dashboard (datos según rol)
- [ ] KPIs financieros: ingresos, morosos, proyección
- [ ] KPIs operativos: asistencias del día, usuarios activos
- [ ] KPIs de entrenamientos: rutinas activas, PRs del mes
- [ ] Datos para gráficos de distribución y tendencias

---

### [FITFLOW-62] Dashboard Principal por Rol

**Tipo:** Frontend

**Descripción:** Como usuario, quiero ver un dashboard personalizado según mi rol al ingresar

**Criterios de Aceptación:**

- [ ] Dashboard Admin: métricas financieras, asistencias, alertas
- [ ] Dashboard Entrenador: mis alumnos, rutinas, próximas sesiones
- [ ] Dashboard Socio: mi rutina, mi progreso, próximo pago
- [ ] Widgets interactivos y navegables
- [ ] Diseño responsive y moderno

---

## Estado de Implementación - Tareas Requeridas

| ID         | Funcionalidad                               | Estado       | Notas                                                                   |
| ---------- | ------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
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
| FITFLOW-21 | API Recuperación ContraseÃ±a                | ⚠️ PARCIAL   | Endpoints creados. Falta: envío real de email                           |
| FITFLOW-22 | Flujo Recuperación ContraseÃ±a              | ✅ COMPLETO  | Link en login, formulario solicitud, página reset, feedback             |
| FITFLOW-23 | API Tipos de MembresÃ­a                     | ✅ COMPLETO  | CRUD completo con validaciones y roles                                  |
| FITFLOW-24 | Panel Tipos de MembresÃ­a                   | ✅ COMPLETO  | Lista, formulario crear/editar, eliminar, solo admin                    |
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
| FITFLOW-38 | Cron Job Notificaciones AutomÃ¡ticas        | ✅ COMPLETO  | SchedulerModule, 3 cron jobs, constantes configurables                  |
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
| FITFLOW-50 | Detección de Personal Records               | ⬜ PENDIENTE |                                                                         |
| FITFLOW-51 | Notificación y Visualización de PR          | ✅ COMPLETO  | Modal celebración, página Mis Récords, badges por hitos                 |
| FITFLOW-52 | API de Estadísticas y Progreso              | ⬜ PENDIENTE | Endpoints evolución ejercicios, volumen, mensual                        |
| FITFLOW-53 | Gráficos de Evolución de Progreso           | ⬜ PENDIENTE | Charts.js, comparativas, exportación                                    |
| FITFLOW-54 | Historial de Rutinas por Usuario (BE)       | ⬜ PENDIENTE | Archivo de rutinas, duración                                            |
| FITFLOW-55 | Historial de Rutinas (FE)                   | ⬜ PENDIENTE | Timeline, vista detallada                                               |
| FITFLOW-56 | Configuración PWA / Service Workers         | ⬜ PENDIENTE | Manifest, SW caching, offline basics                                    |
| FITFLOW-57 | Sistema de Sincronización Offline           | ⬜ PENDIENTE | IndexedDB, sync queue, conectividad                                     |
| FITFLOW-58 | WebSocket Server                            | ⬜ PENDIENTE | Gateway NestJS, events, auth                                            |
| FITFLOW-59 | Cliente WebSocket y Sincronización Realtime | ⬜ PENDIENTE | RxJS, conexión auto, actualización UI                                   |
| FITFLOW-60 | Testing Rendimiento y Optimización          | ⬜ PENDIENTE | Lighthouse >90, lazy loading, bundle size                               |
| FITFLOW-61 | API Dashboard Unificado                     | ⬜ PENDIENTE | KPIs consolidados por rol                                               |
| FITFLOW-62 | Dashboard Principal por Rol                 | ⬜ PENDIENTE | Widgets interactivos, personalización                                   |

---

## Tareas Secundarias

Tareas adicionales implementadas durante el desarrollo que complementan las funcionalidades requeridas.

### Ejercicios y Grupos Musculares

| Tarea                    | Estado      | Descripción                                         |
| ------------------------ | ----------- | --------------------------------------------------- |
| API de Ejercicios        | ✅ COMPLETO | CRUD completo, filtro por grupo muscular            |
| Panel de Ejercicios      | ✅ COMPLETO | Lista, formulario crear/editar, filtros por músculo |
| API de Grupos Musculares | ✅ COMPLETO | GET /muscle-groups, seed automático con 10 grupos   |

### Rutinas y Entrenamiento

| Tarea                 | Estado      | Descripción                                    |
| --------------------- | ----------- | ---------------------------------------------- |
| API de Rutinas        | ✅ COMPLETO | CRUD rutinas + ejercicios, asignación usuarios |
| Panel de Rutinas      | ✅ COMPLETO | Lista, formulario, gestión ejercicios          |
| Mis Rutinas (Usuario) | ✅ COMPLETO | Vista semanal de rutinas asignadas             |
| Workout Tracking      | ✅ COMPLETO | Componente para registrar entrenamientos       |

### Membresías

| Tarea                  | Estado      | Descripción                                        |
| ---------------------- | ----------- | -------------------------------------------------- |
| API de Membresías      | ✅ COMPLETO | CRUD completo, cancelación, estados                |
| Panel de Membresías    | ✅ COMPLETO | Lista, formulario crear/editar, eliminar, cancelar |
| Auto-fill precio pagos | ✅ COMPLETO | Precio se carga automáticamente desde membresía    |

### Infraestructura y UX

| Tarea                    | Estado      | Descripción                                                  |
| ------------------------ | ----------- | ------------------------------------------------------------ |
| Seeder Automático        | ✅ COMPLETO | Seed de usuarios, ejercicios, rutinas al iniciar             |
| Seeder Expandido         | ✅ COMPLETO | Datos completos: membresías, pagos, vencimientos             |
| ConfirmDialogComponent   | ✅ COMPLETO | Diálogo de confirmación reutilizable                         |
| Diálogos de confirmación | ✅ COMPLETO | Aplicado a: ejercicios, membresías, tipos, pagos             |
| FITFLOW-00: Nuevo Layout | ✅ COMPLETO | Sidebar responsive con Lucide Icons, menú dinámico por roles |

---

## Resumen

### Estado General del Proyecto

- **FITFLOW-10 a FITFLOW-39 (Core):** 29 ✅ / 1 ⚠️
- **FITFLOW-40 a FITFLOW-51 (Features):** 11 ✅ / 1 ⬜
- **FITFLOW-52 a FITFLOW-62 (Scale):** 0 ✅ / 11 ⬜

### Total

- ✅ **Completadas:** 40 + 15 secundarias = 55
- ⬜ **Pendientes:** 12
- ⚠️ **Parciales:** 1

---

## Próximos Pasos Recomendados

### Prioridad Crítica (User Experience & Stability)

1. **FITFLOW-56 y 57 (Offline First):** Implementar PWA robusta y sincronización. Fundamental para gimnasios con mala conexión.
2. **FITFLOW-50 (Backend PRs):** Cerrar el ciclo de detección de récords para que la UI (ya lista en FITFLOW-51) tenga datos reales.

### Prioridad Alta (Engagement)

3. **FITFLOW-52 y 53 (Progreso):** Darle valor a los datos que ya se están recolectando mostrando gráficos de evolución.
4. **FITFLOW-61 y 62 (Dashboards):** Mejorar la primera impresión al entrar a la app con datos relevantes.

---

## Sprints Sugeridos

### Sprint 12 - Cierre de Personal Records y Estadísticas (2 semanas)

- FITFLOW-50: Detección de Personal Records (Backend)
- FITFLOW-52: API de Estadísticas y Progreso
- FITFLOW-53: Gráficos de Evolución de Progreso

### Sprint 13 - Offline First & PWA (2 semanas)

- FITFLOW-56: Configuración de PWA con Service Workers
- FITFLOW-57: Sistema de Sincronización Offline
- FITFLOW-54: Historial de Rutinas por Usuario (Backend)
- FITFLOW-55: Historial de Rutinas (Frontend)

### Sprint 14 - Tiempo Real y Dashboards (2 semanas)

- FITFLOW-58: WebSocket Server para Tiempo Real
- FITFLOW-59: Cliente WebSocket
- FITFLOW-61: API de Dashboard Unificado
- FITFLOW-62: Dashboard Principal por Rol

### Sprint 15 - Optimización Final (1 semana)

- FITFLOW-60: Testing de Rendimiento y Optimización
- FITFLOW-21: Finalizar servicio de email (Deuda técnica pendiente)
