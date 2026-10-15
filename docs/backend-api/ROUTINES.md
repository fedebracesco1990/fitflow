# Routines Controller

Endpoints para gestión de rutinas de entrenamiento.

**Ruta base:** `/routines`

---

## Endpoints

| Método | Ruta                                                                 | Descripción                                    | Roles          |
| ------ | -------------------------------------------------------------------- | ---------------------------------------------- | -------------- |
| POST   | `/routines`                                                          | Crear rutina                                   | ADMIN, TRAINER |
| GET    | `/routines`                                                          | Listar rutinas                                 | Todos          |
| GET    | `/routines/:id`                                                      | Obtener rutina                                 | Todos          |
| PATCH  | `/routines/:id`                                                      | Actualizar rutina                              | ADMIN, TRAINER |
| DELETE | `/routines/:id`                                                      | Eliminar rutina                                | ADMIN          |
| POST   | `/routines/:id/exercises`                                            | Agregar ejercicio                              | ADMIN, TRAINER |
| PATCH  | `/routines/:id/exercises/:exerciseId`                                | Actualizar ejercicio                           | ADMIN, TRAINER |
| DELETE | `/routines/:id/exercises/:exerciseId`                                | Quitar ejercicio                               | ADMIN, TRAINER |
| PATCH  | `/routines/:id/exercises`                                            | Reemplazar todos los ejercicios                | ADMIN, TRAINER |
| GET    | `/routines/templates`                                                | Listar plantillas                              | ADMIN, TRAINER |
| POST   | `/routines/:id/save-as-template`                                     | Guardar como plantilla                         | ADMIN, TRAINER |
| POST   | `/routines/from-template/:templateId`                                | Crear desde plantilla                          | ADMIN, TRAINER |
| GET    | `/routines/program-routines/:programRoutineId`                       | Obtener rutina de programa con ejercicios      | ADMIN, TRAINER |
| GET    | `/routines/program-routines/:programRoutineId/exercises`             | Listar ejercicios personalizados               | ADMIN, TRAINER |
| POST   | `/routines/program-routines/:programRoutineId/exercises`             | Agregar ejercicio personalizado                | ADMIN, TRAINER |
| PATCH  | `/routines/program-routines/:programRoutineId/exercises/:exerciseId` | Actualizar ejercicio personalizado             | ADMIN, TRAINER |
| DELETE | `/routines/program-routines/:programRoutineId/exercises/:exerciseId` | Quitar ejercicio personalizado                 | ADMIN, TRAINER |
| POST   | `/routines/program-routines/:programRoutineId/exercises/bulk`        | Reemplazar todos los ejercicios personalizados | ADMIN, TRAINER |

> **Asignación a usuarios:** no existe `POST /routines/:id/assign`. Las rutinas se asignan a usuarios a través de programas con `POST /programs/assign` (ver [PROGRAMS.md](./PROGRAMS.md)).

---

## POST /routines

Crea una nueva rutina.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo             | Tipo   | Requerido | Descripción                                   |
| ----------------- | ------ | --------- | --------------------------------------------- |
| name              | string | ✅        | Nombre de la rutina                           |
| description       | string | ❌        | Descripción                                   |
| difficulty        | string | ❌        | Dificultad (beginner, intermediate, advanced) |
| estimatedDuration | number | ❌        | Duración en minutos                           |

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Rutina Full Body",
  "description": "Entrenamiento completo",
  "difficulty": "beginner",
  "estimatedDuration": 45,
  "createdById": "uuid",
  "exercises": [],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /routines

Lista rutinas con paginación.

**Roles:** Todos los autenticados

**Query Parameters:**

| Parámetro       | Tipo   | Default | Descripción                        |
| --------------- | ------ | ------- | ---------------------------------- |
| page            | number | 1       | Número de página                   |
| limit           | number | 20      | Elementos por página (max 100)     |
| includeInactive | string | false   | Incluir inactivas                  |
| createdBy       | UUID   | -       | Filtrar por ID del trainer creador |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Rutina Full Body",
      "description": "Entrenamiento completo",
      "difficulty": "beginner",
      "estimatedDuration": 45,
      "exercises": [
        {
          "id": "uuid",
          "order": 1,
          "sets": 3,
          "reps": 12,
          "restSeconds": 60,
          "exercise": {
            "id": "uuid",
            "name": "Sentadilla",
            "muscleGroup": { "name": "Piernas" }
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

## GET /routines/:id

Obtiene una rutina con sus ejercicios.

**Roles:** Todos los autenticados

**Response (200):** Rutina completa con ejercicios

---

## PATCH /routines/:id

Actualiza una rutina.

**Roles:** `ADMIN`, `TRAINER`

> TRAINER solo puede editar sus propias rutinas

**Request Body:**

| Campo             | Tipo    | Descripción |
| ----------------- | ------- | ----------- |
| name              | string  | Nombre      |
| description       | string  | Descripción |
| difficulty        | string  | Dificultad  |
| estimatedDuration | number  | Duración    |
| isActive          | boolean | Estado      |

**Response (200):** Rutina actualizada

---

## DELETE /routines/:id

Elimina una rutina.

**Roles:** `ADMIN`

**Response:** 204 No Content

---

## POST /routines/:id/exercises

Agrega un ejercicio a la rutina.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo           | Tipo   | Requerido | Descripción                          |
| --------------- | ------ | --------- | ------------------------------------ |
| exerciseId      | UUID   | ✅        | ID del ejercicio                     |
| sets            | number | ❌        | Número de series (default: 3)        |
| reps            | number | ❌        | Repeticiones por serie (default: 12) |
| restSeconds     | number | ❌        | Segundos de descanso (default: 60)   |
| order           | number | ❌        | Orden en la rutina (auto-calculado)  |
| notes           | string | ❌        | Notas adicionales                    |
| suggestedWeight | number | ❌        | Peso sugerido en kg (0-500)          |

**Response (201):** Rutina actualizada con el nuevo ejercicio

---

## PATCH /routines/:id/exercises/:exerciseId

Actualiza un ejercicio de la rutina.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo           | Tipo   | Descripción         |
| --------------- | ------ | ------------------- |
| sets            | number | Series              |
| reps            | number | Repeticiones        |
| restSeconds     | number | Descanso            |
| order           | number | Orden               |
| notes           | string | Notas               |
| suggestedWeight | number | Peso sugerido en kg |

**Response (200):** Rutina actualizada

---

## DELETE /routines/:id/exercises/:exerciseId

Quita un ejercicio de la rutina.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Rutina actualizada sin el ejercicio

---

## PATCH /routines/:id/exercises

Reemplaza **todos** los ejercicios de la rutina por la lista enviada.

**Roles:** `ADMIN`, `TRAINER`

> TRAINER solo puede modificar sus propias rutinas

**Request Body:**

```json
{
  "exercises": [{ "exerciseId": "uuid", "sets": 4, "reps": 10, "restSeconds": 90, "order": 1 }]
}
```

Cada elemento de `exercises` tiene los mismos campos que `POST /routines/:id/exercises`. Si no se envía `order`, se usa la posición en el array.

**Response (200):** Lista de ejercicios nuevos de la rutina

> **Transaccional:** el borrado de los ejercicios anteriores y la inserción de los nuevos ocurren en una única transacción. Si falla alguna inserción, no se aplica ningún cambio y la rutina conserva sus ejercicios anteriores.

**Errores:**

| Código | Descripción                                            |
| ------ | ------------------------------------------------------ |
| 403    | No tiene permisos para modificar esta rutina           |
| 404    | Rutina no encontrada                                   |
| 409    | No se pueden agregar ejercicios duplicados a la rutina |

---

## Ejercicios personalizados por rutina de programa

Una rutina incluida en un programa (`ProgramRoutine`) puede tener ejercicios personalizados que reemplazan a los de la rutina base solo para esa instancia, sin modificar la rutina original.

> En las operaciones de escritura, TRAINER solo puede modificar programas creados por él (ADMIN puede modificar cualquiera). Si no tiene permisos se responde `403`.

### GET /routines/program-routines/:programRoutineId

Obtiene la rutina de programa con la rutina base y sus ejercicios (`routine.exercises`) y los ejercicios personalizados (`customExercises`), cada uno con su `exercise`.

**Roles:** `ADMIN`, `TRAINER`

**Errores:**

| Código | Descripción                  |
| ------ | ---------------------------- |
| 404    | ProgramRoutine no encontrado |

---

### GET /routines/program-routines/:programRoutineId/exercises

Lista los ejercicios personalizados de la rutina de programa, ordenados por `order`, con su `exercise`.

**Roles:** `ADMIN`, `TRAINER`

---

### POST /routines/program-routines/:programRoutineId/exercises

Agrega un ejercicio personalizado.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo       | Tipo   | Requerido | Descripción                          |
| ----------- | ------ | --------- | ------------------------------------ |
| exerciseId  | UUID   | ✅        | ID del ejercicio (debe estar activo) |
| order       | number | ✅        | Orden (min 1)                        |
| sets        | number | ✅        | Series (min 1)                       |
| reps        | number | ✅        | Repeticiones (min 1)                 |
| restSeconds | number | ❌        | Descanso en segundos (default: 60)   |
| notes       | string | ❌        | Notas                                |
| weight      | number | ❌        | Peso en kg                           |

**Response (201):** Ejercicio personalizado creado

**Errores:**

| Código | Descripción                                    |
| ------ | ---------------------------------------------- |
| 403    | No tiene permisos para modificar este programa |
| 404    | ProgramRoutine o ejercicio no encontrado       |

---

### PATCH /routines/program-routines/:programRoutineId/exercises/:exerciseId

Actualiza un ejercicio personalizado. `exerciseId` es el ID del ejercicio personalizado. Todos los campos son opcionales: `order`, `sets`, `reps`, `restSeconds`, `notes`, `weight`.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Ejercicio personalizado actualizado

**Errores:**

| Código | Descripción                                            |
| ------ | ------------------------------------------------------ |
| 403    | No tiene permisos para modificar este programa         |
| 404    | ProgramRoutine o ejercicio personalizado no encontrado |

---

### DELETE /routines/program-routines/:programRoutineId/exercises/:exerciseId

Quita un ejercicio personalizado.

**Roles:** `ADMIN`, `TRAINER`

**Response:** 200 OK (sin contenido)

**Errores:**

| Código | Descripción                                            |
| ------ | ------------------------------------------------------ |
| 403    | No tiene permisos para modificar este programa         |
| 404    | ProgramRoutine o ejercicio personalizado no encontrado |

---

### POST /routines/program-routines/:programRoutineId/exercises/bulk

Reemplaza **todos** los ejercicios personalizados de la rutina de programa.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

```json
{
  "exercises": [
    { "exerciseId": "uuid", "order": 1, "sets": 4, "reps": 8, "restSeconds": 120, "weight": 60 }
  ]
}
```

Cada elemento tiene los mismos campos que `POST /routines/program-routines/:programRoutineId/exercises`.

**Response (201):** Lista de ejercicios personalizados nuevos

> **Transaccional:** el borrado y la inserción ocurren en una única transacción. Si falla alguna inserción, no se aplica ningún cambio.

**Errores:**

| Código | Descripción                                    |
| ------ | ---------------------------------------------- |
| 403    | No tiene permisos para modificar este programa |
| 404    | ProgramRoutine no encontrado                   |

---

## Plantillas de Rutinas

Los siguientes endpoints permiten gestionar plantillas de rutinas reutilizables.

### GET /routines/templates

Lista todas las plantillas disponibles con filtros opcionales.

**Roles:** `ADMIN`, `TRAINER`

**Query Parameters:**

| Parámetro | Tipo   | Default | Descripción                                                                                          |
| --------- | ------ | ------- | ---------------------------------------------------------------------------------------------------- |
| page      | number | 1       | Número de página                                                                                     |
| limit     | number | 20      | Elementos por página                                                                                 |
| category  | string | -       | Filtrar por categoría (strength, hypertrophy, endurance, cardio, flexibility, functional, full_body) |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Plantilla: Fuerza 5x5",
      "description": "Programa clásico de fuerza",
      "difficulty": "intermediate",
      "estimatedDuration": 60,
      "isTemplate": true,
      "templateCategory": "strength",
      "exercises": [...],
      "createdBy": { "id": "uuid", "firstName": "Juan" }
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### POST /routines/:id/save-as-template

Convierte una rutina existente en una plantilla reutilizable.

**Roles:** `ADMIN`, `TRAINER`

> TRAINER solo puede convertir sus propias rutinas

**Request Body:**

| Campo    | Tipo   | Requerido | Descripción                                                                              |
| -------- | ------ | --------- | ---------------------------------------------------------------------------------------- |
| category | string | ✅        | Categoría (strength, hypertrophy, endurance, cardio, flexibility, functional, full_body) |
| name     | string | ❌        | Nuevo nombre para la plantilla                                                           |

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Plantilla: Mi Rutina",
  "isTemplate": true,
  "templateCategory": "hypertrophy",
  ...
}
```

**Errores:**

| Código | Descripción                        |
| ------ | ---------------------------------- |
| 400    | La rutina ya es una plantilla      |
| 403    | No tiene permisos para esta rutina |
| 404    | Rutina no encontrada               |

---

### POST /routines/from-template/:templateId

Crea una nueva rutina a partir de una plantilla existente, copiando todos sus ejercicios.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo       | Tipo   | Requerido | Descripción                                        |
| ----------- | ------ | --------- | -------------------------------------------------- |
| name        | string | ❌        | Nombre para la nueva rutina (default: "X (copia)") |
| description | string | ❌        | Descripción para la nueva rutina                   |

**Response (201):**

```json
{
  "id": "uuid-nueva",
  "name": "Fuerza 5x5 (copia)",
  "description": "Programa clásico de fuerza",
  "isTemplate": false,
  "templateCategory": null,
  "exercises": [...],
  "createdById": "uuid-del-usuario"
}
```

**Errores:**

| Código | Descripción             |
| ------ | ----------------------- |
| 404    | Plantilla no encontrada |

---

## Categorías de Plantillas

| Valor       | Descripción     |
| ----------- | --------------- |
| strength    | Fuerza          |
| hypertrophy | Hipertrofia     |
| endurance   | Resistencia     |
| cardio      | Cardio          |
| flexibility | Flexibilidad    |
| functional  | Funcional       |
| full_body   | Cuerpo Completo |
