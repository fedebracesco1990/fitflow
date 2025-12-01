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

## Estado de Implementación

| ID         | Funcionalidad                 | Estado       | Notas                                                                      |
| ---------- | ----------------------------- | ------------ | -------------------------------------------------------------------------- |
| FITFLOW-10 | Configuración de Repositorio  | ✅ COMPLETO  | Monorepo, README, .gitignore, estructura Angular/NestJS, package.json      |
| FITFLOW-11 | Diseño de Arquitectura        | ⚠️ PARCIAL   | JWT documentado, falta diagrama y docs PWA                                 |
| FITFLOW-12 | Modelo de Base de Datos       | ⚠️ PARCIAL   | User, MembershipType, Membership, Payment. Faltan: Ejercicio, Rutina       |
| FITFLOW-13 | Taller de Deploy              | ✅ COMPLETO  | Documentación externa al repositorio                                       |
| FITFLOW-14 | API de Registro               | ✅ COMPLETO  | POST /auth/register, validación, bcrypt, rol por defecto                   |
| FITFLOW-15 | Formulario de Registro        | ✅ COMPLETO  | Formulario con validaciones, campos requeridos, manejo errores, responsive |
| FITFLOW-16 | API de Login/JWT              | ✅ COMPLETO  | POST /auth/login, JWT con payload, refresh token, guards                   |
| FITFLOW-17 | Formulario de Login           | ✅ COMPLETO  | Formulario, localStorage, interceptor, manejo errores                      |
| FITFLOW-18 | Sistema de Logout             | ✅ COMPLETO  | Botón en navbar, elimina tokens, redirige, limpia estado                   |
| FITFLOW-19 | Sistema de Roles (Backend)    | ✅ COMPLETO  | Roles enum, @Roles decorator, RolesGuard, tests unitarios                  |
| FITFLOW-20 | Rutas Protegidas (Frontend)   | ✅ COMPLETO  | AuthGuard, RoleGuard, rutas protegidas, dashboard diferenciado por rol     |
| FITFLOW-21 | API Recuperación Contraseña   | ⚠️ PARCIAL   | Endpoints creados, token temporal. Falta: envío real de email              |
| FITFLOW-22 | Flujo Recuperación Contraseña | ✅ COMPLETO  | Link en login, formulario solicitud, página reset, feedback                |
| FITFLOW-23 | API Tipos de Membresía        | ✅ COMPLETO  | CRUD completo con validaciones y roles                                     |
| FITFLOW-24 | Panel Tipos de Membresía      | ✅ COMPLETO  | Lista, formulario crear/editar, eliminar, solo admin                       |
| FITFLOW-25 | API de Pagos                  | ✅ COMPLETO  | CRUD completo con validaciones y roles                                     |
| FITFLOW-26 | Formulario de Pagos           | ❌ PENDIENTE | No existe en frontend                                                      |
| FITFLOW-27 | Lista de Pagos                | ❌ PENDIENTE | No existe en frontend                                                      |
| FITFLOW-28 | API Dashboard Financiero      | ❌ EXCLUIDO  | No revisar por ahora                                                       |
| FITFLOW-29 | Dashboard Financiero          | ❌ EXCLUIDO  | No revisar por ahora                                                       |

---

## Resumen

### ✅ Completadas (15)

- FITFLOW-10, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25

### ⚠️ Parciales (3)

- **FITFLOW-11**: Falta diagrama de arquitectura y documentación PWA
- **FITFLOW-12**: User, MembershipType, Membership, Payment. Faltan: Ejercicio, Rutina
- **FITFLOW-21**: Falta integración real de envío de email

### ❌ Pendientes (2)

- **FITFLOW-26**: Formulario de registro de pagos
- **FITFLOW-27**: Lista y consulta de pagos

### ❌ Excluidas (2)

- **FITFLOW-28**: API Dashboard Financiero
- **FITFLOW-29**: Dashboard Financiero

---

## Próximos Pasos Recomendados

### Prioridad Alta (Core del negocio)

1. **FITFLOW-26**: Formulario de Pagos
2. **FITFLOW-27**: Lista de Pagos

### Prioridad Media

3. **FITFLOW-11**: Completar documentación de arquitectura
4. **FITFLOW-21**: Integrar servicio de email real
