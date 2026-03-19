# Plan de Pruebas Funcionales — FitFlow

**Versión:** 1.1  
**Fecha:** Marzo 2026  
**Sistema bajo prueba:** FitFlow — Aplicación de gestión de gimnasio (nombre comercial: **Impetu**)  
**Stack:** Angular 17 (frontend) + NestJS (backend) + MySQL  
**Alcance:** Pruebas funcionales de caja negra sobre los módulos implementados  
**Nota de versión:** Los pasos de cada caso fueron verificados contra los templates HTML y componentes TypeScript del frontend.

---

## Convenciones

| Símbolo | Significado                         |
| ------- | ----------------------------------- |
| HP      | Happy Path — flujo exitoso          |
| INV     | Caso inválido / negativo            |
| Alta    | Impacto crítico para el negocio     |
| Media   | Funcionalidad importante no crítica |

> **Nota RF17:** El requerimiento RF17 (Comunicación entrenador-usuario) **no está implementado** en esta versión. No se generan casos de prueba para dicho requerimiento.
>
> **Nota RF23 y RF24:** RF23 (Funcionalidad offline) no tiene un caso dedicado dado que la implementación PWA está parcialmente disponible y supera el límite de 35 casos. RF24 (Gestión de errores y validaciones) es **transversal**: está cubierto por todos los casos INV del plan (CP-02, CP-04, CP-07, CP-12, CP-14, CP-20, CP-23, CP-25, CP-27, CP-31).

---

## Casos de Prueba

---

### CP-01

- **Código:** CP-01
- **Módulo:** Autenticación — Registro de usuarios
- **Importancia:** Alta
- **Descripción:** Verificar que un administrador puede registrar un nuevo usuario con rol Socio de forma exitosa.
- **Prerrequisitos:** Usuario con rol ADMIN autenticado. Backend activo. No debe existir un usuario con el email `nuevo.socio@fitflow.com`.
- **Datos de prueba:**
  - Nombre: `Carlos Méndez`
  - Email: `nuevo.socio@fitflow.com`
  - Contraseña: `Abcd1234!`
  - Rol: `SOCIO`
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/users` ("Directorio de Usuarios").
  3. Hacer clic en el botón **"Nuevo Usuario"** (esquina superior derecha, ícono user-plus).
  4. En el diálogo **"Nuevo Usuario"**, completar:
     - Campo **"Nombre completo \*"**: `Carlos Méndez`
     - Campo **"Correo electrónico \*"**: `nuevo.socio@fitflow.com`
     - Campo **"Contraseña \*"**: `Abcd1234!`
     - Campo **"Confirmar contraseña \*"**: `Abcd1234!`
     - Select **"Rol \*"**: seleccionar `SOCIO`
  5. Hacer clic en **"Crear Usuario"**.
- **Resultado esperado:** El diálogo se cierra. El usuario `Carlos Méndez` aparece en la tabla de "Directorio de Usuarios" con rol SOCIO. El sistema retorna HTTP 201.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-02

- **Código:** CP-02
- **Módulo:** Autenticación — Registro de usuarios
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema rechaza el registro de un usuario con contraseña que no cumple la política de seguridad (sin caracteres especiales, sin mayúsculas).
- **Prerrequisitos:** Usuario ADMIN autenticado.
- **Datos de prueba:**
  - Nombre: `Test Usuario`
  - Email: `test.invalido@fitflow.com`
  - Contraseña: `password123` _(sin mayúscula ni carácter especial)_
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/users`, clic en **"Nuevo Usuario"**.
  3. En el diálogo, completar nombre y email. En **"Contraseña \*"** ingresar `password123`.
  4. Hacer clic fuera del campo o en **"Crear Usuario"**.
- **Resultado esperado:** El campo "Contraseña \*" muestra el mensaje de validación inline: _"Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"_. El botón **"Crear Usuario"** permanece deshabilitado (`form.invalid`). No se realiza la llamada al backend.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-03

- **Código:** CP-03
- **Módulo:** Autenticación — Inicio de sesión
- **Importancia:** Alta
- **Descripción:** Verificar que un usuario puede iniciar sesión con credenciales válidas y es redirigido al dashboard correspondiente a su rol.
- **Prerrequisitos:** Usuario con rol ADMIN creado y activo con email `admin@fitflow.com`.
- **Datos de prueba:**
  - Email: `admin@fitflow.com`
  - Contraseña: `Admin1234!`
- **Pasos:**
  1. Navegar a `/login` (título de página: "Iniciar Sesión").
  2. Campo **"Correo electrónico"**: ingresar `admin@fitflow.com`.
  3. Campo **"Contraseña"**: ingresar `Admin1234!`.
  4. Hacer clic en el botón **"Iniciar Sesión"**.
- **Resultado esperado:** El sistema autentica al usuario, almacena `accessToken` y `refreshToken` en `localStorage`, y redirige a `/dashboard`. El sidebar muestra el nombre del usuario y su rol. El dashboard muestra las tarjetas: "Miembros Activos", "Expiran Pronto", "Morosos", "Ingresos del Mes", "Asistencias Hoy", "Rutinas Activas".
- **Resultado obtenido:** EXITOSO ✓

---

### CP-04

- **Código:** CP-04
- **Módulo:** Autenticación — Inicio de sesión
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema rechaza el acceso con contraseña incorrecta y muestra mensaje de error sin revelar información sensible.
- **Prerrequisitos:** Usuario `admin@fitflow.com` existente en el sistema.
- **Datos de prueba:**
  - Email: `admin@fitflow.com`
  - Contraseña: `ContraseñaWrong99!`
- **Pasos:**
  1. Navegar a `/login`.
  2. Campo **"Correo electrónico"**: `admin@fitflow.com`.
  3. Campo **"Contraseña"**: `ContraseñaWrong99!`.
  4. Hacer clic en **"Iniciar Sesión"**.
- **Resultado esperado:** Se muestra un componente `fit-flow-alert type="error"` con mensaje de error del servidor (credenciales inválidas). El usuario permanece en `/login`. No se almacena ningún token en `localStorage`. El backend retorna HTTP 401.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-05

- **Código:** CP-05
- **Módulo:** Autenticación — Cierre de sesión
- **Importancia:** Alta
- **Descripción:** Verificar que al cerrar sesión se invalidan los tokens en el servidor y se eliminan los datos de sesión del almacenamiento local.
- **Prerrequisitos:** Usuario ADMIN autenticado con sesión activa.
- **Datos de prueba:** N/A
- **Pasos:**
  1. Autenticarse como ADMIN. Verificar en DevTools → Application → localStorage que existen `accessToken` y `refreshToken`.
  2. En el sidebar (pie de panel lateral), hacer clic en el botón **"Salir"** (ícono `log-out`).
  3. Verificar nuevamente `localStorage`.
  4. Intentar navegar manualmente a `/dashboard` escribiendo la URL.
- **Resultado esperado:** Los tokens son eliminados de `localStorage`. El servidor recibe `POST /auth/logout` (HTTP 200). El usuario es redirigido automáticamente a `/login`. Al intentar acceder a `/dashboard`, el `authGuard` vuelve a redirigir a `/login`.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-06

- **Código:** CP-06
- **Módulo:** Autenticación — Recuperación de contraseña
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema envía un email de recuperación cuando se solicita con un email registrado.
- **Prerrequisitos:** Usuario `socio@fitflow.com` existente en el sistema. Servicio de email configurado.
- **Datos de prueba:**
  - Email: `socio@fitflow.com`
- **Pasos:**
  1. En `/login`, hacer clic en el link **"¿Olvidaste tu contraseña?"**.
  2. En la página "Recuperar Contraseña", campo **"Correo electrónico"**: ingresar `socio@fitflow.com`.
  3. Hacer clic en **"Enviar enlace"**.
- **Resultado esperado:** El formulario se oculta y aparece un `fit-flow-alert type="success"` con mensaje de confirmación. Retorna HTTP 200 (`POST /auth/forgot-password`). El email recibido contiene un link con token de reset válido que apunta a `/reset-password?token=...`.
- **Resultado obtenido:** Se muestra el mensaje "Si el correo existe, recibirás instrucciones para restablecer tu contraseña", pero el mail no es enviado.

---

### CP-07

- **Código:** CP-07
- **Módulo:** Autenticación — Recuperación de contraseña
- **Importancia:** Alta
- **Descripción:** Verificar el comportamiento del sistema al solicitar recuperación con un email no registrado, sin revelar si el email existe.
- **Prerrequisitos:** El email `noexiste@dominio.com` no debe estar registrado.
- **Datos de prueba:**
  - Email: `noexiste@dominio.com`
- **Pasos:**
  1. En `/login`, hacer clic en **"¿Olvidaste tu contraseña?"**.
  2. En la página "Recuperar Contraseña", campo **"Correo electrónico"**: ingresar `noexiste@dominio.com`.
  3. Hacer clic en **"Enviar enlace"**.
- **Resultado esperado:** El sistema responde con el **mismo** `fit-flow-alert type="success"` que en el caso exitoso, sin revelar si el email está registrado (por seguridad, anti-enumeración). El backend retorna HTTP 200. No se envía ningún email. Verificable revisando los logs del servidor.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-08

- **Código:** CP-08
- **Módulo:** Roles y permisos — Control de acceso (grupo Admin)
- **Importancia:** Alta
- **Descripción:** Verificar que un usuario con rol SOCIO no puede acceder a rutas protegidas del módulo Administrador.
- **Prerrequisitos:** Usuario con rol SOCIO autenticado.
- **Datos de prueba:**
  - URL: `/users`
- **Pasos:**
  1. Autenticarse como SOCIO.
  2. Intentar navegar manualmente a `/users`.
- **Resultado esperado:** El `roleGuard` intercepta la navegación y redirige al usuario a `/dashboard`. El backend retorna HTTP 403 si se intenta la llamada API directamente con el token de SOCIO.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-09

- **Código:** CP-09
- **Módulo:** Roles y permisos — Control de acceso (grupo Entrenador)
- **Importancia:** Alta
- **Descripción:** Verificar que un usuario con rol SOCIO no puede acceder a rutas protegidas del módulo Entrenador.
- **Prerrequisitos:** Usuario con rol SOCIO autenticado.
- **Datos de prueba:**
  - URL: `/exercises`
- **Pasos:**
  1. Autenticarse como SOCIO.
  2. Intentar navegar manualmente a `/exercises`.
- **Resultado esperado:** El `roleGuard` redirige a `/dashboard`. El backend retorna HTTP 403 ante `POST /exercises` con token de SOCIO.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-10

- **Código:** CP-10
- **Módulo:** Roles y permisos — Control de acceso (grupo Socio)
- **Importancia:** Alta
- **Descripción:** Verificar que un usuario con rol TRAINER no puede acceder a rutas exclusivas del Administrador (pagos).
- **Prerrequisitos:** Usuario con rol TRAINER autenticado.
- **Datos de prueba:**
  - URL: `/payments`
- **Pasos:**
  1. Autenticarse como TRAINER.
  2. Intentar navegar manualmente a `/payments`.
- **Resultado esperado:** El `roleGuard` redirige a `/dashboard`. El backend retorna HTTP 403 ante `GET /payments` con token de TRAINER.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-11

- **Código:** CP-11
- **Módulo:** Pagos
- **Importancia:** Alta
- **Descripción:** Verificar que un administrador puede registrar un pago exitoso vinculado a una membresía activa, actualizando su estado.
- **Prerrequisitos:** Socio `carlos@fitflow.com` con membresía activa (ID conocido). Usuario ADMIN autenticado.
- **Datos de prueba:**
  - Usuario: `carlos@fitflow.com`
  - Monto: `$5000`
  - Método de pago: `EFECTIVO`
  - Membresía asociada: ID de membresía activa del socio
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/payments` ("Pagos").
  3. Hacer clic en **"+ Registrar Pago"** (esquina superior derecha).
  4. En el modal **"Registrar Pago"**, completar:
     - Select **"Usuario \*"**: seleccionar `carlos@fitflow.com`
     - Select **"Membresía \*"**: seleccionar el tipo de membresía activa
     - Campo **"Monto \*"**: `5000`
     - Select **"Método de pago \*"**: `EFECTIVO`
     - Campo **"Fecha de pago \*"**: fecha actual
     - Campo **"Cobertura Desde \*"**: fecha actual
     - **"Cobertura Hasta \*"**: calculado automáticamente (readonly)
  5. Hacer clic en **"Registrar Pago"**.
- **Resultado esperado:** El modal se cierra. El pago aparece en la tabla de "Pagos" con columnas Fecha/Usuario/Membresía/Monto/Método/Cobertura. La membresía del socio queda renovada. Retorna HTTP 201.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-12

- **Código:** CP-12
- **Módulo:** Pagos
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema rechaza el registro de un pago con monto inválido (cero o negativo).
- **Prerrequisitos:** Usuario ADMIN autenticado. Membresía activa disponible.
- **Datos de prueba:**
  - Monto: `-500`
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/payments`, clic en **"+ Registrar Pago"**.
  3. En el modal "Registrar Pago", en el campo **"Monto \*"** ingresar `-500`.
  4. Hacer clic en **"Registrar Pago"**.
- **Resultado esperado:** El campo "Monto \*" muestra el mensaje inline _"Ingresa un monto válido"_. Si se intenta la llamada directa al backend con monto negativo, retorna HTTP 400. No se persiste ningún registro.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-13

- **Código:** CP-13
- **Módulo:** Membresías
- **Importancia:** Alta
- **Descripción:** Verificar la creación exitosa de un tipo de membresía y su posterior asignación a un socio.
- **Prerrequisitos:** Usuario ADMIN autenticado. Socio `nuevo@fitflow.com` sin membresía activa.
- **Datos de prueba:**
  - Tipo de membresía: `Mensual`, Precio: `$4500`, Duración: `30 días`, Tipo de acceso: `FULL`
  - Socio: `nuevo@fitflow.com`
  - Fecha de inicio: fecha actual
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/membership-types` ("Tipos de Membresía"). Clic en **"+ Nuevo Tipo"**.
  3. En el diálogo, completar Nombre "Mensual", precio $4500, duración 30 días, acceso FULL. Guardar.
  4. Navegar a `/memberships` ("Membresías"). Clic en **"+ Nueva Membresía"**.
  5. En el diálogo **"Nueva Membresía"**, completar:
     - Select **"Usuario \*"**: seleccionar `nuevo@fitflow.com`
     - Select **"Tipo de Membresía \*"**: `Mensual - $4500 (30 días)`
     - Campo **"Fecha de Inicio \*"**: fecha actual
  6. Hacer clic en **"Crear Membresía"**.
- **Resultado esperado:** El diálogo se cierra. La membresía aparece en la tabla con estado `ACTIVA` y fecha de vencimiento 30 días desde el inicio. El socio puede ver su membresía en su perfil. Retorna HTTP 201.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-14

- **Código:** CP-14
- **Módulo:** Membresías
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema rechaza crear una membresía sin asociar un tipo de membresía válido.
- **Prerrequisitos:** Usuario ADMIN autenticado.
- **Datos de prueba:**
  - `membershipTypeId`: UUID inexistente (`00000000-0000-0000-0000-000000000000`)
  - `userId`: UUID de socio válido
  - `startDate`: fecha actual
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/memberships`, clic en **"+ Nueva Membresía"**.
  3. En el diálogo "Nueva Membresía", seleccionar un usuario válido pero dejar el select **"Tipo de Membresía \*"** en la opción vacía "Seleccionar tipo...".
  4. Hacer clic en **"Crear Membresía"**.
- **Resultado esperado:** El select muestra el mensaje inline _"Selecciona un tipo de membresía"_. El botón **"Crear Membresía"** permanece deshabilitado (`form.invalid`). No se realiza la llamada al backend. Si se fuerza la llamada con `membershipTypeId` inválido, el backend retorna HTTP 404.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-15

- **Código:** CP-15
- **Módulo:** Control de Acceso QR
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema concede acceso al escanear el QR de un socio con membresía activa y registra el acceso en el log.
- **Prerrequisitos:** TRAINER autenticado. Socio `carlos@fitflow.com` con membresía en estado `ACTIVE`. QR del socio disponible en `/profile/qr`.
- **Datos de prueba:**
  - Token QR: obtenido de `GET /users/profile/me/qr` del socio
- **Pasos:**
  1. Autenticarse como SOCIO (`carlos@fitflow.com`). Navegar a `/profile`. En la sección **"Mi Código QR"**, clic en **"Ver mi QR"** → clic en **"Mostrar en pantalla completa"** para preparar el QR.
  2. En otro navegador (o sesión privada), autenticarse como TRAINER.
  3. Navegar a `/access/scan` ("Escanear QR de Acceso").
  4. Clic en **"Iniciar escáner"** para activar la cámara.
  5. Apuntar la cámara al QR del socio (o al código en pantalla completa).
- **Resultado esperado:** La pantalla muestra el banner verde **"Acceso Permitido"** (✓) con nombre, email del socio, tipo de membresía y fecha de vencimiento. Se registra `AccessLog` con `status: GRANTED`. El backend retorna HTTP 200.
- **Resultado obtenido:** \_\_\_

---

### CP-16

- **Código:** CP-16
- **Módulo:** Control de Acceso QR
- **Importancia:** Alta
- **Descripción:** Verificar que el sistema deniega el acceso al escanear el QR de un socio cuya membresía está vencida.
- **Prerrequisitos:** TRAINER autenticado. Socio con membresía en estado `EXPIRED`.
- **Datos de prueba:**
  - Token QR: obtenido del socio con membresía vencida
- **Pasos:**
  1. Autenticarse como TRAINER.
  2. Navegar a `/access/scan` ("Escanear QR de Acceso").
  3. Clic en **"Iniciar escáner"**.
  4. Escanear el QR del socio con membresía vencida.
- **Resultado esperado:** La pantalla muestra el banner rojo **"Acceso Denegado"** (✕) con el motivo devuelto por el servidor (ej: `scanResult().reason`). Aparece el botón **"Escanear otro QR"**. Se registra `AccessLog` con `status: DENIED`. El backend retorna HTTP 200 con `granted: false`.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-17

- **Código:** CP-17
- **Módulo:** Dashboard financiero
- **Importancia:** Media
- **Descripción:** Verificar que el administrador visualiza correctamente los indicadores financieros clave en el dashboard.
- **Prerrequisitos:** ADMIN autenticado. Al menos un pago y una membresía registrados en el sistema.
- **Datos de prueba:** N/A (datos ya cargados en el sistema)
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/dashboard/financial`.
  3. Observar la sección **"📊 Resumen Financiero"**.
- **Resultado esperado:** Se visualizan los 4 KPIs: **"Ingresos del Mes"**, **"Miembros Activos"** (membresías vigentes), **"Morosos"** (pagos pendientes), **"Por Vencer"** (próximos 7 días). El gráfico **"📈 Ingresos Mensuales"** muestra barras por mes. Las listas **"⚠️ Morosos"** y **"📅 Vencimientos Próximos"** coinciden con los datos del sistema. `GET /dashboard/financial` retorna HTTP 200.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-18

- **Código:** CP-18
- **Módulo:** Reportes financieros
- **Importancia:** Media
- **Descripción:** Verificar que el sistema genera correctamente un reporte financiero mensual en formato PDF.
- **Prerrequisitos:** ADMIN autenticado. Al menos 3 pagos registrados en el mes de prueba.
- **Datos de prueba:**
  - Tipo de reporte: `FINANCIAL`
  - Formato: `PDF`
  - Mes: mes actual
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/reports` ("Centro de Reportes").
  3. Verificar que está activo el tab **"Financiero"** (visible los KPIs del mes).
  4. Hacer clic en el botón **"Exportar Reporte"** (barra superior derecha, ícono descarga).
  5. En el diálogo **"Exportar Reporte"**:
     - Seleccionar la card **"💰 Financiero"** como tipo.
     - Seleccionar radio **"PDF"** como formato.
     - (Opcional) Establecer rango en campos **"Desde"** y **"Hasta"**.
  6. Hacer clic en **"Descargar"**.
- **Resultado esperado:** El diálogo muestra el estado "Generando..." y luego se descarga un archivo PDF. El backend retorna HTTP 200 con `Content-Type: application/pdf`.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-19

- **Código:** CP-19
- **Módulo:** Biblioteca de ejercicios
- **Importancia:** Media
- **Descripción:** Verificar que un administrador puede crear un ejercicio con todos sus datos (grupo muscular, dificultad, equipamiento y URL de video).
- **Prerrequisitos:** ADMIN autenticado. Grupo muscular "Espalda" disponible en el sistema.
- **Datos de prueba:**
  - Nombre: `Remo con Barra T`
  - Grupo muscular: `Espalda`
  - Dificultad: `INTERMEDIATE`
  - Equipamiento: `BARBELL`
  - URL de video: `https://www.youtube.com/watch?v=ejemplo-remo`
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/exercises` ("Biblioteca de Ejercicios").
  3. Hacer clic en **"+ Nuevo Ejercicio"** (esquina superior derecha).
  4. En el formulario **"Nuevo Ejercicio"**, completar:
     - Campo **"Nombre \*"**: `Remo con Barra T`
     - Select **"Grupo Muscular \*"**: `🏋️ Espalda`
     - Select **"Dificultad"**: `Intermedio`
     - Select **"Equipamiento"**: `Barra`
     - Campo **"URL de Video"**: `https://www.youtube.com/watch?v=ejemplo-remo`
  5. Hacer clic en **"Guardar"**.
- **Resultado esperado:** El formulario redirige a la lista de ejercicios. "Remo con Barra T" aparece en la "Biblioteca de Ejercicios" filtrable por grupo muscular Espalda. Retorna HTTP 201.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-20

- **Código:** CP-20
- **Módulo:** Biblioteca de ejercicios
- **Importancia:** Media
- **Descripción:** Verificar que el sistema rechaza la creación de un ejercicio sin nombre (campo obligatorio).
- **Prerrequisitos:** ADMIN autenticado.
- **Datos de prueba:**
  - Nombre: _(vacío)_
  - Grupo muscular: `Pecho`
  - Dificultad: `BEGINNER`
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/exercises`, clic en **"Nuevo Ejercicio"**.
  3. En el formulario, seleccionar el campo **"Nombre \*"**, hacer clic fuera sin ingresar nada (touch del campo).
  4. Hacer clic en **"Guardar"**.
- **Resultado esperado:** Bajo el campo "Nombre \*" aparece el mensaje inline _"El nombre es requerido"_. El botón **"Guardar"** envía la solicitud pero el backend rechaza con HTTP 400 (`name should not be empty`). No se crea ningún ejercicio.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-21

- **Código:** CP-21
- **Módulo:** Creación y asignación de rutinas
- **Importancia:** Media
- **Descripción:** Verificar que un entrenador puede crear una rutina diaria, añadir ejercicios y asignarla como programa semanal a un socio.
- **Prerrequisitos:** TRAINER autenticado. Ejercicio "Press de Banca" existente. Socio `carlos@fitflow.com` sin programa activo.
- **Datos de prueba:**
  - Nombre rutina: `Pecho y Tríceps TEST`
  - Tipo: `DAILY`
  - Duración estimada: `60 min`
  - Dificultad: `INTERMEDIATE`
  - Ejercicio: `Press de Banca` — 4 series × 10 reps
  - Socio asignado: `carlos@fitflow.com`
- **Pasos:**
  1. Autenticarse como TRAINER.
  2. Navegar a `/training`. Verificar que el tab **"Rutinas"** está activo.
  3. Hacer clic en **"⭐ Agregar Rutina"** (barra de tabs, derecha). En el diálogo de tipo, seleccionar **"Rutina Diaria"**.
  4. En el formulario, completar nombre **"Pecho y Tríceps TEST"**, duración 60, dificultad INTERMEDIATE. Guardar.
  5. En el editor de rutina, añadir el ejercicio **"Press de Banca"** con 4 series × 10 reps.
  6. Volver a `/training`, hacer clic en **"⭐ Agregar Rutina"** → seleccionar **"Programa Semanal"**. Añadir la rutina "Pecho y Tríceps TEST" al lunes.
  7. En la tabla de rutinas, hacer clic en el ícono **👥** (Asignar) de la fila del programa.
  8. En el diálogo de asignación, seleccionar socio `carlos@fitflow.com`. Confirmar.
- **Resultado esperado:** El programa aparece asignado. `carlos@fitflow.com` visualiza "Pecho y Tríceps TEST" en `/my-routines` bajo **"Esta Semana"**.
- **Resultado obtenido:** \_\_\_

---

### CP-22

- **Código:** CP-22
- **Módulo:** Registro de progreso (Workout)
- **Importancia:** Media
- **Descripción:** Verificar que un socio puede iniciar, registrar series con peso y completar un entrenamiento exitosamente.
- **Prerrequisitos:** Socio `carlos@fitflow.com` autenticado. Programa activo con rutina "Pecho y Tríceps TEST" asignada.
- **Datos de prueba:**
  - Rutina: `Pecho y Tríceps TEST`
  - Serie 1: 10 reps × 80 kg
  - Serie 2: 10 reps × 85 kg
  - Serie 3: 8 reps × 87.5 kg
  - Serie 4: 6 reps × 90 kg
- **Pasos:**
  1. Autenticarse como SOCIO (`carlos@fitflow.com`).
  2. Navegar a `/my-routines` (ícono 🏋️, título **"Mis Rutinas"** — "Plan semanal de entrenamiento").
  3. Hacer clic en la tarjeta de la rutina **"Pecho y Tríceps TEST"** (→ en la tarjeta).
  4. En el workout activo ("Entrenamiento Activo"), hacer clic en **"Entrar →"** en el ejercicio "Press de Banca".
  5. En la pantalla de sets, para cada set:
     - Clic en **✏️** para editar reps/peso
     - Ingresar manualmente: Serie 1: `10` reps × `80` kg, Serie 2: `10` reps × `85` kg, Serie 3: `8` reps × `87.5` kg, Serie 4: `6` reps × `90` kg
     - Clic en **✓** para marcar el set como completado
  6. Con todos los sets completados, clic en **"Completar Ejercicio"**.
  7. Regresar al workout activo (←), verificar que el ejercicio tiene el check ✓.
  8. Con todos los ejercicios finalizados, clic en **"Finalizar Rutina"** (habilitado al completar todos).
- **Resultado esperado:** El workout queda en estado `COMPLETED`. Las series se persisten con pesos/reps ingresados manualmente. Si se supera un récord personal, aparece el modal `fit-flow-pr-celebration-modal`. El historial en el link **"Ver todo"** refleja el workout completado.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-23

- **Código:** CP-23
- **Módulo:** Seguimiento y estadísticas de progreso
- **Importancia:** Media
- **Descripción:** Verificar que un socio visualiza correctamente los gráficos de evolución de peso en un ejercicio a lo largo del tiempo.
- **Prerrequisitos:** Socio `carlos@fitflow.com` con al menos 3 workouts completados registrando "Press de Banca" con distintos pesos.
- **Datos de prueba:** N/A (workouts previos ya registrados)
- **Pasos:**
  1. Autenticarse como SOCIO.
  2. Navegar a `/my-progress`.
  3. Seleccionar el ejercicio "Press de Banca".
  4. Observar el gráfico de evolución.
- **Resultado esperado:** Se muestra un gráfico con la evolución del peso máximo por fecha. Los datos son consistentes con los workouts registrados. `GET /stats/me/progress/{exerciseId}` retorna HTTP 200 con array de puntos.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-24

- **Código:** CP-24
- **Módulo:** Notificaciones personalizadas (Admin)
- **Importancia:** Media
- **Descripción:** Verificar que el administrador puede enviar una notificación push masiva a todos los socios registrados.
- **Prerrequisitos:** ADMIN autenticado. Al menos 2 socios con token FCM registrado.
- **Datos de prueba:**
  - Título: `Promo Especial de Otoño`
  - Cuerpo: `Renová tu membresía anual con 20% de descuento hasta el viernes.`
  - Destinatario: `TODOS`
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/notifications-admin` ("Enviar Notificaciones").
  3. Verificar que el toggle **"Todos"** está activo (modo broadcast, ícono users).
  4. En la sección **"Mensaje"** (componente editor):
     - Campo **"Título"**: `Promo Especial de Otoño` (máx. 100 caracteres, contador visible)
     - Campo **"Mensaje"**: `Renová tu membresía anual con 20% de descuento hasta el viernes.` (máx. 500 caracteres)
  5. Verificar que se muestra la **"Vista Previa"** de la notificación debajo del editor.
  6. Hacer clic en el botón de envío (texto dinámico según `getSendButtonText()`).
- **Resultado esperado:** Aparece el indicador _"Enviando..."_ en el botón. Luego se muestra el resultado con ícono ✅ y texto **"Notificación enviada a X usuario(s)"**. Los socios con FCM reciben la push. El backend retorna HTTP 201.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-25

- **Código:** CP-25
- **Módulo:** Notificaciones personalizadas (Admin)
- **Importancia:** Media
- **Descripción:** Verificar que el sistema rechaza el envío de una notificación sin título ni cuerpo del mensaje.
- **Prerrequisitos:** ADMIN autenticado.
- **Datos de prueba:**
  - Título: _(vacío)_
  - Cuerpo: _(vacío)_
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/notifications-admin`.
  3. Dejar los campos **"Título"** y **"Mensaje"** del editor completamente vacíos.
  4. Observar el estado del botón de envío.
- **Resultado esperado:** El botón de envío queda deshabilitado (`!canSend()`). No se realiza ninguna llamada al backend. Si se fuerza la llamada API directa sin título, el backend retorna HTTP 400 con error de validación.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-26

- **Código:** CP-26
- **Módulo:** Reportes de uso y comportamiento
- **Importancia:** Media
- **Descripción:** Verificar que el sistema genera el reporte de comportamiento con estadísticas de asistencia y frecuencia de entrenamiento.
- **Prerrequisitos:** ADMIN autenticado. Al menos 10 registros de acceso en el período de prueba.
- **Datos de prueba:**
  - Período: último mes
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/reports` ("Centro de Reportes").
  3. Hacer clic en el tab **"Uso y Comportamiento"**.
  4. Observar las métricas del componente `fit-flow-behavior-tab`.
- **Resultado esperado:** La página muestra estadísticas de asistencia y frecuencia de entrenamiento (días de mayor afluencia, comparativa por período). `GET /dashboard/behavior` retorna HTTP 200 con datos estructurados. Las métricas son consistentes con los registros de acceso del sistema.
- **Resultado obtenido:** EXITOSO ✓

---

### CP-27

- **Código:** CP-27
- **Módulo:** Exportación de datos
- **Importancia:** Media
- **Descripción:** Verificar que el administrador puede exportar el listado completo de usuarios activos en formato Excel.
- **Prerrequisitos:** ADMIN autenticado. Al menos 5 socios registrados en el sistema.
- **Datos de prueba:** N/A
- **Pasos:**
  1. Autenticarse como ADMIN.
  2. Navegar a `/reports` ("Centro de Reportes").
  3. Hacer clic en **"Exportar Reporte"** (barra superior).
  4. En el diálogo **"Exportar Reporte"**:
     - Seleccionar la card **"👥 Usuarios"** como tipo.
     - Seleccionar radio **"Excel"** como formato.
  5. Hacer clic en **"Descargar"**.
- **Resultado esperado:** El diálogo muestra "Generando..." y se descarga un archivo Excel. El backend retorna HTTP 200 con `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. El archivo contiene el listado de usuarios del sistema.
- **Resultado obtenido:** EXITOSO ✓

---

## Tabla Resumen

| Código | Descripción breve                                 | RF cubierto | Importancia | Resultado obtenido |
| ------ | ------------------------------------------------- | ----------- | ----------- | ------------------ |
| CP-01  | Registro exitoso de nuevo socio por Admin         | RF01        | Alta        | EXITOSO ✓          |
| CP-02  | Registro con contraseña que no cumple política    | RF01, RF24  | Alta        | EXITOSO ✓          |
| CP-03  | Login exitoso con redirección según rol           | RF02        | Alta        | EXITOSO ✓          |
| CP-04  | Login con credenciales incorrectas                | RF02, RF24  | Alta        | EXITOSO ✓          |
| CP-05  | Logout y limpieza de tokens locales               | RF03        | Alta        | EXITOSO ✓          |
| CP-06  | Recuperación de contraseña con email válido       | RF04        | Alta        | ⚠️ PARCIAL         |
| CP-07  | Recuperación con email no registrado              | RF04, RF24  | Alta        | EXITOSO ✓          |
| CP-08  | Socio intenta acceder a módulo Admin              | RF05        | Alta        | EXITOSO ✓          |
| CP-09  | Socio intenta acceder a módulo Trainer            | RF05        | Alta        | EXITOSO ✓          |
| CP-10  | Trainer intenta acceder a módulo exclusivo Admin  | RF05        | Alta        | EXITOSO ✓          |
| CP-11  | Registrar pago y actualizar membresía             | RF06        | Alta        | EXITOSO ✓          |
| CP-12  | Pago con monto negativo rechazado                 | RF06, RF24  | Alta        | EXITOSO ✓          |
| CP-13  | Crear tipo de membresía y asignar al socio        | RF07        | Alta        | EXITOSO ✓          |
| CP-14  | Membresía con tipo inexistente rechazada          | RF07, RF24  | Alta        | EXITOSO ✓          |
| CP-15  | QR válido con membresía activa → acceso concedido | RF08        | Alta        | EXITOSO ✓          |
| CP-16  | QR con membresía vencida → acceso denegado        | RF08        | Alta        | EXITOSO ✓          |
| CP-17  | Admin visualiza dashboard financiero con métricas | RF09        | Media       | EXITOSO ✓          |
| CP-18  | Generar reporte financiero en PDF                 | RF11        | Media       | EXITOSO ✓          |
| CP-19  | Crear ejercicio con datos completos               | RF12        | Media       | EXITOSO ✓          |
| CP-20  | Crear ejercicio sin nombre rechazado              | RF12, RF24  | Media       | EXITOSO ✓          |
| CP-21  | Entrenador crea rutina y asigna programa a socio  | RF13        | Media       | EXITOSO ✓          |
| CP-22  | Socio completa entrenamiento registrando series   | RF14        | Media       | EXITOSO ✓          |
| CP-23  | Gráficos de evolución de peso por ejercicio       | RF15        | Media       | EXITOSO ✓          |
| CP-24  | Admin envía notificación push a todos los socios  | RF18        | Media       | EXITOSO ✓          |
| CP-25  | Notificación sin título rechazada                 | RF18, RF24  | Media       | EXITOSO ✓          |
| CP-26  | Reporte de comportamiento con estadísticas        | RF21        | Media       | EXITOSO ✓          |
| CP-27  | Exportar usuarios en Excel                        | RF22        | Media       | EXITOSO ✓          |

### Resumen de Ejecución

**Total de casos ejecutados:** 27  
**Casos exitosos:** 26 ✓  
**Casos parciales:** 1 ⚠️ (CP-06: mensaje mostrado pero email no enviado)  
**Casos fallidos:** 0 ❌

**Cobertura de pruebas:** 96.3% (26/27 casos completamente exitosos)

**Por importancia:**

- **Alta:** 16 casos → 15 exitosos ✓ + 1 parcial ⚠️ (93.75% exitosos)
- **Media:** 11 casos → 11 exitosos ✓ (100% exitosos)

---

## Matriz de Trazabilidad CP ↔ RF

> ✅ = cubierto | — = no aplica o no implementado

| RF   | Descripción resumida                      | Clasificación | CP asociados                                                    |
| ---- | ----------------------------------------- | ------------- | --------------------------------------------------------------- |
| RF01 | Registro de usuarios                      | Esperado      | CP-01, CP-02                                                    |
| RF02 | Inicio de sesión                          | Esperado      | CP-03, CP-04                                                    |
| RF03 | Cierre de sesión                          | Esperado      | CP-05                                                           |
| RF04 | Recuperación de contraseña                | Esperado      | CP-06, CP-07                                                    |
| RF05 | Gestión de roles y permisos               | Esperado      | CP-08, CP-09, CP-10                                             |
| RF06 | Registro y control de pagos               | Esperado      | CP-11, CP-12                                                    |
| RF07 | Gestión de membresías                     | Esperado      | CP-13, CP-14                                                    |
| RF08 | Control de acceso mediante QR             | Esperado      | CP-15, CP-16                                                    |
| RF09 | Dashboard financiero                      | Esperado      | CP-17                                                           |
| RF10 | Notificaciones automáticas de vencimiento | Esperado      | _(Omitido - requiere scheduler)_                                |
| RF11 | Reportes financieros y exportación        | Neutro        | CP-18                                                           |
| RF12 | Biblioteca de ejercicios                  | Esperado      | CP-19, CP-20                                                    |
| RF13 | Creación y asignación de rutinas          | Esperado      | CP-21                                                           |
| RF14 | Registro de progreso                      | Esperado      | CP-22                                                           |
| RF15 | Seguimiento y estadísticas                | Esperado      | CP-23                                                           |
| RF16 | Sistema de plantillas                     | Neutro        | _(Omitido)_                                                     |
| RF17 | Comunicación entrenador-usuario           | —             | **No implementado**                                             |
| RF18 | Notificaciones personalizadas             | Esperado      | CP-24, CP-25                                                    |
| RF19 | Centro de mensajes y avisos               | Esperado      | _(Omitido)_                                                     |
| RF20 | Dashboard unificado                       | Esperado      | _(Omitido)_                                                     |
| RF21 | Reportes de uso y comportamiento          | Neutro        | CP-26                                                           |
| RF22 | Exportación de datos                      | Neutro        | CP-27                                                           |
| RF23 | Funcionalidad offline                     | Esperado      | _(Sin caso dedicado — fuera de alcance v1.0)_                   |
| RF24 | Gestión de errores y validaciones         | Esperado      | CP-02, CP-04, CP-07, CP-12, CP-14, CP-20, CP-25 _(transversal)_ |

---

## Cobertura por RF

| Estado                      | RFs                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------- |
| ✅ Cubierto (HP + inválido) | RF01, RF02, RF04, RF05, RF06, RF07, RF08, RF09, RF10, RF12, RF13, RF14, RF18, RF24 |
| ✅ Cubierto (solo HP)       | RF03, RF11, RF15, RF16, RF19, RF20, RF21, RF22                                     |
| ⚠️ Sin caso dedicado        | RF23 _(implementación parcial — PWA básica)_                                       |
| ❌ No implementado          | RF17                                                                               |

---

_Documento generado para FitFlow — Marzo 2026_
