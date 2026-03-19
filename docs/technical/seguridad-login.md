# Seguridad en Login — FitFlow

## Resumen

Este documento describe las medidas de seguridad integradas en el sistema de autenticación de FitFlow. Las mejoras fueron implementadas en tres capas complementarias: throttling por endpoint, bloqueo de cuenta por fuerza bruta, y registro de auditoría.

---

## 1. Rate Limiting específico en endpoints de auth

### Configuración

- **Global** (todos los endpoints): 60 requests / 60 segundos por IP — definido en `ThrottlerModule` en `app.module.ts`
- **Login y forgot-password**: sobreescrito a **5 requests / 900 segundos (15 min)** por IP

### Archivos afectados

- `backend/src/modules/auth/auth.controller.ts`

### Implementación

```typescript
@Throttle({ default: { limit: 5, ttl: 900000 } })
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: Request) { ... }
```

### Comportamiento

- Un atacante con una sola IP solo puede intentar el login 5 veces en 15 minutos
- Al superar el límite, NestJS retorna automáticamente `429 Too Many Requests`
- El mismo límite aplica a `POST /auth/forgot-password` para prevenir enumeración masiva de emails

---

## 2. Account Lockout — Bloqueo por fuerza bruta

### Lógica

- **Umbral**: 5 intentos fallidos consecutivos
- **Duración**: 15 minutos de bloqueo temporal
- **Reset automático**: Al hacer login exitoso, los contadores se reinician
- **No acumula** durante el bloqueo: si la cuenta está bloqueada, los intentos adicionales no extienden el tiempo de bloqueo

### Archivos afectados

- `backend/src/modules/users/entities/user.entity.ts` — nuevas columnas
- `backend/src/modules/users/users.service.ts` — métodos de gestión
- `backend/src/modules/auth/auth.service.ts` — lógica de validación

### Campos agregados a la entidad `User`

| Columna               | Tipo              | Default | Descripción                                      |
| --------------------- | ----------------- | ------- | ------------------------------------------------ |
| `failedLoginAttempts` | int               | 0       | Contador de intentos fallidos consecutivos       |
| `lockedUntil`         | timestamp \| null | null    | Fecha/hora hasta la que la cuenta está bloqueada |

Ambos campos son excluidos del `toJSON()` para no exponerse en la API.

### Flujo completo de validación

```
POST /auth/login
  └─ ThrottlerGuard (5 req / 15min por IP)
  └─ AuthService.validateUser()
       ├─ findByEmail() → NotFoundException → LOGIN_FAILED (usuario no existe)
       ├─ lockedUntil > now → ACCOUNT_LOCKED (bloqueo activo)
       ├─ isActive = false → LOGIN_FAILED (usuario inactivo)
       ├─ comparePasswords() → false
       │    └─ incrementFailedLoginAttempts() → si >= 5 → setear lockedUntil
       │    └─ LOGIN_FAILED
       └─ password válida → resetFailedLoginAttempts() → LOGIN_SUCCESS
```

### Métodos en UsersService

```typescript
incrementFailedLoginAttempts(userId: string): Promise<void>
  // Incrementa el contador; si alcanza 5, establece lockedUntil = now + 15min

resetFailedLoginAttempts(userId: string): Promise<void>
  // Resetea failedLoginAttempts = 0 y lockedUntil = null
```

---

## 3. Audit Log — Registro de eventos de autenticación

### Entidad `AuthAuditLog`

Tabla: `auth_audit_logs`

| Columna     | Tipo                 | Descripción                           |
| ----------- | -------------------- | ------------------------------------- |
| `id`        | uuid                 | PK auto-generada                      |
| `event`     | varchar(50)          | Tipo de evento (ver tabla de eventos) |
| `email`     | varchar(255) \| null | Email involucrado                     |
| `userId`    | varchar(36) \| null  | ID del usuario (null si no existe)    |
| `ipAddress` | varchar(45) \| null  | IP del cliente                        |
| `userAgent` | varchar(500) \| null | User-Agent del cliente                |
| `createdAt` | timestamp            | Fecha y hora del evento (UTC)         |

### Eventos registrados

| Evento                   | Descripción                               |
| ------------------------ | ----------------------------------------- |
| `LOGIN_SUCCESS`          | Login exitoso                             |
| `LOGIN_FAILED`           | Credenciales inválidas o usuario inactivo |
| `ACCOUNT_LOCKED`         | Intento de login con cuenta bloqueada     |
| `LOGOUT`                 | Cierre de sesión                          |
| `PASSWORD_RESET_REQUEST` | Solicitud de recuperación de contraseña   |
| `PASSWORD_RESET_SUCCESS` | Contraseña restablecida correctamente     |

### Archivos afectados

- `backend/src/modules/auth/entities/auth-audit-log.entity.ts` — entidad TypeORM
- `backend/src/modules/auth/auth-audit-log.service.ts` — servicio de logging
- `backend/src/modules/auth/auth.module.ts` — registro del módulo

### Diseño del servicio

El servicio es tolerante a fallos: si el guardado del log falla (ej. error de BD), el error es capturado internamente y logueado via `Logger` de NestJS sin interrumpir el flujo de autenticación.

```typescript
async log(dto: LogAuditEventDto): Promise<void> {
  try {
    const entry = this.auditLogRepository.create(dto);
    await this.auditLogRepository.save(entry);
  } catch (error) {
    this.logger.error('[AUDIT] Failed to save audit log entry', error);
  }
}
```

---

## 4. Captura de contexto de red

El controlador extrae automáticamente IP y User-Agent de cada request para enriquecer los logs de auditoría:

```typescript
private extractContext(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = (Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim()) ?? req.ip ?? null;
  const userAgent = (req.headers['user-agent'] as string) ?? null;
  return { ipAddress, userAgent };
}
```

Soporta entornos detrás de proxies/load balancers mediante el header `X-Forwarded-For`.

---

## 5. Resumen de protecciones activas

| Capa           | Mecanismo                                   | Dónde                                     |
| -------------- | ------------------------------------------- | ----------------------------------------- |
| Red / IP       | Rate limiting 5 req/15min                   | `ThrottlerGuard` + `@Throttle`            |
| Cuenta / Email | Lockout 15 min tras 5 fallos                | `UsersService` + `AuthService`            |
| Auditoría      | Registro persistente de eventos             | `AuthAuditLogService` + `auth_audit_logs` |
| Token          | JWT con expiración corta + refresh rotation | `JwtStrategy` + `UsersService`            |
| Transporte     | Helmet headers + CORS restrictivo           | `main.ts`                                 |
| Datos          | Passwords hasheadas con bcrypt (10 rounds)  | `User` entity hooks                       |
| Input          | ValidationPipe + class-validator en DTOs    | `main.ts` + DTOs                          |
