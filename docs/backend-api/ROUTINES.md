# Routines Controller

Endpoints para gestión de rutinas de entrenamiento.

**Ruta base:** `/routines`

---

## Endpoints

| Método | Ruta                                  | Descripción          | Roles          |
| ------ | ------------------------------------- | -------------------- | -------------- |
| POST   | `/routines`                           | Crear rutina         | ADMIN, TRAINER |
| GET    | `/routines`                           | Listar rutinas       | Todos          |
| GET    | `/routines/:id`                       | Obtener rutina       | Todos          |
| PATCH  | `/routines/:id`                       | Actualizar rutina    | ADMIN, TRAINER |
| DELETE | `/routines/:id`                       | Eliminar rutina      | ADMIN          |
| POST   | `/routines/:id/exercises`             | Agregar ejercicio    | ADMIN, TRAINER |
| PATCH  | `/routines/:id/exercises/:exerciseId` | Actualizar ejercicio | ADMIN, TRAINER |
| DELETE | `/routines/:id/exercises/:exerciseId` | Quitar ejercicio     | ADMIN, TRAINER |

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

| Parámetro       | Tipo   | Default | Descripción                    |
| --------------- | ------ | ------- | ------------------------------ |
| page            | number | 1       | Número de página               |
| limit           | number | 20      | Elementos por página (max 100) |
| includeInactive | string | false   | Incluir inactivas              |

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

| Campo       | Tipo   | Requerido | Descripción            |
| ----------- | ------ | --------- | ---------------------- |
| exerciseId  | UUID   | ✅        | ID del ejercicio       |
| sets        | number | ✅        | Número de series       |
| reps        | number | ✅        | Repeticiones por serie |
| restSeconds | number | ❌        | Segundos de descanso   |
| order       | number | ❌        | Orden en la rutina     |
| notes       | string | ❌        | Notas adicionales      |

**Response (200):** Rutina actualizada con el nuevo ejercicio

---

## PATCH /routines/:id/exercises/:exerciseId

Actualiza un ejercicio de la rutina.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo       | Tipo   | Descripción  |
| ----------- | ------ | ------------ |
| sets        | number | Series       |
| reps        | number | Repeticiones |
| restSeconds | number | Descanso     |
| order       | number | Orden        |
| notes       | string | Notas        |

**Response (200):** Rutina actualizada

---

## DELETE /routines/:id/exercises/:exerciseId

Quita un ejercicio de la rutina.

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Rutina actualizada sin el ejercicio
