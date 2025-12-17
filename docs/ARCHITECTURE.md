# Arquitectura de FitFlow

Este documento describe la arquitectura técnica del sistema FitFlow, una aplicación para gestión de gimnasios.

---

## Visión General

```mermaid
graph TB
    subgraph Cliente
        Browser[Navegador Web]
        PWA[PWA / Service Worker]
    end

    subgraph Frontend["Frontend (Angular 20)"]
        Components[Componentes]
        Guards[Guards]
        Services[Servicios]
        Store[NGXS State]
    end

    subgraph Backend["Backend (NestJS 11)"]
        Controllers[Controladores]
        ServicesB[Servicios]
        Guards2[Guards / JWT]
        TypeORM[TypeORM]
    end

    subgraph Database["Base de Datos"]
        MySQL[(MySQL 8.0)]
    end

    Browser --> PWA
    PWA --> Components
    Components --> Guards
    Components --> Services
    Services --> Store
    Services -->|HTTP/REST| Controllers
    Controllers --> Guards2
    Controllers --> ServicesB
    ServicesB --> TypeORM
    TypeORM --> MySQL
```

---

## Stack Tecnológico

| Capa                 | Tecnología | Versión |
| -------------------- | ---------- | ------- |
| **Frontend**         | Angular    | 20.x    |
| **State Management** | NGXS       | 18.x    |
| **Backend**          | NestJS     | 11.x    |
| **ORM**              | TypeORM    | 0.3.x   |
| **Base de Datos**    | MySQL      | 8.0     |
| **Autenticación**    | JWT        | -       |
| **Contenedores**     | Docker     | -       |

---

## Arquitectura del Frontend

```mermaid
graph LR
    subgraph Core
        Models[Models]
        Services[Services]
        Guards[Guards]
        Store[NGXS Store]
        Interceptors[Interceptors]
    end

    subgraph Features
        Auth[Auth Module]
        Dashboard[Dashboard]
        Profile[Profile]
        MembershipTypes[Membership Types]
        Payments[Payments]
    end

    subgraph Shared
        Components[UI Components]
        Directives[Directives]
        Pipes[Pipes]
    end

    subgraph Layouts
        AuthLayout[Auth Layout]
        MainLayout[Main Layout]
    end

    Features --> Core
    Features --> Shared
    Features --> Layouts
```

### Estructura de Carpetas Frontend

```
frontend/src/app/
├── core/
│   ├── guards/          # AuthGuard, RoleGuard
│   ├── interceptors/    # AuthInterceptor
│   ├── models/          # Interfaces y tipos
│   ├── services/        # ApiService, AuthService, etc.
│   └── store/           # NGXS States y Actions
├── features/
│   ├── auth/            # Login, Register, Password Reset
│   ├── dashboard/       # Home
│   ├── membership-types/# CRUD Tipos de Membresía
│   ├── payments/        # CRUD Pagos
│   └── profile/         # Ver/Editar Perfil
├── layouts/
│   ├── auth-layout/     # Layout para auth (sin nav)
│   └── main-layout/     # Layout principal (con nav)
└── shared/
    └── components/      # Card, Button, Alert, etc.
```

---

## Arquitectura del Backend

```mermaid
graph TB
    subgraph API["API Layer"]
        Controllers[Controllers]
    end

    subgraph Security["Security Layer"]
        JwtGuard[JWT Guard]
        RolesGuard[Roles Guard]
        RolesDecorator["@Roles Decorator"]
    end

    subgraph Business["Business Layer"]
        Services[Services]
    end

    subgraph Data["Data Layer"]
        Entities[Entities]
        Repositories[Repositories]
        TypeORM[TypeORM]
    end

    subgraph External["External"]
        MySQL[(MySQL)]
    end

    Controllers --> Security
    Security --> Services
    Services --> Repositories
    Repositories --> TypeORM
    TypeORM --> MySQL
```

### Estructura de Carpetas Backend

```
backend/src/
├── common/
│   └── enums/           # Role, Difficulty, DayOfWeek, WorkoutStatus
├── config/              # Configuración (app, db, jwt)
├── database/
│   └── seeders/         # SeederService (datos iniciales)
├── modules/
│   ├── auth/            # Login, Register, JWT
│   │   ├── decorators/  # @Roles, @Public
│   │   ├── guards/      # JwtAuthGuard, RolesGuard
│   │   ├── strategies/  # JwtStrategy
│   │   └── types/       # AuthenticatedUser
│   ├── users/           # CRUD Usuarios
│   ├── membership-types/# CRUD Tipos Membresía
│   ├── memberships/     # CRUD Membresías
│   ├── payments/        # CRUD Pagos
│   ├── muscle-groups/   # CRUD Grupos Musculares
│   ├── exercises/       # CRUD Ejercicios
│   ├── routines/        # CRUD Rutinas
│   ├── user-routines/   # Asignación de rutinas a usuarios
│   └── workouts/        # Registro de entrenamientos
└── main.ts
```

---

## Modelo de Datos

```mermaid
erDiagram
    USER ||--o{ MEMBERSHIP : has
    USER {
        uuid id PK
        string email UK
        string password
        string name
        string phone
        enum role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    MEMBERSHIP_TYPE ||--o{ MEMBERSHIP : defines
    MEMBERSHIP_TYPE {
        uuid id PK
        string name UK
        string description
        decimal price
        int durationDays
        int gracePeriodDays
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    MEMBERSHIP ||--o{ PAYMENT : has
    MEMBERSHIP {
        uuid id PK
        uuid userId FK
        uuid membershipTypeId FK
        date startDate
        date endDate
        enum status
        text notes
        datetime createdAt
        datetime updatedAt
    }

    USER ||--o{ PAYMENT : registers
    PAYMENT {
        uuid id PK
        uuid membershipId FK
        uuid registeredById FK
        decimal amount
        enum paymentMethod
        date paymentDate
        string reference
        text notes
        datetime createdAt
        datetime updatedAt
    }

    MUSCLE_GROUP ||--o{ EXERCISE : contains
    MUSCLE_GROUP {
        uuid id PK
        string code UK
        string name
        string description
        string icon
        int order
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    EXERCISE ||--o{ ROUTINE_EXERCISE : used_in
    EXERCISE {
        uuid id PK
        string name UK
        string description
        uuid muscleGroupId FK
        enum difficulty
        string videoUrl
        string imageUrl
        string instructions
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ROUTINE ||--o{ ROUTINE_EXERCISE : has
    USER ||--o{ ROUTINE : creates
    ROUTINE {
        uuid id PK
        string name
        string description
        uuid createdById FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ROUTINE_EXERCISE {
        uuid id PK
        uuid routineId FK
        uuid exerciseId FK
        int sets
        int reps
        int restSeconds
        int order
        text notes
    }

    USER ||--o{ USER_ROUTINE : assigned
    ROUTINE ||--o{ USER_ROUTINE : assigned_to
    USER_ROUTINE {
        uuid id PK
        uuid userId FK
        uuid routineId FK
        enum dayOfWeek
        boolean isActive
        datetime createdAt
    }

    USER_ROUTINE ||--o{ WORKOUT_LOG : has
    WORKOUT_LOG {
        uuid id PK
        uuid userRoutineId FK
        date date
        enum status
        int duration
        text notes
        datetime createdAt
        datetime updatedAt
    }

    WORKOUT_LOG ||--o{ EXERCISE_LOG : contains
    ROUTINE_EXERCISE ||--o{ EXERCISE_LOG : logged
    EXERCISE_LOG {
        uuid id PK
        uuid workoutLogId FK
        uuid routineExerciseId FK
        int setNumber
        int reps
        decimal weight
        boolean completed
        text notes
    }
```

### Estados de Membresía

| Estado         | Descripción          |
| -------------- | -------------------- |
| `active`       | Membresía vigente    |
| `expired`      | Membresía vencida    |
| `cancelled`    | Membresía cancelada  |
| `grace_period` | En período de gracia |

### Métodos de Pago

| Método     | Descripción   |
| ---------- | ------------- |
| `cash`     | Efectivo      |
| `card`     | Tarjeta       |
| `transfer` | Transferencia |
| `other`    | Otro          |

---

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as MySQL

    U->>F: Ingresa credenciales
    F->>B: POST /auth/login
    B->>DB: Buscar usuario
    DB-->>B: Usuario encontrado
    B->>B: Validar password (bcrypt)
    B->>B: Generar JWT
    B-->>F: { accessToken, refreshToken, user }
    F->>F: Guardar en localStorage
    F->>F: Actualizar NGXS Store
    F-->>U: Redirigir a Dashboard

    Note over F,B: Peticiones autenticadas

    U->>F: Accede a recurso protegido
    F->>B: GET /resource (Authorization: Bearer token)
    B->>B: JwtAuthGuard valida token
    B->>B: RolesGuard valida rol
    B-->>F: Datos del recurso
    F-->>U: Mostrar contenido
```

---

## Sistema de Roles

```mermaid
graph TD
    subgraph Roles
        ADMIN[ADMIN]
        TRAINER[TRAINER]
        USER[USER]
    end

    subgraph Permisos["Permisos por Rol"]
        AdminPerms["Gestión completa<br/>Usuarios, Membresías, Pagos, Tipos"]
        TrainerPerms["Ver usuarios<br/>Gestionar rutinas"]
        UserPerms["Ver perfil propio<br/>Ver membresía propia"]
    end

    ADMIN --> AdminPerms
    TRAINER --> TrainerPerms
    USER --> UserPerms
```

### Matriz de Permisos

| Recurso           | ADMIN | TRAINER | USER |
| ----------------- | ----- | ------- | ---- |
| Usuarios          | CRUD  | Read    | Self |
| Tipos Membresía   | CRUD  | Read    | Read |
| Membresías        | CRUD  | Read    | Self |
| Pagos             | CRUD  | -       | Self |
| Grupos Musculares | CRUD  | Read    | Read |
| Ejercicios        | CRUD  | Read    | Read |
| Rutinas           | CRUD  | CRUD    | Read |
| Asignar Rutinas   | CRUD  | CRUD    | -    |
| Mis Rutinas       | -     | -       | Read |
| Entrenamientos    | All   | Read    | Self |
| Perfil            | All   | Self    | Self |

---

## Configuración PWA

FitFlow está configurado como Progressive Web App (PWA), permitiendo:

- **Instalación** en dispositivos móviles y desktop
- **Modo offline** para funcionalidad básica
- **Actualizaciones automáticas** del Service Worker

### Archivos de Configuración

| Archivo                | Propósito                                     |
| ---------------------- | --------------------------------------------- |
| `manifest.webmanifest` | Metadatos de la app (nombre, iconos, colores) |
| `ngsw-config.json`     | Configuración del Service Worker              |
| `src/assets/icons/`    | Iconos en diferentes tamaños                  |

### Service Worker Strategy

```mermaid
graph LR
    subgraph Cache["Estrategia de Cache"]
        AppShell[App Shell<br/>Cache First]
        API[API Calls<br/>Network First]
        Assets[Assets<br/>Cache First]
    end

    Request[Request] --> Decision{Tipo?}
    Decision -->|HTML/JS/CSS| AppShell
    Decision -->|/api/*| API
    Decision -->|Images/Fonts| Assets
```

### Configuración del Manifest

```json
{
  "name": "FitFlow",
  "short_name": "FitFlow",
  "theme_color": "#667eea",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [...]
}
```

---

## Sistema de Seeding

El backend incluye un sistema de seeding automático que se ejecuta al iniciar la aplicación.

### Funcionamiento

```mermaid
sequenceDiagram
    participant App as NestJS App
    participant Seeder as SeederService
    participant DB as MySQL

    App->>Seeder: onModuleInit()
    Seeder->>DB: Verificar usuarios existentes
    alt No existen
        Seeder->>DB: Crear usuarios base
    end
    Seeder->>DB: Verificar grupos musculares
    alt No existen
        Seeder->>DB: Crear grupos musculares
    end
    Seeder-->>App: Seed completado
```

### Datos Iniciales

**Usuarios (5)**
| Email | Role | Estado |
|-------|------|--------|
| admin@fitflow.com | ADMIN | Activo |
| trainer@fitflow.com | TRAINER | Activo |
| user1@fitflow.com | USER | Activo |
| user2@fitflow.com | USER | Activo |
| inactive@fitflow.com | USER | Inactivo |

**Grupos Musculares (10)**
| Código | Nombre |
|--------|--------|
| chest | Pecho |
| back | Espalda |
| shoulders | Hombros |
| biceps | Bíceps |
| triceps | Tríceps |
| legs | Piernas |
| glutes | Glúteos |
| core | Core |
| cardio | Cardio |
| full_body | Cuerpo Completo |

### Características

- **Idempotente**: No duplica datos si ya existen
- **Automático**: Se ejecuta al iniciar el backend
- **Extensible**: Agregar nuevos seeders en `SeederService`

---

## Despliegue

```mermaid
graph LR
    subgraph Development
        LocalDev[Local Dev]
        Docker[Docker Compose]
    end

    subgraph CI/CD
        GitHub[GitHub]
        Actions[GitHub Actions]
    end

    subgraph Production
        Frontend[Netlify/Vercel]
        Backend[Railway/Render]
        DB[PlanetScale/AWS RDS]
    end

    LocalDev --> GitHub
    GitHub --> Actions
    Actions --> Frontend
    Actions --> Backend
    Backend --> DB
```

### Variables de Entorno

| Variable         | Descripción          | Ejemplo       |
| ---------------- | -------------------- | ------------- |
| `DB_HOST`        | Host de MySQL        | `localhost`   |
| `DB_PORT`        | Puerto de MySQL      | `3306`        |
| `DB_USERNAME`    | Usuario de DB        | `root`        |
| `DB_PASSWORD`    | Password de DB       | `****`        |
| `DB_DATABASE`    | Nombre de DB         | `fit_flow_db` |
| `JWT_SECRET`     | Secreto para JWT     | `****`        |
| `JWT_EXPIRES_IN` | Expiración del token | `1d`          |

---

## Seguridad

### Medidas Implementadas

1. **Autenticación JWT** - Tokens firmados con secreto
2. **Hashing de Passwords** - bcrypt con salt rounds
3. **Guards de Roles** - Control de acceso por rol
4. **Validación de DTOs** - class-validator en backend
5. **Interceptor HTTP** - Token automático en requests
6. **CORS configurado** - Solo orígenes permitidos

### Headers de Seguridad Recomendados

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## Referencias

- [Angular Documentation](https://angular.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [NGXS Documentation](https://www.ngxs.io)
- [Mermaid Documentation](https://mermaid.js.org)
