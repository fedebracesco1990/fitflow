# Muscle Groups Controller

Endpoints para gestión de grupos musculares.

**Ruta base:** `/muscle-groups`

---

## Endpoints

| Método | Ruta                  | Descripción            | Roles   |
| ------ | --------------------- | ---------------------- | ------- |
| GET    | `/muscle-groups`      | Listar grupos          | Público |
| GET    | `/muscle-groups/:id`  | Obtener grupo          | Público |
| POST   | `/muscle-groups`      | Crear grupo            | ADMIN   |
| PATCH  | `/muscle-groups/:id`  | Actualizar grupo       | ADMIN   |
| POST   | `/muscle-groups/seed` | Poblar datos iniciales | ADMIN   |

---

## GET /muscle-groups

Lista todos los grupos musculares.

**Autenticación:** No requerida

**Query Parameters:**

| Param           | Tipo   | Default | Descripción       |
| --------------- | ------ | ------- | ----------------- |
| includeInactive | string | false   | Incluir inactivos |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "code": "chest",
    "name": "Pecho",
    "description": "Músculos pectorales",
    "icon": "💪",
    "order": 1,
    "isActive": true
  },
  {
    "id": "uuid",
    "code": "back",
    "name": "Espalda",
    "description": "Músculos dorsales",
    "icon": "🔙",
    "order": 2,
    "isActive": true
  }
]
```

---

## GET /muscle-groups/:id

Obtiene un grupo muscular por ID.

**Autenticación:** No requerida

**Response (200):** Grupo muscular

---

## POST /muscle-groups

Crea un nuevo grupo muscular.

**Roles:** `ADMIN`

**Request Body:**

| Campo       | Tipo   | Requerido | Descripción                    |
| ----------- | ------ | --------- | ------------------------------ |
| code        | string | ✅        | Código único (ej: chest, back) |
| name        | string | ✅        | Nombre visible                 |
| description | string | ❌        | Descripción                    |
| icon        | string | ❌        | Emoji/icono                    |
| order       | number | ❌        | Orden de visualización         |

**Response (201):** Grupo muscular creado

---

## PATCH /muscle-groups/:id

Actualiza un grupo muscular.

**Roles:** `ADMIN`

**Request Body:**

| Campo       | Tipo    | Descripción |
| ----------- | ------- | ----------- |
| name        | string  | Nombre      |
| description | string  | Descripción |
| icon        | string  | Icono       |
| order       | number  | Orden       |
| isActive    | boolean | Estado      |

**Response (200):** Grupo muscular actualizado

---

## POST /muscle-groups/seed

Puebla los grupos musculares predefinidos.

**Roles:** `ADMIN`

> **Nota:** Esto se ejecuta automáticamente al iniciar el backend.

**Grupos predefinidos:**

| Código    | Nombre          |
| --------- | --------------- |
| chest     | Pecho           |
| back      | Espalda         |
| shoulders | Hombros         |
| biceps    | Bíceps          |
| triceps   | Tríceps         |
| legs      | Piernas         |
| glutes    | Glúteos         |
| core      | Core            |
| cardio    | Cardio          |
| full_body | Cuerpo Completo |

**Response (200):**

```json
{
  "message": "10 grupos musculares creados"
}
```
