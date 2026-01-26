# FitFlow Frontend - Core Module Documentation

Este documento describe la arquitectura y funcionamiento del módulo `core` del frontend de FitFlow.

## Índice

1. [Estructura del Módulo](#estructura-del-módulo)
2. [Models](#models)
3. [Guards](#guards)
4. [Interceptors](#interceptors)
5. [Store (NGXS)](#store-ngxs)
6. [Flujos de Datos](#flujos-de-datos)

---

## Estructura del Módulo

```
core/
├── guards/
│   ├── auth.guard.ts         # Protege rutas autenticadas
│   ├── guest.guard.ts        # Protege rutas públicas (login, register)
│   └── index.ts
├── interceptors/
│   ├── auth.interceptor.ts   # Maneja tokens JWT
│   ├── error.interceptor.ts  # Maneja errores HTTP
│   └── index.ts
├── models/
│   ├── access-type.enum.ts   # Enum tipos de acceso
│   ├── api-response.model.ts # Respuestas API genéricas
│   ├── auth.model.ts         # Login, Register, Tokens
│   ├── dashboard.model.ts    # Métricas del dashboard
│   ├── exercise.model.ts     # Ejercicios
│   ├── low-attendance.model.ts # Alertas de asistencia
│   ├── membership-type.model.ts # Tipos de membresía
│   ├── membership.model.ts   # Membresías
│   ├── offline.model.ts      # Modelos para offline
│   ├── payment.model.ts      # Pagos
│   ├── personal-record.model.ts # Récords personales
│   ├── routine.model.ts      # Rutinas y plantillas
│   ├── stats.model.ts        # Estadísticas de progreso
│   ├── user.model.ts         # Usuario y perfil
│   ├── websocket.model.ts    # Eventos WebSocket
│   ├── workout.model.ts      # Entrenamientos
│   └── index.ts
├── services/
│   ├── api.service.ts        # HTTP client base
│   ├── attendance.service.ts # Consulta de asistencia
│   ├── auth.service.ts       # Login, logout, tokens
│   ├── dashboard.service.ts  # Métricas del dashboard
│   ├── exercises.service.ts  # CRUD ejercicios
│   ├── membership-types.service.ts # CRUD tipos membresía
│   ├── memberships.service.ts # CRUD membresías
│   ├── muscle-groups.service.ts # CRUD grupos musculares
│   ├── network.service.ts    # Detectar online/offline
│   ├── offline-db.service.ts # IndexedDB con Dexie
│   ├── offline-workouts.service.ts # Workouts offline
│   ├── page-title.strategy.ts # Títulos de página
│   ├── payments.service.ts   # CRUD pagos
│   ├── personal-records.service.ts # Gestión de PRs
│   ├── push-notifications.service.ts # Push con FCM
│   ├── pwa.service.ts        # Service Worker, updates
│   ├── routines.service.ts   # CRUD rutinas
│   ├── stats.service.ts      # Estadísticas de progreso
│   ├── storage.service.ts    # LocalStorage tokens
│   ├── sync-manager.service.ts # Coordinador de sync
│   ├── sync-queue.service.ts # Cola de operaciones offline
│   ├── token-refresh.service.ts # Refresh automático
│   ├── user-routines.service.ts # Asignación de rutinas
│   ├── user.service.ts       # Perfil del usuario
│   ├── users.service.ts      # CRUD usuarios (admin)
│   ├── websocket.service.ts  # WebSocket real-time
│   ├── workouts.service.ts   # CRUD entrenamientos
│   └── index.ts
├── store/
│   ├── auth/                 # Estado de autenticación
│   │   ├── auth.actions.ts
│   │   ├── auth.state.ts
│   │   └── index.ts
│   ├── notifications/        # Estado de notificaciones
│   │   ├── notifications.actions.ts
│   │   ├── notifications.state.ts
│   │   └── index.ts
│   ├── personal-records/     # Estado de PRs
│   │   ├── personal-records.actions.ts
│   │   ├── personal-records.state.ts
│   │   └── index.ts
│   ├── user/                 # Estado del perfil
│   │   ├── user.actions.ts
│   │   ├── user.state.ts
│   │   └── index.ts
│   └── index.ts
├── utils/                    # Utilidades compartidas
└── index.ts
```

---

## Models

Los modelos definen las interfaces TypeScript para tipado estricto en toda la aplicación.

### `user.model.ts`

```typescript
// Roles disponibles en el sistema
enum Role {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  USER = 'user',
}

// Usuario completo (respuesta del backend)
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Perfil simplificado
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}
```

### `auth.model.ts`

```typescript
// Request para login
interface LoginRequest {
  email: string;
  password: string;
}

// Request para registro
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

// Respuesta de tokens JWT
interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

// Usuario autenticado (datos del token)
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

// Request para recuperar contraseña
interface ForgotPasswordRequest {
  email: string;
}

// Request para resetear contraseña
interface ResetPasswordRequest {
  token: string;
  userId: string;
  newPassword: string;
}

// Request para cambiar contraseña
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Request para actualizar perfil
interface UpdateProfileRequest {
  name?: string;
  email?: string;
}
```

### `api-response.model.ts`

```typescript
// Estructura de errores del API
interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Respuesta genérica con mensaje
interface MessageResponse {
  message: string;
}

// Respuesta de forgot-password
interface ForgotPasswordResponse {
  message: string;
  _devOnly?: {
    resetLink: string;
  };
}

// Respuesta paginada
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
```

---

## Guards

Los guards controlan el acceso a las rutas basándose en el estado de autenticación.

### `authGuard`

**Propósito:** Proteger rutas que requieren autenticación.

**Comportamiento:**

1. Espera a que el estado de autenticación esté inicializado
2. Verifica si el usuario está autenticado
3. Si **NO** está autenticado → Redirige a `/login`
4. Si **SÍ** está autenticado → Permite acceso

```typescript
export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isInitialized).pipe(
    filter((isInitialized) => isInitialized), // Espera inicialización
    take(1),
    map(() => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }

      return true;
    })
  );
};
```

**Uso en rutas:**

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadChildren: () => import('./features/dashboard/dashboard.routes')
}
```

### `guestGuard`

**Propósito:** Proteger rutas públicas (login, register) de usuarios ya autenticados.

**Comportamiento:**

1. Espera a que el estado de autenticación esté inicializado
2. Verifica si el usuario está autenticado
3. Si **SÍ** está autenticado → Redirige a `/dashboard`
4. Si **NO** está autenticado → Permite acceso

```typescript
export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isInitialized).pipe(
    filter((isInitialized) => isInitialized),
    take(1),
    map(() => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

      if (isAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};
```

**Uso en rutas:**

```typescript
{
  path: '',
  component: AuthLayoutComponent,
  canActivate: [guestGuard],
  children: [
    { path: 'login', ... },
    { path: 'register', ... }
  ]
}
```

---

## Interceptors

Los interceptors procesan todas las peticiones HTTP antes de enviarlas y las respuestas antes de entregarlas.

### `authInterceptor`

**Propósito:** Manejar la autenticación JWT automáticamente.

**Funcionalidades:**

1. **Excluir endpoints públicos:** No agrega token a rutas de autenticación
2. **Agregar token:** Añade `Authorization: Bearer <token>` a peticiones protegidas
3. **Refresh automático:** Si recibe 401, intenta renovar el token
4. **Manejo de errores:** Si el refresh falla, cierra la sesión

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const store = inject(Store);

  // 1. Endpoints públicos - no requieren token
  const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

  // 2. Agregar token a la petición
  const token = storage.getAccessToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // 3. Manejar respuesta y posible refresh
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicEndpoint) {
        // Intentar refresh token
        const refreshToken = storage.getRefreshToken();

        if (refreshToken && !isRefreshing) {
          isRefreshing = true;

          return authService.refreshToken(refreshToken).pipe(
            switchMap((tokens) => {
              isRefreshing = false;
              storage.setTokens(tokens.accessToken, tokens.refreshToken);

              // Reintentar petición original con nuevo token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              store.dispatch(new RefreshTokenFailure()); // Cierra sesión
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
```

**Flujo de refresh token:**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Petición HTTP  │────▶│   401 Error     │────▶│  Refresh Token  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │  Refresh OK     │              │  Refresh Fail   │              │  No Refresh     │
               │  Retry Request  │              │  Logout User    │              │  Token          │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
```

### `errorInterceptor`

**Propósito:** Transformar errores HTTP en mensajes amigables para el usuario.

**Funcionalidades:**

1. **Detectar tipo de error:** Cliente vs Servidor
2. **Mapear códigos HTTP:** A mensajes en español
3. **Extraer mensajes:** Del body de la respuesta
4. **Agregar `friendlyMessage`:** Para uso en componentes

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del cliente (red, etc.)
        errorMessage = error.error.message;
      } else {
        // Error del servidor
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor...';
            break;
          case 400:
            errorMessage = extractMessage(error) || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'Sesión expirada...';
            break;
          case 403:
            errorMessage = 'No tienes permisos...';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 409:
            errorMessage = extractMessage(error) || 'Conflicto...';
            break;
          case 422:
            errorMessage = extractMessage(error) || 'Datos inválidos';
            break;
          case 500:
            errorMessage = 'Error interno del servidor...';
            break;
        }
      }

      // Retornar error enriquecido
      return throwError(() => ({
        ...error,
        friendlyMessage: errorMessage,
      }));
    })
  );
};
```

**Uso en componentes:**

```typescript
this.authService.login(credentials).subscribe({
  error: (error) => {
    this.errorMessage = error.friendlyMessage; // Mensaje amigable
  },
});
```

---

## Store (NGXS)

El store centraliza el estado de la aplicación usando el patrón Redux con NGXS.

### Conceptos Clave

- **State:** Objeto inmutable que representa el estado actual
- **Actions:** Eventos que describen qué sucedió
- **Selectors:** Funciones para leer partes del estado
- **Handlers:** Funciones que procesan acciones y actualizan el estado

### AuthState

**Propósito:** Manejar todo el estado de autenticación.

#### Modelo del Estado

```typescript
interface AuthStateModel {
  user: AuthenticatedUser | null; // Usuario actual
  isAuthenticated: boolean; // ¿Está logueado?
  isLoading: boolean; // ¿Operación en curso?
  isInitialized: boolean; // ¿Se verificó la sesión inicial?
  error: string | null; // Mensaje de error
}

// Estado inicial
const defaults: AuthStateModel = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};
```

#### Actions

| Action                | Descripción             | Payload             |
| --------------------- | ----------------------- | ------------------- |
| `Login`               | Iniciar sesión          | `LoginRequest`      |
| `LoginSuccess`        | Login exitoso           | `{ tokens, user }`  |
| `LoginFailure`        | Login fallido           | `{ error }`         |
| `Register`            | Crear cuenta            | `RegisterRequest`   |
| `RegisterSuccess`     | Registro exitoso        | `{ tokens, user }`  |
| `RegisterFailure`     | Registro fallido        | `{ error }`         |
| `CheckSession`        | Verificar sesión actual | -                   |
| `CheckSessionSuccess` | Sesión válida           | `AuthenticatedUser` |
| `CheckSessionFailure` | Sesión inválida         | -                   |
| `RefreshToken`        | Renovar token           | -                   |
| `RefreshTokenSuccess` | Refresh exitoso         | `TokensResponse`    |
| `RefreshTokenFailure` | Refresh fallido         | -                   |
| `Logout`              | Cerrar sesión           | -                   |
| `LogoutSuccess`       | Logout completado       | -                   |
| `ClearAuthError`      | Limpiar error           | -                   |
| `SetAuthLoading`      | Cambiar loading         | `boolean`           |

#### Selectors

```typescript
// Obtener usuario actual
AuthState.user; // AuthenticatedUser | null

// Estado de autenticación
AuthState.isAuthenticated; // boolean
AuthState.isInitialized; // boolean
AuthState.isLoading; // boolean
AuthState.error; // string | null

// Roles
AuthState.userRole; // Role | null
AuthState.isAdmin; // boolean
AuthState.isTrainer; // boolean
```

**Uso en componentes:**

```typescript
// Con signals (recomendado)
readonly user = this.store.selectSignal(AuthState.user);
readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);

// En template
@if (isAuthenticated()) {
  <span>Hola, {{ user()?.email }}</span>
}
```

#### Flujo de Login

```
┌──────────────┐
│    Login     │ dispatch(new Login({ email, password }))
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  isLoading   │ patchState({ isLoading: true })
│    true      │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ AuthService  │────▶│   Backend    │
│   .login()   │◀────│   /login     │
└──────┬───────┘     └──────────────┘
       │
       ├─────────────────────────────────────┐
       │ Success                             │ Error
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│ Save Tokens  │                    │ LoginFailure │
│ CheckSession │                    │ error: msg   │
└──────┬───────┘                    └──────────────┘
       │
       ▼
┌──────────────┐
│ LoginSuccess │
│ user: {...}  │
│ isAuth: true │
└──────────────┘
```

#### Flujo de CheckSession (Inicialización)

Este flujo se ejecuta al cargar la aplicación para verificar si hay una sesión activa.

```
┌──────────────────┐
│   App Init       │ APP_INITIALIZER
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CheckSession    │
└────────┬─────────┘
         │
         ├─────────────────────────────────────┐
         │ Has Tokens                          │ No Tokens
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ GET /auth/me     │                  │ isInitialized:   │
│ (verify session) │                  │     true         │
└────────┬─────────┘                  │ isAuth: false    │
         │                            └──────────────────┘
         ├─────────────────┐
         │ Valid           │ Invalid
         ▼                 ▼
┌──────────────────┐ ┌──────────────────┐
│ CheckSession     │ │ CheckSession     │
│ Success          │ │ Failure          │
│ isAuth: true     │ │ Clear Tokens     │
│ user: {...}      │ │ isAuth: false    │
└──────────────────┘ └──────────────────┘
```

### UserState

**Propósito:** Manejar el perfil del usuario y operaciones relacionadas.

#### Modelo del Estado

```typescript
interface UserStateModel {
  profile: User | null; // Perfil completo del usuario
  isLoading: boolean; // ¿Operación en curso?
  error: string | null; // Mensaje de error
  successMessage: string | null; // Mensaje de éxito
}
```

#### Actions

| Action                  | Descripción           | Payload                 |
| ----------------------- | --------------------- | ----------------------- |
| `LoadProfile`           | Cargar perfil         | -                       |
| `LoadProfileSuccess`    | Carga exitosa         | `User`                  |
| `LoadProfileFailure`    | Carga fallida         | `{ error }`             |
| `UpdateProfile`         | Actualizar perfil     | `UpdateProfileRequest`  |
| `UpdateProfileSuccess`  | Update exitoso        | `User`                  |
| `UpdateProfileFailure`  | Update fallido        | `{ error }`             |
| `ChangePassword`        | Cambiar contraseña    | `ChangePasswordRequest` |
| `ChangePasswordSuccess` | Cambio exitoso        | -                       |
| `ChangePasswordFailure` | Cambio fallido        | `{ error }`             |
| `ClearUserError`        | Limpiar error         | -                       |
| `ClearUserSuccess`      | Limpiar mensaje éxito | -                       |
| `ResetUserState`        | Resetear estado       | -                       |

#### Selectors

```typescript
UserState.profile; // User | null
UserState.isLoading; // boolean
UserState.error; // string | null
UserState.successMessage; // string | null
```

**Uso en componentes:**

```typescript
readonly profile = this.store.selectSignal(UserState.profile);
readonly isLoading = this.store.selectSignal(UserState.isLoading);
readonly error = this.store.selectSignal(UserState.error);

ngOnInit() {
  if (!this.profile()) {
    this.store.dispatch(new LoadProfile());
  }
}
```

---

## Flujos de Datos

### Flujo Completo de Autenticación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APLICACIÓN                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  Component   │───▶│    Store     │───▶│   Service    │                   │
│  │  (dispatch)  │    │   (NGXS)     │    │  (HTTP)      │                   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                   │
│         ▲                   │                   │                            │
│         │                   │                   ▼                            │
│         │                   │           ┌──────────────┐                    │
│         │                   │           │ Interceptors │                    │
│         │                   │           │ - Auth Token │                    │
│         │                   │           │ - Error Msg  │                    │
│         │                   │           └──────┬───────┘                    │
│         │                   │                   │                            │
│         │                   ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Template   │◀───│   Signals    │    │   Backend    │                   │
│  │  (reactive)  │    │  (select)    │    │    API       │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Protección de Rutas

```
┌─────────────┐
│  Navigate   │
│  /dashboard │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  authGuard  │────▶│ Wait for    │
│             │     │ initialized │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Check    │
                    │   isAuth    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │ true           │                │ false
          ▼                                 ▼
   ┌─────────────┐                   ┌─────────────┐
   │   Allow     │                   │  Redirect   │
   │   Access    │                   │  /login     │
   └─────────────┘                   └─────────────┘
```

### Persistencia del Estado

El estado se persiste en `localStorage` usando el plugin de storage de NGXS:

```typescript
// app.config.ts
provideStore(
  [AuthState, UserState],
  withNgxsStoragePlugin({
    keys: ['auth.user', 'auth.isAuthenticated', 'user.profile'],
  })
);
```

**Datos persistidos:**

- `auth.user` - Usuario autenticado
- `auth.isAuthenticated` - Estado de autenticación
- `user.profile` - Perfil del usuario

**Tokens (StorageService):**

- `fitflow_access_token` - Token de acceso
- `fitflow_refresh_token` - Token de refresh

---

## Resumen de Archivos

| Archivo                 | Responsabilidad              |
| ----------------------- | ---------------------------- |
| `auth.guard.ts`         | Proteger rutas autenticadas  |
| `guest.guard.ts`        | Proteger rutas públicas      |
| `auth.interceptor.ts`   | Manejar tokens JWT y refresh |
| `error.interceptor.ts`  | Transformar errores HTTP     |
| `auth.model.ts`         | Interfaces de autenticación  |
| `user.model.ts`         | Interfaces de usuario        |
| `api-response.model.ts` | Interfaces de respuestas API |
| `auth.actions.ts`       | Acciones del store de auth   |
| `auth.state.ts`         | Estado y handlers de auth    |
| `user.actions.ts`       | Acciones del store de user   |
| `user.state.ts`         | Estado y handlers de user    |
