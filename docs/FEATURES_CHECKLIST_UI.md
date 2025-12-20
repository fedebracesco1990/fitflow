# Checklist de Funcionalidades UI

Backlog de Mejoras de UI - Sistema de Gestión de Gimnasio FitFlow

**Nota:** Estas tareas buscan mostrar la información/datos como en los diseños, pero **manteniendo la estética/estilos actuales** de la aplicación.

---

## Resumen de Progreso

| Sección                  | Total  | Completadas | Pendientes |
| ------------------------ | ------ | ----------- | ---------- |
| Dashboard Admin          | 8      | 8           | 0          |
| Centro de Reportes       | 7      | 0           | 7          |
| Directorio de Usuarios   | 5      | 0           | 5          |
| Gestión de Entrenamiento | 8      | 0           | 8          |
| Pagos                    | 3      | 0           | 3          |
| Ingresos (Acceso)        | 2      | 0           | 2          |
| Tipos de Membresía       | 3      | 0           | 3          |
| Menú Sidebar             | 1      | 0           | 1          |
| **TOTAL**                | **37** | **8**       | **29**     |

---

## Notas Importantes

### Aclaración: Tipos vs Membresías

- **Tipos (de Membresía)** = Los planes/productos del gimnasio (ej: "Mensual Básico $50", "Anual Pro $500")
- **Membresías** = Asignación de un Tipo a un Usuario con fechas (Usuario + Tipo + Fechas = Membresía)

### Ítems del Menú que se MANTIENEN

- **Tipos** - Catálogo de planes de membresía (Admin)
- **Membresías** - Asignaciones usuario-plan (Admin)
- **Asistencias** - Stats de asistencia (Admin/Trainer)
- **Mis Rutinas** - Rutinas asignadas al miembro logueado (Todos)
- **Mi Perfil** - Perfil del usuario (Todos)

### Ítems NUEVOS a agregar

- **Reportes** - Centro de reportes con tabs (Admin)
- **Directorio** - Lista de usuarios del sistema (Admin)
- **Entrenamiento** - Unifica Rutinas, Ejercicios, Clases en tabs (Admin/Trainer)

### Ítems a RENOMBRAR

- "Escanear QR" → **"Ingresos"** (Admin/Trainer)

### Ítems a ELIMINAR/INTEGRAR

- "Finanzas" → Se integra en Reportes (tab Financiero)

---

## Tareas de Diseño - Dashboard Admin

### [FITFLOW-DS-01] Métricas del Dashboard Admin

**Tipo:** Frontend
**Estado:** ✅ Completada

**Descripción:** Como administrador, quiero ver métricas clave en el dashboard para tener una visión general del estado del gimnasio.

**Criterios de Aceptación:**

- [x] Card "Miembros Activos" con contador de usuarios con membresía vigente
- [x] Card "Expiran Pronto" con contador de membresías por vencer (próximos 7 días)
- [x] Card "Morosos" con contador de usuarios con pagos pendientes
- [x] Card "Ingresos" con monto total del mes actual
- [x] Card "Ingresos Hoy" con monto recaudado en el día
- [x] Card "Rutinas Activas" con contador de rutinas asignadas activas
- [x] Diseño responsive con grid de cards
- [x] Iconos correspondientes para cada métrica

---

### [FITFLOW-DS-02] Tabla Actividad en Vivo

**Tipo:** Frontend / Backend
**Estado:** ✅ Completada

**Descripción:** Como administrador, quiero ver la actividad en tiempo real del gimnasio para monitorear los ingresos del día.

**Criterios de Aceptación:**

- [x] Tabla con columnas: Miembro, Hora, Tipo
- [x] Paginación de 25 elementos por página
- [x] Actualización automática cada 30 segundos + botón refresh manual
- [x] Indicador de tipo de acceso (GYM fijo, clases pendientes)
- [x] Usa endpoint existente GET /api/access/logs con filtro de fecha

---

### [FITFLOW-DS-03] Tabla Pagos Recientes en Dashboard

**Tipo:** Frontend
**Estado:** ✅ Completada

**Descripción:** Como administrador, quiero ver los pagos recientes directamente en el dashboard para un seguimiento rápido.

**Criterios de Aceptación:**

- [x] Tabla con columnas: Miembro, Monto, Fecha
- [x] Mostrar últimos 3 pagos registrados (simplificado para dashboard)
- [x] Formato de monto con símbolo de moneda ($)
- [x] Formato de fecha legible (ej: "18 dic")
- [x] Link a detalle del pago (/payments/:id/edit)
- [x] Botón "Ver todos" que lleva a /payments

---

### [FITFLOW-DS-04] Acciones Rápidas del Dashboard

**Tipo:** Frontend
**Estado:** ✅ Completada

**Descripción:** Como administrador, quiero tener accesos directos a las acciones más frecuentes para agilizar mi trabajo.

**Criterios de Aceptación:**

- [x] Botón "Directorio de Usuarios" - navega a lista de usuarios
- [x] Botón "+ Nuevo Miembro" - abre formulario de crear membresía
- [x] Botón "$ Nuevo Pago" - abre formulario de registrar pago
- [x] Botón "Check-in" - navega a escáner QR
- [x] Diseño con iconos y colores distintivos
- [x] Responsive: botones apilados en mobile

---

### [FITFLOW-DS-05] Exportar Miembros

**Tipo:** Frontend / Backend
**Estado:** ✅ Completada
**Fecha:** 2024-12-19

**Descripción:** Como administrador, quiero exportar la lista de miembros para reportes externos.

**Criterios de Aceptación:**

- [x] Botón "Exportar Miembros" en header del dashboard
- [x] Exportación a formato Excel (.xlsx)
- [x] Incluir datos: nombre, email, membresía, estado, fecha vencimiento
- [x] API endpoint GET /api/users/export
- [x] Descarga automática del archivo

**Implementación:**

- Backend: Endpoint con ExcelJS, query LEFT JOIN, formato DD/MM/YYYY
- Frontend: Botón con icono Download, descarga automática vía Blob
- Archivos: 8 modificados/creados (3 backend, 5 frontend)

---

### [FITFLOW-DS-06] Menú Reportes

**Tipo:** Frontend
**Estado:** ✅ Completado

**Descripción:** Como administrador, quiero acceder a una sección de reportes para análisis detallados.

**Criterios de Aceptación:**

- [x] Item "Reportes" en sidebar (solo Admin)
- [x] Página de reportes con opciones de filtrado
- [x] Reportes disponibles: Ingresos, Asistencia, Membresías
- [x] Gráficos de tendencias (Chart.js)
- [x] Filtros por rango de fechas
- [x] Exportación a Excel

---

### [FITFLOW-DS-07] Menú Directorio de Usuarios

**Tipo:** Frontend / Backend
**Estado:** ✅ Completada
**Fecha:** 2024-12-19

**Descripción:** Como administrador, quiero acceder a un directorio completo de usuarios del gimnasio.

**Criterios de Aceptación:**

- [x] Item "Directorio" en sidebar (solo Admin)
- [x] Lista de todos los usuarios registrados
- [x] Búsqueda por nombre o email
- [x] Filtros por rol, estado de membresía
- [x] Acciones: ver perfil, editar, asignar membresía

**Implementación:**

- Backend: SearchUsersDto, LEFT JOIN con memberships, búsqueda LIKE, filtros
- Frontend: Componente con debounce 300ms, filtros dropdown, paginación, badges
- Archivos: 10 modificados/creados (3 backend, 7 frontend)

---

### [FITFLOW-DS-08] APIs de Métricas del Dashboard

**Tipo:** Backend
**Estado:** ✅ Completada

**Descripción:** Como desarrollador, necesito crear los endpoints para obtener las métricas del dashboard admin.

**Criterios de Aceptación:**

- [x] GET /api/dashboard/stats - Retorna todas las métricas
  - miembrosActivos: número
  - expiranPronto: número
  - morosos: número
  - ingresosMes: número
  - ingresosHoy: número
  - rutinasActivas: número
- [x] Optimización con queries eficientes
- [ ] Cache de métricas (opcional) - No implementado por decisión de diseño
- [ ] Tests unitarios - No implementados por decisión de diseño

**Implementación:**

- Backend: DashboardStatsDto, método getStats() con Promise.all(), endpoint GET /stats
- Frontend: DashboardStats model, método getStats(), HomeComponent actualizado
- Archivos: 8 modificados/creados (4 backend, 4 frontend)
- Respuesta ligera: ~200 bytes vs ~5KB de /financial

---

## Tareas de Diseño - Centro de Reportes

### [FITFLOW-DS-09] Página Centro de Reportes con Tabs

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero acceder a un centro de reportes con diferentes vistas organizadas en tabs.

**Criterios de Aceptación:**

- [ ] Ruta /reports accesible desde sidebar (solo Admin)
- [ ] Header con título "Centro de Reportes"
- [ ] Botón "Exportar CSV" en header
- [ ] Sistema de tabs: "Financiero" y "Uso y Comportamiento (RF29)"
- [ ] Navegación entre tabs sin recargar página
- [ ] Estado activo visible en tab seleccionado

---

### [FITFLOW-DS-10] Reporte Financiero - Filtros y Métricas

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero filtrar reportes financieros por mes y año para ver métricas específicas.

**Criterios de Aceptación:**

- [ ] Selector de Mes (dropdown con meses)
- [ ] Selector de Año (dropdown con años)
- [ ] Card "Ingreso Total" con monto del período
- [ ] Card "Transacciones" con cantidad de pagos
- [ ] Card "Morosos Actuales" con contador
- [ ] Actualización automática al cambiar filtros

---

### [FITFLOW-DS-11] Reporte Financiero - Tabla Desglose de Transacciones

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver el detalle de cada transacción del período seleccionado.

**Criterios de Aceptación:**

- [ ] Tabla con columnas: Fecha, Monto, Método
- [ ] Formato de fecha legible (ej: "18 Dec 19:24")
- [ ] Formato de monto con símbolo de moneda
- [ ] Métodos de pago: Card, Cash, Transfer, etc.
- [ ] Ordenamiento por fecha (más reciente primero)
- [ ] Paginación si hay muchos registros

---

### [FITFLOW-DS-12] Reporte Uso y Comportamiento - Métricas

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver métricas de uso del gimnasio para analizar el comportamiento de los miembros.

**Criterios de Aceptación:**

- [ ] Card "Visitas Prom. (Activos)" - promedio de visitas de miembros activos
- [ ] Card "Visitas Prom. (Morosos)" - promedio de visitas de miembros morosos
- [ ] Card "Rutinas Activas" - cantidad de rutinas asignadas activas
- [ ] Cálculo basado en datos del mes actual

---

### [FITFLOW-DS-13] Reporte Uso y Comportamiento - Tabla Análisis

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver un análisis detallado del comportamiento de cada miembro.

**Criterios de Aceptación:**

- [ ] Tabla con columnas: Miembro, Estado, Visitas Totales, Rutina Activa
- [ ] Estados con badges de color: ACTIVE (verde), OVERDUE (rojo/naranja)
- [ ] Contador de visitas totales por miembro
- [ ] Indicador de rutina activa: Sí/No
- [ ] Ordenamiento y filtrado por estado
- [ ] Link al perfil del miembro

---

### [FITFLOW-DS-14] APIs de Reportes

**Tipo:** Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como desarrollador, necesito crear los endpoints para obtener datos de reportes.

**Criterios de Aceptación:**

- [ ] GET /api/reports/financial?month=X&year=Y
  - ingresoTotal: número
  - transacciones: número
  - morososActuales: número
  - desglose: array de { fecha, monto, metodo }
- [ ] GET /api/reports/behavior
  - visitasPromActivos: número
  - visitasPromMorosos: número
  - rutinasActivas: número
  - analisis: array de { miembro, estado, visitasTotales, rutinaActiva }
- [ ] Optimización con queries eficientes
- [ ] Tests unitarios

---

### [FITFLOW-DS-15] Exportar Reporte a CSV

**Tipo:** Frontend / Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero exportar los datos del reporte actual a un archivo CSV.

**Criterios de Aceptación:**

- [ ] Botón "Exportar CSV" funcional en ambos tabs
- [ ] Exporta datos del tab activo (Financiero o Comportamiento)
- [ ] Incluye filtros aplicados en el nombre del archivo
- [ ] API endpoint GET /api/reports/export?type=financial|behavior
- [ ] Descarga automática del archivo

---

## Tareas de Diseño - Directorio de Usuarios

### [FITFLOW-DS-16] Página Directorio de Usuarios

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero acceder a un directorio completo de todos los usuarios del sistema.

**Criterios de Aceptación:**

- [ ] Ruta /users accesible desde sidebar (solo Admin)
- [ ] Header con título "Directorio de Usuarios"
- [ ] Botón "+ Nuevo Usuario" en header
- [ ] Tabla con columnas: Nombre, Email, Rol, Estado (Membresía)
- [ ] Badges de color para roles: ADMIN, TRAINER, MEMBER
- [ ] Badges de estado: ACTIVO (verde), MOROSO (rojo)
- [ ] Estado "-" para usuarios sin membresía (Admin, Trainer)

---

### [FITFLOW-DS-17] Búsqueda y Filtros de Usuarios

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero buscar y filtrar usuarios para encontrar rápidamente a quien necesito.

**Criterios de Aceptación:**

- [ ] Campo de búsqueda por nombre o email
- [ ] Búsqueda en tiempo real (debounce)
- [ ] Dropdown filtro por rol (Todos, Admin, Trainer, Member)
- [ ] Combinación de búsqueda + filtro
- [ ] Indicador de resultados encontrados

---

### [FITFLOW-DS-18] Formulario Crear Usuario (Admin)

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero crear nuevos usuarios desde el directorio.

**Criterios de Aceptación:**

- [ ] Modal o página de formulario "Nuevo Usuario"
- [ ] Campos: Nombre, Email, Contraseña, Rol (dropdown)
- [ ] Validaciones de formulario
- [ ] Asignación de rol al crear
- [ ] Mensaje de éxito/error
- [ ] Redirección al directorio tras crear

---

### [FITFLOW-DS-19] Eliminar Registro Público

**Tipo:** Frontend / Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como sistema, necesito que solo los administradores puedan crear usuarios nuevos.

**Criterios de Aceptación:**

- [ ] Eliminar link/botón de registro de la página de login
- [ ] Eliminar ruta /register del frontend
- [ ] Mantener API POST /auth/register pero protegerla con rol Admin
- [ ] Actualizar guards y middleware de autenticación
- [ ] Redirigir intentos de acceso a /register hacia /login

---

### [FITFLOW-DS-20] API Gestión de Usuarios

**Tipo:** Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como desarrollador, necesito endpoints para gestionar usuarios desde el directorio.

**Criterios de Aceptación:**

- [ ] GET /api/users - Lista todos los usuarios (solo Admin)
  - Incluir: id, nombre, email, rol, estadoMembresía
  - Soportar query params: search, role
- [ ] POST /api/users - Crear usuario (solo Admin)
- [ ] PUT /api/users/:id - Actualizar usuario (solo Admin)
- [ ] DELETE /api/users/:id - Eliminar usuario (solo Admin)
- [ ] Tests unitarios

---

## Tareas de Diseño - Gestión de Entrenamiento

### [FITFLOW-DS-21] Página Unificada Gestión de Entrenamiento

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero acceder a una página unificada de gestión de entrenamiento con tabs.

**Criterios de Aceptación:**

- [ ] Ruta /training accesible desde sidebar (Admin y Trainer)
- [ ] Header con título "Gestión de Entrenamiento"
- [ ] Sistema de tabs: "Rutinas", "Ejercicios", "Clases"
- [ ] Navegación entre tabs sin recargar página
- [ ] Tab "Ejercicios" solo visible para Admin
- [ ] Tabs "Rutinas" y "Clases" visibles para Admin y Trainer

---

### [FITFLOW-DS-22] Tab Rutinas - Mejoras de UI

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero ver la lista de rutinas con información mejorada.

**Criterios de Aceptación:**

- [ ] Botón "+ Crear Rutina"
- [ ] Tabla con columnas: Nombre, Dificultad, Creada, Acciones
- [ ] Badges de dificultad con colores: BEGINNER, INTERMEDIATE, ADVANCED
- [ ] Formato de fecha legible (ej: "8 Dec, 2025")
- [ ] Acción: Editar (link a formulario de edición)
- [ ] Integrar con rutas existentes de rutinas

---

### [FITFLOW-DS-23] Tab Ejercicios - Mejoras de UI

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver la lista de ejercicios con información de grupo muscular.

**Criterios de Aceptación:**

- [ ] Botón "+ Nuevo Ejercicio"
- [ ] Tabla con columnas: Nombre, Grupo Muscular, Dificultad, Acciones
- [ ] Grupos musculares como texto (Piernas, Pecho, Espalda, etc.)
- [ ] Badges de dificultad con colores
- [ ] Acción: Editar
- [ ] Integrar con rutas existentes de ejercicios

---

### [FITFLOW-DS-24] Sistema de Clases Grupales - Modelo de Datos

**Tipo:** Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como desarrollador, necesito crear el modelo de datos para clases grupales.

**Criterios de Aceptación:**

- [ ] Entidad ClaseGrupal con campos:
  - id, nombre, tipo, fecha, horaInicio, horaFin
  - capacidadMaxima, instructorId
- [ ] Entidad InscripcionClase (relación usuario-clase)
- [ ] Migraciones de base de datos
- [ ] Relaciones: Clase -> Instructor (User), Clase -> Inscripciones

---

### [FITFLOW-DS-25] API de Clases Grupales

**Tipo:** Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como desarrollador, necesito crear los endpoints para gestionar clases grupales.

**Criterios de Aceptación:**

- [ ] GET /api/classes - Lista todas las clases (Admin, Trainer)
- [ ] POST /api/classes - Crear clase (Admin, Trainer)
- [ ] PUT /api/classes/:id - Actualizar clase
- [ ] DELETE /api/classes/:id - Eliminar clase
- [ ] GET /api/classes/:id/attendees - Ver asistentes
- [ ] POST /api/classes/:id/enroll - Inscribir usuario
- [ ] DELETE /api/classes/:id/enroll/:userId - Cancelar inscripción
- [ ] Tests unitarios

---

### [FITFLOW-DS-26] Tab Clases - Frontend

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero gestionar clases grupales desde la página de entrenamiento.

**Criterios de Aceptación:**

- [ ] Botón "+ Agendar Clase"
- [ ] Tabla con columnas: Nombre, Tipo, Fecha, Inscritos, Acciones
- [ ] Tipos de clase: Yoga, Crossfit, Spinning, etc.
- [ ] Formato fecha: "19 Dec, 08:00"
- [ ] Contador de inscritos: "5 / 15" (actual / máximo)
- [ ] Indicador visual cuando clase está llena
- [ ] Acción: Ver Asistentes (abre modal o página)

---

### [FITFLOW-DS-27] Formulario Agendar Clase

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero crear nuevas clases grupales.

**Criterios de Aceptación:**

- [ ] Modal o página de formulario "Agendar Clase"
- [ ] Campos: Nombre, Tipo (dropdown), Fecha, Hora inicio, Hora fin
- [ ] Campo: Capacidad máxima
- [ ] Campo: Instructor (dropdown de trainers)
- [ ] Validaciones de formulario
- [ ] Mensaje de éxito/error

---

### [FITFLOW-DS-28] Modal Ver Asistentes

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero ver la lista de asistentes inscritos en una clase.

**Criterios de Aceptación:**

- [ ] Modal con lista de usuarios inscritos
- [ ] Mostrar: Nombre, Email, Fecha inscripción
- [ ] Botón para remover asistente
- [ ] Botón para agregar asistente manualmente
- [ ] Indicador de capacidad restante

---

## Tareas de Diseño - Pagos

### [FITFLOW-DS-29] Mejoras UI Lista de Pagos

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver la lista de pagos con información de cobertura.

**Criterios de Aceptación:**

- [ ] Header con título "Pagos"
- [ ] Botón "+ Registrar Pago" (abre modal)
- [ ] Tabla con columnas: Miembro, Monto, Método, Fecha, Cobertura, Acciones
- [ ] Columna Cobertura: rango de fechas "31 Oct - 29 Nov"
- [ ] Formato de monto con símbolo de moneda
- [ ] Formato de fecha con hora
- [ ] Métodos con texto legible: Card, Cash, Transfer
- [ ] Acción: Editar

---

### [FITFLOW-DS-30] Modal Registrar Pago

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero registrar pagos usando un modal en lugar de navegar a otra página.

**Criterios de Aceptación:**

- [ ] Modal "Registrar Pago" en lugar de página separada
- [ ] Campo: Miembro (dropdown con búsqueda)
- [ ] Campo: Monto (input numérico)
- [ ] Campo: Método (dropdown: Tarjeta, Efectivo, Transferencia)
- [ ] Campo: Cobertura Desde (date picker)
- [ ] Campo: Cobertura Hasta (date picker)
- [ ] Auto-cálculo de Cobertura Hasta basado en tipo de membresía
- [ ] Botón "Cancelar" cierra modal
- [ ] Botón "Registrar Pago" guarda y cierra
- [ ] Validaciones de formulario
- [ ] Mensaje de éxito/error

---

### [FITFLOW-DS-31] Campo Cobertura en Pagos

**Tipo:** Backend / Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como sistema, necesito almacenar y mostrar el período de cobertura de cada pago.

**Criterios de Aceptación:**

- [ ] Agregar campos coverageStart y coverageEnd a entidad Payment
- [ ] Migración de base de datos
- [ ] API retorna campos de cobertura
- [ ] Frontend muestra rango de cobertura en tabla
- [ ] Cálculo automático de coverageEnd basado en tipo de membresía

---

## Tareas de Diseño - Ingresos (Acceso al Gimnasio)

### [FITFLOW-DS-32] Mejoras UI Página Escaneo QR

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador/trainer, quiero una UI mejorada para el escaneo de QR con tabs para tipo de acceso.

**Criterios de Aceptación:**

- [ ] Renombrar menú "Escanear QR" a "Ingresos" en sidebar
- [ ] Header con título "Acceso al Gimnasio"
- [ ] Sistema de tabs: "Gimnasio" y "Clase"
- [ ] Tab "Gimnasio": escaneo QR para acceso general (funcionalidad actual)
- [ ] Tab "Clase": escaneo QR para registrar asistencia a clase grupal
- [ ] Mantener funcionalidad actual de escaneo
- [ ] UI consistente con nuevo diseño

---

### [FITFLOW-DS-33] Acceso a Clase Grupal via QR

**Tipo:** Frontend / Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como trainer, quiero registrar asistencia a clases grupales escaneando el QR del miembro.

**Criterios de Aceptación:**

- [ ] Tab "Clase" muestra dropdown para seleccionar clase activa
- [ ] Escanear QR registra asistencia a la clase seleccionada
- [ ] Validar que el miembro esté inscrito en la clase
- [ ] Validar que la clase no esté llena
- [ ] API endpoint POST /api/classes/:id/attendance
- [ ] Mensaje de éxito/error con nombre del miembro

---

## Tareas de Diseño - Tipos de Membresía

### [FITFLOW-DS-34] Mejoras UI Lista Tipos de Membresía

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero ver la lista de tipos de membresía con información de acceso.

**Criterios de Aceptación:**

- [ ] Header con título "Tipos de Membresía"
- [ ] Botón "+ Nuevo Tipo"
- [ ] Tabla con columnas: Nombre, Precio, Acceso, Estado, Acciones
- [ ] Columna Acceso: Gym Only, All Access, Classes Only
- [ ] Estado con badge de color: ACTIVO (verde), INACTIVO (gris)
- [ ] Acciones: Editar, Eliminar (con confirmación)
- [ ] Formato de precio con símbolo de moneda

---

### [FITFLOW-DS-35] Dialog Crear/Editar Tipo de Membresía

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como administrador, quiero crear y editar tipos de membresía con campos adicionales.

**Criterios de Aceptación:**

- [ ] Dialog modal en lugar de página separada
- [ ] Campo: Nombre (input texto, requerido)
- [ ] Campo: Precio (input numérico, requerido)
- [ ] Campo: Duración en Días (input numérico, requerido)
- [ ] Campo: Período de Gracia en Días (input numérico)
- [ ] Campo: Tipo de Acceso (dropdown: Solo Gimnasio, All Access, Solo Clases)
- [ ] Checkbox: Activo (por defecto marcado)
- [ ] Botón "Cancelar" cierra dialog
- [ ] Botón "Guardar" guarda y cierra
- [ ] Validaciones de formulario

---

### [FITFLOW-DS-36] Campos Adicionales Tipo de Membresía

**Tipo:** Backend
**Estado:** ⬜ Pendiente

**Descripción:** Como desarrollador, necesito agregar campos adicionales a la entidad MembershipType.

**Criterios de Aceptación:**

- [ ] Agregar campo accessType: enum (GYM_ONLY, ALL_ACCESS, CLASSES_ONLY)
- [ ] Agregar campo gracePeriodDays: number (default 0)
- [ ] Agregar campo isActive: boolean (default true)
- [ ] Migración de base de datos
- [ ] Actualizar API para incluir nuevos campos
- [ ] Tests unitarios

---

## Tareas de Diseño - Menú Sidebar

### [FITFLOW-DS-37] Reorganización Menú Sidebar

**Tipo:** Frontend
**Estado:** ⬜ Pendiente

**Descripción:** Como sistema, necesito reorganizar el menú sidebar según el nuevo diseño.

**Criterios de Aceptación:**

- [ ] Agregar item "Reportes" (Admin) - ruta /reports
- [ ] Agregar item "Directorio" (Admin) - ruta /users
- [ ] Agregar item "Entrenamiento" (Admin/Trainer) - ruta /training
- [ ] Renombrar "Escanear QR" a "Ingresos" - ruta /access/scan
- [ ] Eliminar item "Finanzas" separado (se integra en Reportes)
- [ ] Mantener: Tipos, Membresías, Asistencias, Mis Rutinas, Mi Perfil, Pagos
- [ ] Actualizar MainLayoutComponent.menuItems
- [ ] Mantener estética actual del sidebar

---

## Historial de Cambios

| Fecha      | Tarea            | Estado | Notas                                     |
| ---------- | ---------------- | ------ | ----------------------------------------- |
| 2024-12-18 | Documento creado | -      | 37 tareas iniciales                       |
| 2024-12-18 | FITFLOW-DS-01    | ✅     | Métricas del Dashboard Admin completada   |
| 2024-12-18 | FITFLOW-DS-02    | ✅     | Tabla Actividad en Vivo completada        |
| 2024-12-18 | FITFLOW-DS-03    | ✅     | Tabla Pagos Recientes completada          |
| 2024-12-19 | FITFLOW-DS-04    | ✅     | Acciones Rápidas del Dashboard completada |
| 2024-12-19 | FITFLOW-DS-05    | ✅     | Exportar Miembros a Excel completada      |
| 2024-12-19 | FITFLOW-DS-06    | ✅     | Menú Reportes con Chart.js completada     |
| 2024-12-19 | FITFLOW-DS-07    | ✅     | Directorio de Usuarios completado         |
