# Exercises Controller

Endpoints para gestión del catálogo de ejercicios.

**Ruta base:** `/exercises`

---

## Endpoints

| Método | Ruta                                     | Descripción          | Roles         |
| ------ | ---------------------------------------- | -------------------- | ------------- |
| POST   | `/exercises`                             | Crear ejercicio      | ADMIN/TRAINER |
| GET    | `/exercises`                             | Listar ejercicios    | Todos         |
| GET    | `/exercises/muscle-group/:muscleGroupId` | Por grupo muscular   | Todos         |
| GET    | `/exercises/:id`                         | Obtener ejercicio    | Todos         |
| PATCH  | `/exercises/:id`                         | Actualizar ejercicio | ADMIN/TRAINER |
| PATCH  | `/exercises/:id/deactivate`              | Desactivar ejercicio | ADMIN/TRAINER |
| DELETE | `/exercises/:id`                         | Eliminar ejercicio   | ADMIN/TRAINER |

---

## POST /exercises

Crea un nuevo ejercicio.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo         | Tipo   | Requerido | Descripción                              |
| ------------- | ------ | --------- | ---------------------------------------- |
| name          | string | ✅        | Nombre único (max 100 caracteres)        |
| description   | string | ❌        | Descripción del ejercicio                |
| muscleGroupId | UUID   | ✅        | ID del grupo muscular                    |
| difficulty    | enum   | ❌        | `beginner`, `intermediate`, `advanced`   |
| equipment     | enum   | ❌        | Tipo de equipamiento (ver valores abajo) |
| videoUrl      | string | ❌        | URL de video instructivo                 |
| imageUrl      | string | ❌        | URL de imagen                            |

**Valores de Equipment:**

| Valor      | Descripción      |
| ---------- | ---------------- |
| barbell    | Barra            |
| dumbbell   | Mancuernas       |
| machine    | Máquina          |
| cable      | Polea/Cable      |
| bodyweight | Peso Corporal    |
| kettlebell | Kettlebell       |
| bands      | Bandas Elásticas |
| none       | Sin Equipamiento |

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
  "equipment": "barbell",
  "videoUrl": null,
  "imageUrl": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## GET /exercises

Lista ejercicios con paginación y filtros avanzados.

**Roles:** Todos los autenticados

**Query Parameters:**

| Parámetro       | Tipo   | Default | Descripción                                                |
| --------------- | ------ | ------- | ---------------------------------------------------------- |
| page            | number | 1       | Número de página                                           |
| limit           | number | 20      | Elementos por página (max 100)                             |
| includeInactive | string | false   | Incluir ejercicios inactivos                               |
| muscleGroupId   | UUID   | -       | Filtrar por grupo muscular                                 |
| difficulty      | enum   | -       | Filtrar por nivel (`beginner`, `intermediate`, `advanced`) |
| equipment       | enum   | -       | Filtrar por equipamiento (ver valores en POST)             |
| search          | string | -       | Búsqueda por nombre o descripción (max 100 chars)          |

**Ejemplos de uso:**

```
GET /exercises?difficulty=beginner&equipment=bodyweight
GET /exercises?muscleGroupId=uuid&search=press
GET /exercises?equipment=barbell&page=2&limit=10
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Press de Banca",
      "description": "Ejercicio básico para pecho",
      "difficulty": "intermediate",
      "equipment": "barbell",
      "videoUrl": null,
      "imageUrl": null,
      "muscleGroup": {
        "id": "uuid",
        "code": "chest",
        "name": "Pecho"
      },
      "isActive": true
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## GET /exercises/muscle-group/:muscleGroupId

Lista ejercicios activos por grupo muscular.

> **Nota:** Este endpoint es legacy. Preferir usar `GET /exercises?muscleGroupId=uuid`

**Roles:** Todos los autenticados

**Parámetros:**

| Param         | Tipo | Descripción           |
| ------------- | ---- | --------------------- |
| muscleGroupId | UUID | ID del grupo muscular |

**Response (200):** Array de ejercicios del grupo

---

## GET /exercises/:id

Obtiene un ejercicio por ID.

**Roles:** Todos los autenticados

**Response (200):** Ejercicio con grupo muscular

---

## PATCH /exercises/:id

Actualiza un ejercicio.

**Roles:** `ADMIN`, `TRAINER`

**Request Body:**

| Campo         | Tipo    | Descripción                            |
| ------------- | ------- | -------------------------------------- |
| name          | string  | Nombre único                           |
| description   | string  | Descripción                            |
| muscleGroupId | UUID    | Grupo muscular                         |
| difficulty    | enum    | `beginner`, `intermediate`, `advanced` |
| equipment     | enum    | Tipo de equipamiento                   |
| videoUrl      | string  | URL video                              |
| imageUrl      | string  | URL imagen                             |
| isActive      | boolean | Estado activo/inactivo                 |

**Response (200):** Ejercicio actualizado

---

## PATCH /exercises/:id/deactivate

Desactiva un ejercicio (soft delete).

**Roles:** `ADMIN`, `TRAINER`

**Response (200):** Ejercicio con `isActive: false`

---

## DELETE /exercises/:id

Elimina un ejercicio permanentemente.

**Roles:** `ADMIN`, `TRAINER`

**Response:** 204 No Content

> **Nota:** Considerar usar `/deactivate` en lugar de eliminar para mantener historial
