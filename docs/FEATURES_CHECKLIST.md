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

**Descripción:** Como desarrollador backend, necesito validar el acceso segÃºn el estado de pago al escanear QR.

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

### [FITFLOW-42] Constructor Visual de Rutinas (Drag & Drop)

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

### [FITFLOW-43] Sistema de Plantillas de Rutinas

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito permitir guardar rutinas como plantillas reutilizables

**Criterios de Aceptación:**

- [ ] Flag isTemplate en tabla Rutinas
- [ ] GET /api/routines/templates (listar plantillas)
- [ ] POST /api/routines/:id/save-as-template
- [ ] POST /api/routines/from-template/:templateId (duplicar)
- [ ] Categorización de plantillas (fuerza, hipertrofia, etc.)

---

### [FITFLOW-44] Gestión de Plantillas de Rutinas

**Tipo:** Frontend

**Descripción:** Como entrenador, quiero guardar y reutilizar plantillas de rutinas

**Criterios de Aceptación:**

- [ ] Botón "Guardar como plantilla" en editor de rutinas
- [ ] Modal de categorización de plantilla
- [ ] Sección "Mis Plantillas" con grid de plantillas
- [ ] Botón "Usar plantilla" que carga en editor
- [ ] Preview de plantilla antes de usar

---

### [FITFLOW-45] Asignación de Rutinas a Usuarios

**Tipo:** Frontend

**Descripción:** Como entrenador, quiero asignar rutinas a mis alumnos

**Criterios de Aceptación:**

- [ ] Selector múltiple de usuarios
- [ ] Fecha de inicio de rutina
- [ ] Opción de clonar rutina por usuario o compartir
- [ ] Confirmación de asignación
- [ ] Notificación al usuario de nueva rutina

---

### [FITFLOW-46] API de Rutinas del Usuario

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para que los usuarios accedan a sus rutinas

**Criterios de Aceptación:**

- [ ] GET /api/users/:userId/routines (rutinas activas)
- [ ] GET /api/users/:userId/routines/history (historial)
- [ ] GET /api/routines/:id/today (rutina del día actual)
- [ ] Cálculo de día de la semana para mostrar ejercicios

---

### [FITFLOW-47] Visualización de Rutina del Día (Socio)

**Tipo:** Frontend

**Descripción:** Como socio, quiero ver mi rutina del día con los ejercicios que debo hacer

**Criterios de Aceptación:**

- [ ] Página "Mi Rutina de Hoy"
- [ ] Lista de ejercicios del día con imagen
- [ ] Visualización de: sets, reps, peso sugerido
- [ ] Navegación entre días de la semana
- [ ] Acceso offline (PWA)

---

### [FITFLOW-48] API de Registro de Progreso

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito endpoints para registrar el progreso de entrenamientos

**Criterios de Aceptación:**

- [ ] POST /api/workout-logs (registrar sesión completa)
- [ ] POST /api/exercise-logs (registrar ejercicio individual)
- [ ] Campos por set: peso, reps completadas, RIR/RPE
- [ ] Timestamp automático
- [ ] Asociación con usuario, rutina y ejercicio

---

### [FITFLOW-49] Registro de Progreso en Rutina

**Tipo:** Frontend

**Descripción:** Como socio, quiero registrar los pesos y repeticiones que realicé en cada ejercicio

**Criterios de Aceptación:**

- [ ] Botones +/- para ajustar peso por set
- [ ] Checkbox para marcar set completado
- [ ] Visualización del peso usado la sesión anterior
- [ ] Guardado automático en segundo plano
- [ ] Feedback visual de guardado exitoso
- [ ] Sincronización cuando vuelva conexión (offline)

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

### [FITFLOW-51] Notificación y Visualización de Personal Records

**Tipo:** Frontend

**Descripción:** Como socio, quiero ser notificado cuando rompo un récord personal

**Criterios de Aceptación:**

- [ ] Modal de celebración al lograr PR
- [ ] Animación de confetti/stars
- [ ] Sección "Mis Récords" en perfil
- [ ] Listado de todos los PRs con fecha
- [ ] Insignias/badges por cantidad de PRs

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
| FITFLOW-42 | Constructor Visual de Rutinas (Drag & Drop) | ⬜ PENDIENTE |                                                                         |
| FITFLOW-43 | Sistema de Plantillas de Rutinas            | ⬜ PENDIENTE |                                                                         |
| FITFLOW-44 | Gestión de Plantillas de Rutinas            | ⬜ PENDIENTE |                                                                         |
| FITFLOW-45 | Asignación de Rutinas a Usuarios            | ⬜ PENDIENTE |                                                                         |
| FITFLOW-46 | API de Rutinas del Usuario                  | ⬜ PENDIENTE |                                                                         |
| FITFLOW-47 | Visualización de Rutina del Día (Socio)     | ⬜ PENDIENTE |                                                                         |
| FITFLOW-48 | API de Registro de Progreso                 | ⬜ PENDIENTE |                                                                         |
| FITFLOW-49 | Registro de Progreso en Rutina              | ⬜ PENDIENTE |                                                                         |
| FITFLOW-50 | Detección de Personal Records               | ⬜ PENDIENTE |                                                                         |
| FITFLOW-51 | Notificación y Visualización de PR          | ⬜ PENDIENTE |                                                                         |

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

### Tareas Requeridas (FITFLOW-10 a FITFLOW-39)

- ✅ **Completadas:** 38

### Tareas Nuevas (FITFLOW-40 a FITFLOW-51)

- COMPLETO: 2 (FITFLOW-40, FITFLOW-41)
- PENDIENTE: 10
- Total: 12 tareas

### Tareas Secundarias

- COMPLETO: 15

---

## Próximos Pasos Recomendados

### Prioridad Alta

1. **FITFLOW-21**: Integrar servicio de email real (SendGrid, Nodemailer, etc.)
2. ~~**FITFLOW-31 a FITFLOW-33**: Sistema de QR y Control de Acceso~~ ✅ COMPLETADO
   - ~~Implementar generación de QR~~ ✅ FITFLOW-30 completado
   - ~~Crear página Mi QR en frontend~~ ✅ FITFLOW-31 completado
   - ~~Crear lector de QR para staff~~ ✅ FITFLOW-33 completado
   - ~~Validar acceso según estado de pago~~ ✅ FITFLOW-32 completado

### Prioridad Media

3. ~~**FITFLOW-34 a FITFLOW-35**: Historial de Asistencia~~ ✅ COMPLETADO

   - ~~APIs de consulta de asistencia~~ ✅ FITFLOW-34 completado
   - ~~Dashboard personal de asistencias~~ ✅ FITFLOW-35 completado

4. ~~**FITFLOW-36 a FITFLOW-37**: Sistema de Notificaciones Push~~ ✅ COMPLETADO
   - ~~Integración con Firebase Cloud Messaging~~ ✅ FITFLOW-36 completado
   - ~~Notificaciones push en frontend~~ ✅ FITFLOW-37 completado

### Prioridad Media-Baja

5. ~~**FITFLOW-38**: Cron Jobs de Notificaciones Automáticas~~ ✅ COMPLETADO

   - ~~Recordatorios de vencimientos~~ ✅
   - ~~Alertas de baja asistencia~~ ✅

6. **FITFLOW-40 a FITFLOW-42**: Biblioteca de Ejercicios y Constructor Visual de Rutinas
7. **FITFLOW-43 a FITFLOW-45**: Sistema de Plantillas y Asignación de Rutinas
8. **FITFLOW-46 a FITFLOW-51**: Visualización, Progreso y Personal Records

---

## Sprints Sugeridos

### Sprint 6 - Sistema de QR y Control de Acceso (2 semanas)

- FITFLOW-30: Generación de Códigos QR
- FITFLOW-31: Visualización de QR Personal
- FITFLOW-32: API Validación de Acceso
- FITFLOW-33: Lector de QR

### Sprint 7 - Historial de Asistencia (1 semana)

- FITFLOW-34: API de Historial de Asistencia
- FITFLOW-35: Visualización Historial

### Sprint 8 - Sistema de Notificaciones (2 semanas) ✅ COMPLETO

- ~~FITFLOW-36: Integración Firebase~~ ✅
- ~~FITFLOW-37: Notificaciones Push Frontend~~ ✅
- ~~FITFLOW-38: Cron Jobs Automáticos~~ ✅

### Sprint 9 - Biblioteca de Ejercicios y Rutinas (3 semanas)

- FITFLOW-40: Biblioteca de Ejercicios para Entrenador
- FITFLOW-41: API Completa de Rutinas
- FITFLOW-42: Constructor Visual de Rutinas (Drag & Drop)

### Sprint 10 - Plantillas y Asignación (2 semanas)

- FITFLOW-43: Sistema de Plantillas de Rutinas
- FITFLOW-44: Gestión de Plantillas de Rutinas
- FITFLOW-45: Asignación de Rutinas a Usuarios

### Sprint 11 - Visualización y Progreso del Usuario (2 semanas)

- FITFLOW-46: API de Rutinas del Usuario
- FITFLOW-47: Visualización de Rutina del Día (Socio)
- FITFLOW-48: API de Registro de Progreso

### Sprint 12 - Sistema de Personal Records (2 semanas)

- FITFLOW-49: Registro de Progreso en Rutina
- FITFLOW-50: Detección de Personal Records
- FITFLOW-51: Notificación y Visualización de Personal Records
