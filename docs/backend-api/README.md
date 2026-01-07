# API Reference

Documentación de los endpoints REST del backend de FitFlow.

## Base URL

```
http://localhost:3000/api
```

## Autenticación

La mayoría de endpoints requieren autenticación JWT. Incluir el token en el header:

```
Authorization: Bearer <access_token>
```

## Controllers

| Controller                                | Ruta Base           | Descripción                |
| ----------------------------------------- | ------------------- | -------------------------- |
| [Auth](./AUTH.md)                         | `/auth`             | Autenticación y sesiones   |
| [Users](./USERS.md)                       | `/users`            | Gestión de usuarios        |
| [Dashboard](./DASHBOARD.md)               | `/dashboard`        | Métricas y estadísticas    |
| [Membership Types](./MEMBERSHIP_TYPES.md) | `/membership-types` | Tipos de membresía         |
| [Memberships](./MEMBERSHIPS.md)           | `/memberships`      | Membresías de usuarios     |
| [Payments](./PAYMENTS.md)                 | `/payments`         | Registro de pagos          |
| [Muscle Groups](./MUSCLE_GROUPS.md)       | `/muscle-groups`    | Grupos musculares          |
| [Exercises](./EXERCISES.md)               | `/exercises`        | Catálogo de ejercicios     |
| [Routines](./ROUTINES.md)                 | `/routines`         | Rutinas de entrenamiento   |
| [User Routines](./USER_ROUTINES.md)       | `/user-routines`    | Asignación de rutinas      |
| [Workouts](./WORKOUTS.md)                 | `/workouts`         | Registro de entrenamientos |
| [Notifications](./NOTIFICATIONS.md)       | `/notifications`    | Notificaciones push (FCM)  |

## Roles

| Rol       | Descripción                         |
| --------- | ----------------------------------- |
| `ADMIN`   | Acceso completo al sistema          |
| `TRAINER` | Gestión de usuarios y rutinas       |
| `USER`    | Acceso a su perfil y entrenamientos |

## Códigos de Estado

| Código | Descripción                                  |
| ------ | -------------------------------------------- |
| 200    | OK - Operación exitosa                       |
| 201    | Created - Recurso creado                     |
| 204    | No Content - Operación exitosa sin contenido |
| 400    | Bad Request - Datos inválidos                |
| 401    | Unauthorized - No autenticado                |
| 403    | Forbidden - Sin permisos                     |
| 404    | Not Found - Recurso no encontrado            |
| 409    | Conflict - Conflicto (ej: email duplicado)   |
