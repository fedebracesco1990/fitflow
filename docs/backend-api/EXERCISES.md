# Exercises Controller

Endpoints para gestión del catálogo de ejercicios.

**Ruta base:** `/exercises`

---

## Endpoints

| Método | Ruta                                   | Descripción          | Roles |
| ------ | -------------------------------------- | -------------------- | ----- |
| POST   | `/exercises`                           | Crear ejercicio      | ADMIN |
| GET    | `/exercises`                           | Listar ejercicios    | Todos |
| GET    | `/exercises/muscle-group/:muscleGroup` | Por grupo muscular   | Todos |
| GET    | `/exercises/:id`                       | Obtener ejercicio    | Todos |
| PATCH  | `/exercises/:id`                       | Actualizar ejercicio | ADMIN |
| PATCH  | `/exercises/:id/deactivate`            | Desactivar ejercicio | ADMIN |
| DELETE | `/exercises/:id`                       | Eliminar ejercicio   | ADMIN |

---

## POST /exercises

Crea un nuevo ejercicio.

**Roles:** `ADMIN`

**Request Body:**

| Campo         | Tipo   | Requerido | Descripción                                   |
| ------------- | ------ | --------- | --------------------------------------------- |
| name          | string | ✅        | Nombre único                                  |
| description   | string | ❌        | Descripción                                   |
| muscleGroupId | UUID   | ✅        | ID del grupo muscular                         |
| difficulty    | string | ❌        | Dificultad (beginner, intermediate, advanced) |
| videoUrl      | string | ❌        | URL de video instructivo                      |
| imageUrl      | string | ❌        | URL de imagen                                 |
| instructions  | string | ❌        | Instrucciones de ejecución                    |

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Press de Banca",
  "description": "Ejercicio básico para pecho",
  "muscleGroupId": "uuid",
  "muscleGroup": {
    "id": "uuid",
    "code": "chest",
    "name": "Pecho"
  },
  "difficulty": "intermediate",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /exercises

Lista todos los ejercicios.

**Roles:** Todos los autenticados

**Query Parameters:**

| Param           | Tipo   | Default | Descripción       |
| --------------- | ------ | ------- | ----------------- |
| includeInactive | string | false   | Incluir inactivos |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Press de Banca",
    "description": "Ejercicio básico para pecho",
    "difficulty": "intermediate",
    "muscleGroup": {
      "id": "uuid",
      "code": "chest",
      "name": "Pecho"
    },
    "isActive": true
  }
]
```

---

## GET /exercises/muscle-group/:muscleGroup

Lista ejercicios por grupo muscular.

**Roles:** Todos los autenticados

**Parámetros:**

| Param       | Tipo   | Descripción                        |
| ----------- | ------ | ---------------------------------- |
| muscleGroup | string | Código del grupo (ej: chest, back) |

**Response (200):** Array de ejercicios del grupo

---

## GET /exercises/:id

Obtiene un ejercicio por ID.

**Roles:** Todos los autenticados

**Response (200):** Ejercicio con grupo muscular

---

## PATCH /exercises/:id

Actualiza un ejercicio.

**Roles:** `ADMIN`

**Request Body:**

| Campo         | Tipo    | Descripción    |
| ------------- | ------- | -------------- |
| name          | string  | Nombre         |
| description   | string  | Descripción    |
| muscleGroupId | UUID    | Grupo muscular |
| difficulty    | string  | Dificultad     |
| videoUrl      | string  | URL video      |
| imageUrl      | string  | URL imagen     |
| instructions  | string  | Instrucciones  |
| isActive      | boolean | Estado         |

**Response (200):** Ejercicio actualizado

---

## PATCH /exercises/:id/deactivate

Desactiva un ejercicio (soft delete).

**Roles:** `ADMIN`

**Response (200):** Ejercicio con `isActive: false`

---

## DELETE /exercises/:id

Elimina un ejercicio permanentemente.

**Roles:** `ADMIN`

**Response:** 204 No Content

> **Nota:** Considerar usar `/deactivate` en lugar de eliminar
