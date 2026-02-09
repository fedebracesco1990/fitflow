# Programs Controller

Endpoints para gestión de planes semanales (programas de entrenamiento).

**Ruta base:** `/programs`

---

## Endpoints

| Método | Ruta                                       | Descripción                    | Roles          |
| ------ | ------------------------------------------ | ------------------------------ | -------------- |
| POST   | `/programs`                                | Crear programa                 | ADMIN, TRAINER |
| GET    | `/programs`                                | Listar programas               | ADMIN, TRAINER |
| GET    | `/programs/my-program`                     | Mi programa activo             | Todos          |
| GET    | `/programs/my-program/routines/:routineId` | Mi rutina específica           | Todos          |
| GET    | `/programs/user/:userId/active`            | Plan activo de un usuario      | ADMIN, TRAINER |
| GET    | `/programs/user/:userId/history`           | Historial de planes de usuario | ADMIN, TRAINER |
| GET    | `/programs/:id`                            | Obtener programa               | ADMIN, TRAINER |
| PUT    | `/programs/:id`                            | Actualizar programa            | ADMIN, TRAINER |
| POST   | `/programs/assign`                         | Asignar programa a usuario     | ADMIN, TRAINER |
| DELETE | `/programs/:id`                            | Eliminar programa              | ADMIN, TRAINER |

---

## POST /programs

Crea un nuevo programa semanal con rutinas y ejercicios.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo       | Tipo   | Requerido | Descripción                                   |
| ----------- | ------ | --------- | --------------------------------------------- |
| name        | string | ✅        | Nombre del programa                           |
| description | string | ❌        | Descripción                                   |
| difficulty  | string | ❌        | Dificultad (beginner, intermediate, advanced) |
| routines    | array  | ✅        | Array de rutinas con ejercicios               |

**Estructura de cada rutina:**

| Campo     | Tipo   | Requerido | Descripción                                                       |
| --------- | ------ | --------- | ----------------------------------------------------------------- |
| routineId | UUID   | ✅        | ID de la rutina base                                              |
| order     | number | ✅        | Orden en el programa                                              |
| exercises | array  | ❌        | Ejercicios personalizados (si vacío, copia de la rutina original) |

**Response (201):** Programa creado con rutinas y ejercicios

---

## GET /programs

Lista todos los programas activos.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Plan Fuerza 4 días",
    "description": "Programa de fuerza",
    "difficulty": "intermediate",
    "totalRoutines": 4,
    "createdBy": { "id": "uuid", "name": "Trainer" },
    "routines": [
      {
        "id": "uuid",
        "order": 1,
        "routine": { "id": "uuid", "name": "Día de Pecho" }
      }
    ],
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

## GET /programs/my-program

Obtiene el programa activo del usuario autenticado con todas sus rutinas y ejercicios.

**Roles:** Todos los autenticados

**Response (200):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "programId": "uuid",
  "programName": "Plan Fuerza 4 días",
  "assignedAt": "2026-01-01T00:00:00.000Z",
  "isActive": true,
  "routines": [
    {
      "id": "uuid",
      "name": "Día de Pecho y Tríceps",
      "order": 1,
      "estimatedDuration": 60,
      "exercises": [
        {
          "id": "uuid",
          "exerciseId": "uuid",
          "exercise": {
            "id": "uuid",
            "name": "Press de Banca",
            "muscleGroup": { "name": "Pecho" }
          },
          "order": 1,
          "sets": 4,
          "reps": 10,
          "restSeconds": 90,
          "weight": 60
        }
      ]
    }
  ]
}
```

**Response (200) si no tiene programa:** `null`

---

## GET /programs/my-program/routines/:routineId

Obtiene una rutina específica del programa activo del usuario.

**Roles:** Todos los autenticados

**Response (200):** Rutina con ejercicios completos

**Errores:**

| Código | Descripción                                   |
| ------ | --------------------------------------------- |
| 404    | Rutina no encontrada o no asignada al usuario |

---

## GET /programs/user/:userId/active

Obtiene el plan activo de un usuario específico. Útil para verificar si un usuario ya tiene un plan antes de asignar uno nuevo.

**Roles:** `ADMIN`, `TRAINER`

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| userId    | UUID | ID del usuario |

**Response (200):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "programId": "uuid",
  "programName": "Plan Fuerza 4 días",
  "assignedAt": "2026-01-15T00:00:00.000Z",
  "isActive": true,
  "routines": [{ "id": "uuid", "name": "Día de Pecho", "order": 1 }]
}
```

**Response (200) si no tiene plan activo:** `null`

---

## GET /programs/user/:userId/history

Obtiene el historial completo de planes asignados a un usuario, incluyendo activos e inactivos, con rutinas y ejercicios base (datos tal como fueron asignados, antes de cualquier ejecución).

**Roles:** `ADMIN`, `TRAINER`

**Parámetros de ruta:**

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| userId    | UUID | ID del usuario |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "programName": "Plan Fuerza 4 días",
    "assignedAt": "2026-02-01T00:00:00.000Z",
    "endDate": null,
    "isActive": true,
    "routines": [
      {
        "id": "uuid",
        "name": "Día de Pecho y Tríceps",
        "order": 1,
        "estimatedDuration": 60,
        "exercises": [
          {
            "exerciseId": "uuid",
            "exercise": { "name": "Press de Banca", "muscleGroup": { "name": "Pecho" } },
            "sets": 4,
            "reps": 10,
            "weight": 60
          }
        ]
      }
    ]
  },
  {
    "id": "uuid",
    "userId": "uuid",
    "programName": "Plan Hipertrofia",
    "assignedAt": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-02-01T00:00:00.000Z",
    "isActive": false,
    "routines": [...]
  }
]
```

> **Nota:** Los resultados están ordenados por `assignedAt` descendente. El plan activo siempre aparece primero.

---

## GET /programs/:id

Obtiene un programa por su ID con todas sus rutinas y ejercicios.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Programa completo

**Errores:**

| Código | Descripción            |
| ------ | ---------------------- |
| 404    | Programa no encontrado |

---

## PUT /programs/:id

Actualiza un programa existente. Reemplaza las rutinas por las nuevas proporcionadas.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:** Igual que POST /programs

**Response (200):** Programa actualizado

---

## POST /programs/assign

Asigna un programa semanal a un usuario. Si el usuario ya tiene un plan activo, el plan anterior se desactiva automáticamente (`isActive: false`, `endDate: now`) y se crea el nuevo.

Al asignar, se envía una notificación push al usuario.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo      | Tipo   | Requerido | Descripción                                  |
| ---------- | ------ | --------- | -------------------------------------------- |
| programId  | UUID   | ✅        | ID del programa a asignar                    |
| userId     | UUID   | ✅        | ID del usuario                               |
| assignedAt | string | ❌        | Fecha de asignación (ISO 8601, default: now) |

**Response (201):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "programId": "uuid",
  "programName": "Plan Fuerza 4 días",
  "assignedAt": "2026-02-01T00:00:00.000Z",
  "isActive": true,
  "routines": [
    {
      "id": "uuid",
      "name": "Día de Pecho y Tríceps",
      "order": 1,
      "exercises": [...]
    }
  ]
}
```

**Comportamiento de reasignación:**

1. Desactiva planes activos previos del usuario (`isActive: false`, `endDate: now`)
2. Crea nuevo `UserProgram` con rutinas y ejercicios copiados del programa base
3. Envía notificación al usuario: "Se te ha asignado el plan [nombre]. ¡Revisa tus rutinas!"

**Errores:**

| Código | Descripción            |
| ------ | ---------------------- |
| 404    | Programa no encontrado |

---

## DELETE /programs/:id

Desactiva un programa (soft delete).

**Roles:** `ADMIN`, `TRAINER`

**Response:** 200 OK
