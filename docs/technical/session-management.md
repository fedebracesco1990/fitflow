# Session Management - Technical Documentation

## Overview

Sistema de gestión de sesiones mejorado con refresh proactivo de tokens JWT para mantener sesiones activas sin interrupciones durante 7 días.

## Architecture

### Components

1. **TokenRefreshService** (Frontend)

   - Servicio Angular que gestiona el refresh proactivo de tokens
   - Decodifica JWT para obtener tiempo de expiración
   - Programa timer para ejecutar refresh 5 minutos antes de expiración
   - Implementa cleanup automático para evitar memory leaks

2. **AuthInterceptor** (Frontend)

   - Interceptor HTTP mejorado con `BehaviorSubject`
   - Maneja cola de requests durante refresh de token
   - Reintenta automáticamente requests fallidos después de refresh exitoso
   - Evita múltiples refreshes simultáneos

3. **AuthState** (Frontend)

   - State management con NGXS
   - Integra TokenRefreshService en el ciclo de vida de autenticación
   - Redirige a `/login` cuando sesión expira

4. **AuthService** (Backend)
   - Genera y valida tokens JWT
   - Maneja refresh de tokens
   - Almacena refresh tokens en base de datos

## Token Configuration

### Backend (.env)

```bash
JWT_ACCESS_TOKEN_EXPIRATION=2700    # 45 minutos
JWT_REFRESH_TOKEN_EXPIRATION=604800 # 7 días
JWT_SECRET=<secret-key>
JWT_REFRESH_SECRET=<refresh-secret-key>
```

### Token Lifecycle

```
Login/Register
    ↓
Access Token (45min) + Refresh Token (7 días)
    ↓
Usuario usa la app
    ↓
A los 40 minutos → TokenRefreshService ejecuta refresh proactivo
    ↓
Nuevo Access Token (45min) + Nuevo Refresh Token (7 días)
    ↓
Timer reinicia → Ciclo continúa
    ↓
Después de 7 días sin uso → Refresh Token expira → Logout automático
```

## Data Flow

### 1. Login Flow

```typescript
1. Usuario ingresa credenciales
2. POST /auth/login
3. Backend valida y retorna tokens
4. StorageService guarda tokens en localStorage
5. AuthState ejecuta CheckSession
6. CheckSessionSuccess inicia TokenRefreshService.startRefreshTimer()
7. Timer programado para 40 minutos
```

### 2. Proactive Refresh Flow

```typescript
1. Timer se dispara a los 40 minutos
2. TokenRefreshService ejecuta: store.dispatch(new RefreshToken())
3. AuthState.refreshToken() llama AuthService.refreshToken()
4. POST /auth/refresh con refreshToken
5. Backend valida y retorna nuevos tokens
6. StorageService actualiza tokens
7. RefreshTokenSuccess reinicia timer con nuevo access token
```

### 3. Reactive Refresh Flow (Fallback)

```typescript
1. Request falla con 401
2. AuthInterceptor detecta error
3. Si no hay refresh en curso:
   - Marca isRefreshing = true
   - Ejecuta refresh
   - Actualiza tokens
   - Reintenta request original
4. Si hay refresh en curso:
   - Request espera en cola (BehaviorSubject)
   - Cuando refresh completa, reintenta con nuevo token
```

### 4. Session Expiration Flow

```typescript
1. Refresh token expira (7 días)
2. Intento de refresh falla
3. RefreshTokenFailure ejecuta:
   - tokenRefreshService.stopRefreshTimer()
   - storage.clearTokens()
   - router.navigate(['/login'])
4. Usuario redirigido a login
```

## API Endpoints Used

### POST /auth/login

```typescript
Request: { email: string, password: string }
Response: { accessToken: string, refreshToken: string }
```

### POST /auth/refresh

```typescript
Request: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

### GET /auth/session

```typescript
Headers: { Authorization: "Bearer <access_token>" }
Response: { status: "authenticated", user: {...} }
```

## Integration Guide

### Using TokenRefreshService

```typescript
// Iniciar timer (automático en AuthState)
const accessToken = storage.getAccessToken();
tokenRefreshService.startRefreshTimer(accessToken);

// Detener timer (automático en logout)
tokenRefreshService.stopRefreshTimer();
```

### Handling Token Expiration

```typescript
// AuthInterceptor maneja automáticamente
// No requiere código adicional en componentes

// Para casos especiales, escuchar RefreshTokenFailure
@Action(RefreshTokenFailure)
refreshTokenFailure(ctx: StateContext<AuthStateModel>) {
  // Cleanup y redirección automática
  this.router.navigate(['/login']);
}
```

## Performance Considerations

### Refresh Frequency

- **Access token**: 45 minutos
- **Refresh proactivo**: Cada 40 minutos (5 min antes de expirar)
- **Refreshes por semana** (uso activo 8h/día): ~224 refreshes

### Memory Management

- Timer se limpia automáticamente en `ngOnDestroy`
- BehaviorSubject completa en cleanup
- No memory leaks detectados

### Network Optimization

- Refresh proactivo evita requests fallidos
- Cola de requests evita múltiples refreshes simultáneos
- Tokens se almacenan en localStorage (persisten al recargar)

## Security Considerations

### Token Storage: decisión de diseño

El access token y el refresh token se guardan en `localStorage` (`StorageService`). Es una **decisión consciente**, con sus riesgos acotados:

**Riesgo.** `localStorage` es accesible desde JavaScript. Si existiera una vulnerabilidad de XSS, un atacante podría leer los dos tokens. Con el refresh token podría mantener la sesión desde otro equipo hasta **7 días**, o hasta que el usuario cierre sesión. Con el access token, hasta 45 minutos.

**Por qué se acepta en este proyecto:**

- **Superficie de XSS mínima.** Angular escapa por defecto todo lo que se interpola en los templates, y el código no usa APIs que lo eviten: no hay `[innerHTML]`, `bypassSecurityTrust*`, `eval` ni `document.write` (verificado el 2026-10-12). Para robar los tokens primero tiene que existir un XSS.
- **Simplicidad.** Los tokens persisten al recargar la página sin depender de cookies cross-origin. Eso evita configurar `withCredentials`, CORS con credenciales y protección CSRF.
- **Alcance.** Es una aplicación académica, sin despliegue con usuarios reales.

**Mitigaciones implementadas:**

✅ Access token corto (45 min) y refresh token de 7 días, con secretos distintos  
✅ Refresh token rotado en cada uso y guardado **hasheado** (bcrypt) en la base  
✅ El logout invalida el refresh token en el servidor: el token robado deja de servir  
✅ El rol y el estado activo del usuario se leen de la base en cada petición: desactivar a un usuario o cambiarle el rol aplica de inmediato  
✅ Rate limiting en login, forgot-password y reset-password (5 cada 15 min), y global (60 por minuto)  
✅ El WebSocket solo acepta el token en el handshake (`auth`), nunca en la URL  
✅ HTTPS requerido en producción y CORS con lista de orígenes permitidos

### Trabajo futuro: tokens fuera del alcance de JavaScript

Para un despliegue con usuarios reales se recomienda seguir la práctica de OWASP:

1. **Refresh token en una cookie `httpOnly; Secure; SameSite=Strict`**, con `Path=/api/auth`. El backend la setea en login y refresh, y la borra en logout. El frontend deja de leerla y de guardarla.
2. **Access token solo en memoria**, en un signal del `AuthState`, sin `localStorage`. Al recargar la página, la app llama a `/auth/refresh` antes de la primera petición: la cookie viaja sola y devuelve un access token nuevo.
3. **Cambios asociados:**
   - `withCredentials: true` en las llamadas a `/auth/*`.
   - CORS con `credentials: true`, que el backend ya tiene.
   - `cookie-parser` en el backend para leer la cookie.
   - Si frontend y backend quedan en dominios distintos, `SameSite=None; Secure` más un token anti-CSRF en el endpoint de refresh.

Con esto, un XSS ya no podría extraer credenciales para usarlas en otro equipo; como mucho, actuar como el usuario mientras la página esté abierta. El esfuerzo estimado es de unas 3 horas.

## Development Notes

### Testing Proactive Refresh

Para probar el refresh proactivo sin esperar 40 minutos:

```typescript
// Modificar temporalmente en token-refresh.service.ts
private readonly REFRESH_BUFFER_MS = 1 * 60 * 1000; // 1 minuto para testing
```

### Debugging

```typescript
// En TokenRefreshService, agregar logs temporales:
startRefreshTimer(accessToken: string): void {
  const decoded = jwtDecode<JwtPayload>(accessToken);
  const delay = /* cálculo */;
  console.log(`[TokenRefresh] Timer set for ${delay}ms`);
}
```

### Common Issues

**Issue**: Timer no se ejecuta  
**Solution**: Verificar que `startRefreshTimer()` se llama en todos los success actions

**Issue**: Múltiples refreshes simultáneos  
**Solution**: Verificar que `isRefreshing` flag funciona correctamente en interceptor

**Issue**: Usuario deslogueado inesperadamente  
**Solution**: Verificar que refresh token no expiró y que backend acepta el token

## Future Improvements

- [ ] Agregar telemetría para monitorear refreshes
- [ ] Implementar refresh token rotation más agresiva
- [ ] Refresh token en cookie httpOnly y access token en memoria (ver [Trabajo futuro](#trabajo-futuro-tokens-fuera-del-alcance-de-javascript))
- [ ] Agregar rate limiting en endpoint de refresh
- [ ] Implementar detección de sesiones concurrentes

## Related Documentation

- [AUTH.md](../backend-api/AUTH.md) - API de autenticación
- [FRONTEND_CORE.md](../FRONTEND_CORE.md) - Servicios core del frontend
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Arquitectura general del sistema
