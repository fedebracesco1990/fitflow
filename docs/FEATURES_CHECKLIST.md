# Checklist de Funcionalidades

Backlog del Proyecto - Sistema de Gestión de Gimnasio

---

## Funcionalidades Requeridas

### [FITFLOW-10] Configuración de Repositorio y Estructura del Proyecto

**Tipo:** DevOps / Configuración

**Descripción:** Como equipo de desarrollo, necesitamos configurar los repositorios y la estructura base del proyecto.

**Criterios de Aceptación:**

- [ ] Repositorio Git creado con estructura monorepo o repos separados
- [ ] README.md con instrucciones de setup
- [ ] .gitignore configurado
- [ ] Estructura de carpetas frontend (Angular) y backend (NestJS)
- [ ] Package.json con dependencias base

---

### [FITFLOW-11] Diseño de Arquitectura del Sistema

**Tipo:** Arquitectura

**Descripción:** Como arquitecto del sistema, necesito documentar la arquitectura cliente-servidor y las decisiones técnicas.

**Criterios de Aceptación:**

- [ ] Diagrama de arquitectura en Confluence/Wiki
- [ ] Especificación de API REST (endpoints principales)
- [ ] Estrategia de autenticación definida (JWT)
- [ ] Decisiones sobre PWA documentadas

---

### [FITFLOW-12] Diseño del Modelo de Base de Datos

**Tipo:** Backend / Base de Datos

**Descripción:** Como desarrollador backend, necesito diseñar el modelo de datos completo del sistema.

**Criterios de Aceptación:**

- [ ] Diagrama ER completo
- [ ] Definición de tablas: Usuario, Rol, Membresía, TipoMembresía, Pago, Ejercicio, Rutina, RegistroEjercicio, PersonalRecord, ClaseGrupal, Asistencia
- [ ] Índices y constraints documentados
- [ ] Scripts de migración iniciales (TypeORM/Prisma)

---

### [FITFLOW-13] Taller de Deploy y DevOps

**Tipo:** DevOps

**Descripción:** Como equipo, necesitamos aprender sobre estrategias de despliegue.

**Criterios de Aceptación:**

- [ ] Participación en taller
- [ ] Documentación de aprendizajes clave
- [ ] Plan de deploy definido (Azure)

---

### [FITFLOW-14] API de Registro de Usuarios

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear los endpoints de registro para que los usuarios puedan crear cuentas.

**Criterios de Aceptación:**

- [ ] POST /api/auth/register creado
- [ ] Validación de datos (email único, password seguro)
- [ ] Hashing de contraseñas con bcrypt
- [ ] Creación de usuario en BD con rol por defecto
- [ ] Tests unitarios de validación

---

### [FITFLOW-15] Formulario de Registro

**Tipo:** Frontend

**Descripción:** Como usuario nuevo, quiero registrarme en el sistema para poder acceder a la plataforma.

**Criterios de Aceptación:**

- [ ] Formulario de registro con validaciones
- [ ] Campos: nombre, email, password, confirmar password
- [ ] Manejo de errores del backend
- [ ] Redirección al login tras registro exitoso
- [ ] Responsive design

---

### [FITFLOW-16] API de Login y Generación JWT

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito implementar el sistema de autenticación con JWT.

**Criterios de Aceptación:**

- [ ] POST /api/auth/login creado
- [ ] Validación de credenciales
- [ ] Generación de JWT con payload (userId, role)
- [ ] Refresh token strategy implementada
- [ ] Guards de autenticación configurados

---

### [FITFLOW-17] Formulario de Login

**Tipo:** Frontend

**Descripción:** Como usuario registrado, quiero iniciar sesión para acceder a mi cuenta.

**Criterios de Aceptación:**

- [ ] Formulario de login (email, password)
- [ ] Almacenamiento seguro del token JWT
- [ ] HTTP Interceptor para añadir token a requests
- [ ] Redirección según rol (admin/entrenador/socio)
- [ ] Manejo de errores de autenticación

---

### [FITFLOW-18] Sistema de Cierre de Sesión

**Tipo:** Frontend

**Descripción:** Como usuario autenticado, quiero cerrar sesión de forma segura.

**Criterios de Aceptación:**

- [ ] Botón de logout visible en navbar
- [ ] Eliminación del token del storage
- [ ] Redirección a página de login
- [ ] Limpieza del estado global

---

### [FITFLOW-19] Sistema de Roles y Permisos

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito implementar el sistema de roles con permisos diferenciados.

**Criterios de Aceptación:**

- [ ] Tabla Roles en BD (Admin, Entrenador, Socio)
- [ ] Decoradores @Roles() para proteger endpoints
- [ ] RolesGuard implementado
- [ ] Endpoints protegidos según rol
- [ ] Tests de autorización

---

### [FITFLOW-20] Rutas Protegidas y Guards

**Tipo:** Frontend

**Descripción:** Como sistema, necesito proteger las rutas según el rol del usuario.

**Criterios de Aceptación:**

- [ ] AuthGuard implementado
- [ ] RoleGuard implementado
- [ ] Rutas protegidas en routing
- [ ] Redirección automática si no autorizado
- [ ] Diferentes dashboards por rol

---

### [FITFLOW-21] API de Recuperación de Contraseña

**Tipo:** Backend

**Descripción:** Como usuario, necesito poder recuperar mi contraseña si la olvido.

**Criterios de Aceptación:**

- [ ] POST /api/auth/forgot-password creado
- [ ] Generación de token temporal
- [ ] Envío de email con link de recuperación
- [ ] POST /api/auth/reset-password creado
- [ ] Validación de token temporal

---

### [FITFLOW-22] Flujo de Recuperación de Contraseña

**Tipo:** Frontend

**Descripción:** Como usuario, quiero recuperar mi contraseña desde la interfaz.

**Criterios de Aceptación:**

- [ ] Link "¿Olvidaste tu contraseña?" en login
- [ ] Formulario para solicitar recuperación
- [ ] Página de reset con validación de token
- [ ] Feedback de éxito/error

---

### [FITFLOW-23] API de Gestión de Tipos de Membresía

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear el CRUD de tipos de membresía.

**Criterios de Aceptación:**

- [ ] GET /api/membership-types
- [ ] POST /api/membership-types (solo admin)
- [ ] PUT /api/membership-types/:id
- [ ] DELETE /api/membership-types/:id
- [ ] Campos: nombre, precio, duración, descripción, días de gracia

---

### [FITFLOW-24] Panel de Gestión de Tipos de Membresía

**Tipo:** Frontend

**Descripción:** Como administrador, quiero gestionar los tipos de membresía disponibles.

**Criterios de Aceptación:**

- [ ] Tabla con lista de tipos de membresía
- [ ] Formulario de creación/edición
- [ ] Confirmación de eliminación
- [ ] Validaciones de campos

---

### [FITFLOW-25] API de Gestión de Pagos

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear los endpoints para registrar y consultar pagos.

**Criterios de Aceptación:**

- [ ] POST /api/payments (registrar pago)
- [ ] GET /api/payments (con filtros: usuario, fecha, estado)
- [ ] GET /api/payments/:id
- [ ] GET /api/payments/user/:userId/status (estado de cuenta)
- [ ] Cálculo automático de vencimientos
- [ ] Identificación de morosos

---

### [FITFLOW-26] Formulario de Registro de Pagos

**Tipo:** Frontend

**Descripción:** Como administrador/staff, quiero registrar pagos de los socios.

**Criterios de Aceptación:**

- [ ] Selector de usuario (autocomplete)
- [ ] Campos: monto, método de pago, fecha, concepto
- [ ] Validación de campos
- [ ] Confirmación visual de registro exitoso
- [ ] Actualización automática de estado del socio

---

### [FITFLOW-27] Lista y Consulta de Pagos

**Tipo:** Frontend

**Descripción:** Como administrador, quiero consultar el historial de pagos con filtros.

**Criterios de Aceptación:**

- [ ] Tabla paginada de pagos
- [ ] Filtros: usuario, rango de fechas, método de pago
- [ ] Indicador visual de estado (al día, vencido)
- [ ] Exportación a Excel/PDF
- [ ] Vista detallada del estado de cuenta por usuario

---

### [FITFLOW-28] API de Dashboard Financiero

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito crear endpoints para métricas financieras.

**Criterios de Aceptación:**

- [ ] GET /api/dashboard/financial
- [ ] KPIs: total recaudado mes actual, morosos, vencimientos próximos (7 días)
- [ ] Distribución de pagos por método
- [ ] Gráfico de ingresos mensuales (últimos 6 meses)

---

### [FITFLOW-29] Dashboard Financiero

**Tipo:** Frontend

**Descripción:** Como administrador, quiero visualizar métricas financieras clave del gimnasio.

**Criterios de Aceptación:**

- [ ] Cards con KPIs principales
- [ ] Gráfico de ingresos mensuales (Chart.js)
- [ ] Lista de morosos con acciones rápidas
- [ ] Lista de vencimientos próximos
- [ ] Actualización en tiempo real

---

### [FITFLOW-30] Generación de Códigos QR por Usuario

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito generar códigos QR únicos para cada usuario.

**Criterios de Aceptación:**

- [ ] Generación de UUID único por usuario al crear cuenta
- [ ] GET /api/users/:id/qr (devuelve imagen QR)
- [ ] QR contiene: userId encriptado, timestamp
- [ ] Regeneración de QR si es necesario

---

### [FITFLOW-31] Visualización de QR Personal

**Tipo:** Frontend

**Descripción:** Como socio, quiero ver mi código QR para poder ingresar al gimnasio.

**Criterios de Aceptación:**

- [ ] Página "Mi QR" en perfil de usuario
- [ ] Visualización del QR en tamaño grande
- [ ] Opción de descargar QR
- [ ] Instrucciones de uso

---

### [FITFLOW-32] API de Validación de Acceso por QR

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito validar el acceso según el estado de pago al escanear QR.

**Criterios de Aceptación:**

- [ ] POST /api/access/validate-qr
- [ ] Decodificación del QR
- [ ] Validación de estado de pago
- [ ] Validación de tipo de membresía (sala/clase)
- [ ] Registro de ingreso en tabla Asistencia
- [ ] Respuesta: permitido/denegado + razón

---

### [FITFLOW-33] Lector de QR para Control de Acceso

**Tipo:** Frontend

**Descripción:** Como staff del gimnasio, necesito escanear QR para validar el ingreso de los socios.

**Criterios de Aceptación:**

- [ ] Página de escaneo de QR con cámara
- [ ] Integración con WebRTC/librería QR
- [ ] Feedback visual inmediato (verde: permitido, rojo: denegado)
- [ ] Mensaje explicativo del resultado
- [ ] Sonido de confirmación/error
- [ ] Historial de últimos escaneos

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

### [FITFLOW-38] Cron Job de Notificaciones Automáticas

**Tipo:** Backend

**Descripción:** Como sistema, necesito enviar notificaciones automáticas de vencimientos y baja asistencia.

**Criterios de Aceptación:**

- [ ] Cron job diario para revisar vencimientos
- [ ] Notificación 3 días antes del vencimiento
- [ ] Notificación al vencer la cuota
- [ ] Notificación de baja asistencia (<8 visitas/mes)
- [ ] Configuración de días de anticipación

---

## Estado de Implementación - Tareas Requeridas

| ID         | Funcionalidad                         | Estado       | Notas                                                                 |
| ---------- | ------------------------------------- | ------------ | --------------------------------------------------------------------- |
| FITFLOW-10 | Configuración de Repositorio          | ✅ COMPLETO  | Monorepo, README, .gitignore, estructura Angular/NestJS, package.json |
| FITFLOW-11 | Diseño de Arquitectura                | ✅ COMPLETO  | ARCHITECTURE.md con diagramas Mermaid, modelo de datos, PWA           |
| FITFLOW-12 | Modelo de Base de Datos               | ✅ COMPLETO  | User, MembershipType, Membership, Payment, Exercise, Routine, etc.    |
| FITFLOW-13 | Taller de Deploy                      | ✅ COMPLETO  | Documentación externa al repositorio                                  |
| FITFLOW-14 | API de Registro                       | ✅ COMPLETO  | POST /auth/register, validación, bcrypt, rol por defecto              |
| FITFLOW-15 | Formulario de Registro                | ✅ COMPLETO  | Formulario con validaciones, campos requeridos, responsive            |
| FITFLOW-16 | API de Login/JWT                      | ✅ COMPLETO  | POST /auth/login, JWT con payload, refresh token, guards              |
| FITFLOW-17 | Formulario de Login                   | ✅ COMPLETO  | Formulario, localStorage, interceptor, manejo errores                 |
| FITFLOW-18 | Sistema de Logout                     | ✅ COMPLETO  | Botón en navbar, elimina tokens, redirige, limpia estado              |
| FITFLOW-19 | Sistema de Roles (Backend)            | ✅ COMPLETO  | Roles enum, @Roles decorator, RolesGuard                              |
| FITFLOW-20 | Rutas Protegidas (Frontend)           | ✅ COMPLETO  | AuthGuard, RoleGuard, rutas protegidas, dashboard por rol             |
| FITFLOW-21 | API Recuperación Contraseña           | ⚠️ PARCIAL   | Endpoints creados. Falta: envío real de email                         |
| FITFLOW-22 | Flujo Recuperación Contraseña         | ✅ COMPLETO  | Link en login, formulario solicitud, página reset, feedback           |
| FITFLOW-23 | API Tipos de Membresía                | ✅ COMPLETO  | CRUD completo con validaciones y roles                                |
| FITFLOW-24 | Panel Tipos de Membresía              | ✅ COMPLETO  | Lista, formulario crear/editar, eliminar, solo admin                  |
| FITFLOW-25 | API de Pagos                          | ✅ COMPLETO  | CRUD completo con validaciones y roles                                |
| FITFLOW-26 | Formulario de Pagos                   | ✅ COMPLETO  | Formulario crear/editar pago, selección membresía                     |
| FITFLOW-27 | Lista de Pagos                        | ✅ COMPLETO  | Lista con tabla, filtros, acciones, solo admin                        |
| FITFLOW-28 | API Dashboard Financiero              | ✅ COMPLETO  | GET /dashboard/financial con KPIs, morosos, vencimientos              |
| FITFLOW-29 | Dashboard Financiero                  | ✅ COMPLETO  | KPIs, gráfico ingresos, distribución pagos, morosos                   |
| FITFLOW-30 | Generación de Códigos QR              | ✅ COMPLETO  | QrService con JWT, endpoints GET /users/:id/qr y /profile/me/qr       |
| FITFLOW-31 | Visualización de QR Personal          | ✅ COMPLETO  | Página Mi QR con fullscreen, descarga PNG, instrucciones              |
| FITFLOW-32 | API Validación de Acceso por QR       | ✅ COMPLETO  | POST /access/validate-qr, verificación membresía, registro accesos    |
| FITFLOW-33 | Lector de QR para Control de Acceso   | ✅ COMPLETO  | Escáner QR con html5-qrcode, feedback visual, historial paginado      |
| FITFLOW-34 | API de Historial de Asistencia        | ✅ COMPLETO  | Módulo attendance, stats por día/mes, permisos por rol                |
| FITFLOW-35 | Visualización Historial de Asistencia | ✅ COMPLETO  | Calendario, contador, gráficos, vista admin                           |
| FITFLOW-36 | Sistema de Notificaciones Firebase    | ✅ COMPLETO  | NotificationsModule, DeviceToken, templates, FCM SDK                  |
| FITFLOW-37 | Gestión de Notificaciones Push        | ✅ COMPLETO  | PushNotificationsService, NotificationsState, UI components           |
| FITFLOW-38 | Cron Job Notificaciones Automáticas   | ⬜ PENDIENTE | Recordatorios vencimientos, baja asistencia                           |

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

### Tareas Requeridas (FITFLOW-10 a FITFLOW-38)

- ✅ **Completadas:** 27
- ⚠️ **Parciales:** 1 (FITFLOW-21 - falta envío real de email)
- ⬜ **Pendientes:** 1 (FITFLOW-38)
- **Total:** 29 tareas

### Tareas Secundarias

- ✅ **Completadas:** 15

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

3. **FITFLOW-34 a FITFLOW-35**: Historial de Asistencia
   - APIs de consulta de asistencia
   - Dashboard personal de asistencias

### Prioridad Media-Baja

4. **FITFLOW-36 a FITFLOW-38**: Sistema de Notificaciones
   - Integración con Firebase Cloud Messaging
   - Notificaciones push en frontend
   - Cron jobs para notificaciones automáticas

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

### Sprint 8 - Sistema de Notificaciones (2 semanas)

- FITFLOW-36: Integración Firebase
- FITFLOW-37: Notificaciones Push Frontend
- FITFLOW-38: Cron Jobs Automáticos
- FITFLOW-21: Completar envío de emails
