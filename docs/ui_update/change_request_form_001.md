# Formulario de Solicitud de Cambio - FitFlow

## 1. INFORMACIÓN BÁSICA

**Nombre del cambio:**

> Rediseño de tabla de rutinas y nuevo flujo de creación con selección de tipo

**Tipo de cambio:**

> [x] Visual/Estético
> [x] Funcional/Flujo

**Prioridad:**

> [x] Alta

**Rol afectado:**

> [x] Admin | [x] Trainer

---

## 2. UBICACIÓN DEL CAMBIO

**Pantalla/Módulo:**

> Gestión de Entrenamiento - Tab Rutinas

**URL aproximada:**

> /training/routines o /app/training

**Componente específico:**

> - Tabla de rutinas
> - Botón "Nueva Rutina"
> - Modal de creación
> - Flujos de creación de Rutina Diaria y Programa Semanal

---

## 3. DESCRIPCIÓN DEL CAMBIO

**¿Qué quiere el cliente?**

> Mejorar la visualización y flujo de creación de rutinas con los siguientes cambios:
>
> 1. Agregar breadcrumb de navegación (Entrenamiento > Rutinas)
> 2. Agregar columna "Tipo" en la tabla para distinguir entre Rutina Diaria y Programa Semanal
> 3. Agregar filtro por tipo arriba de la tabla
> 4. Simplificar acciones (eliminar botón "Builder", mantener solo: Asignar, Editar, Eliminar)
> 5. Cambiar botón "Constructor Visual" por "Agregar Rutina" con ícono de estrella
> 6. Implementar modal de selección de tipo al crear nueva rutina
> 7. Dos flujos de creación diferentes según tipo seleccionado

**¿Cómo funciona actualmente?**

> - Al hacer clic en "+ Nueva Rutina" o "Constructor Visual" va directo a crear
> - Botones de acción: Asignar, Builder, Editar, Eliminar (4 botones)
> - No hay columna "Tipo" en la tabla
> - No hay filtro por tipo
> - No hay breadcrumb
> - No diferencia entre tipos de rutinas

**¿Cómo debería funcionar después del cambio?**

> - Al hacer clic en "+ Agregar Rutina" (con estrella): abre modal de selección
> - Modal muestra 2 opciones: "Rutina Diaria" y "Programa Semanal"
> - Si selecciona "Rutina Diaria": abre vista con biblioteca de ejercicios + formulario de rutina diaria
> - Si selecciona "Programa Semanal": abre vista con biblioteca de rutinas diarias + formulario de programa semanal
> - Tabla muestra columna "Tipo" con badges
> - Filtro permite filtrar por tipo
> - Acciones reducidas a 3 iconos

---

## 4. FLUJO DE USUARIO

**Flujo principal de creación:**

1. Usuario está en tabla de Rutinas
2. Hace clic en botón "+ Agregar Rutina" (azul, con estrella)
3. Sistema abre modal "Nueva Rutina" con 2 opciones en cards
4. Usuario selecciona "Rutina Diaria" o "Programa Semanal"
5. Usuario hace clic en "Crear"
6. Sistema redirige según selección:
   - **Rutina Diaria**: Abre vista split con biblioteca de ejercicios (izq) y formulario "Nueva Rutina Diaria" (der)
   - **Programa Semanal**: Abre vista split con biblioteca de rutinas diarias (izq) y formulario "Nuevo Programa Semanal" (der)

**Flujo de visualización mejorada:**

1. Usuario entra a Gestión de Entrenamiento > Rutinas
2. Ve breadcrumb en la parte superior
3. Ve filtro "Tipo" con dropdown arriba de la tabla
4. En tabla ve columna nueva "Tipo" con badges (Programa Semanal, Rutina Diaria)
5. Botones de acción ahora son solo 3 iconos: Asignar, Editar, Eliminar

---

## 5. REGLAS DE NEGOCIO

- [x] Solo visible para Admin y Trainer
- [x] Requiere validación de tipo de rutina antes de crear
- [x] Diferencia flujos según tipo seleccionado
- [x] **Programa Semanal compuesto por múltiples Rutinas Diarias**

**Reglas específicas:**

> - **IMPORTANTE**: Un Programa Semanal está compuesto por varias Rutinas Diarias (relación uno-a-muchos)
> - Columna "Tipo" debe mostrar badge con:
>   - "Programa Semanal" para rutinas compuestas
>   - "Rutina Diaria" para rutinas simples
> - Filtro "Tipo" debe incluir opciones: Todos, Rutina Diaria, Programa Semanal
> - Modal de selección es obligatorio (no se puede saltar)
> - Botón "Crear" en modal solo se activa si se selecciona una opción
> - Mantener funcionalidad de botón "Mis Plantillas"
> - Al crear Programa Semanal, el usuario puede seleccionar/arrastrar Rutinas Diarias existentes
> - Una Rutina Diaria puede ser parte de múltiples Programas Semanales

---

## 6. IMÁGENES DE REFERENCIA

**Captura del estado actual:**

> Ver imagen inicial compartida (tabla sin columna tipo, 4 botones de acción, sin breadcrumb)

**Mockup/diseño deseado:**

> - Imagen 1: Vista de tabla mejorada con breadcrumb, filtro tipo, nueva columna
> - Imagen 2: Modal de selección de tipo de rutina
> - Imagen 3: Flujos de creación según tipo (Rutina Diaria con ejercicios, Programa Semanal con rutinas)

---

## 7. NOTAS ADICIONALES

**Comentarios del cliente:**

> - Diferenciar claramente entre rutinas diarias y programas semanales
> - Simplificar acciones eliminando botón "Builder"
> - Mejorar UX con breadcrumb y filtros
> - Flujos de creación específicos según tipo
> - **Los programas semanales deben poder reutilizar rutinas diarias existentes**

**Contexto importante:**

> - Este cambio afecta el core del módulo de entrenamiento
> - Mejora la organización y claridad entre tipos de rutinas
> - Facilita la asignación de programas completos vs rutinas únicas
> - Los badges de dificultad se mantienen: Principiante (azul claro), Intermedio (azul), Avanzado (azul más oscuro)
> - **Relación de datos**: Programa Semanal → contiene → Rutinas Diarias → contienen → Ejercicios

**Cambios visuales detallados:**

1. **Header:**

   - Breadcrumb: Entrenamiento > Rutinas
   - Botón "Mis Plantillas" (gris, outline)
   - Botón "+ Agregar Rutina" (azul, con ícono estrella, NO ícono +)

2. **Filtros:**

   - Barra de búsqueda (izquierda)
   - Dropdown "Tipo" con label "Tipo" arriba (derecha)

3. **Tabla:**

   - Nueva columna "Tipo" entre "Creada" y "Acciones"
   - Valores: "Programa Semanal", "Rutina Diaria"

4. **Acciones:**
   - Ícono asignar usuario (persona con +)
   - Ícono editar (lápiz)
   - Ícono eliminar (basura, rojo)
   - Tooltip "Asignar a usuario" al hover

---

## 8. PARA CASCADE

**¿Qué documentación revisar antes?**

> [x] `docs/technical/training-management.md` (si existe)
> [x] `docs/backend-api/routines-endpoints.md` > [x] `docs/backend-api/weekly-programs-endpoints.md` (si existe)
> [x] **Esquema de base de datos actual de rutinas y ejercicios** > [x] Componente actual de tabla de rutinas

**Modo de trabajo:**

> [x] Primero mostrar plan/approach con:
>
> - Análisis de estructura de datos actual
> - Propuesta de diferenciación backend entre Rutina Diaria y Programa Semanal
> - Componentes a modificar
> - Nuevos componentes a crear (modal, vistas de creación)
> - Cambios en backend necesarios (campo tipo, relaciones, filtros)
> - Estructura de rutas
> - Plan de migración de datos existentes

**Preguntas técnicas a resolver:**

**Backend:**

- [ ] ¿Cómo diferenciar actualmente entre Rutina Diaria y Programa Semanal?
- [ ] ¿Existe campo `type` o `routine_type` en la tabla de rutinas?
- [ ] ¿Existe tabla intermedia para relación Programa-Rutinas? (ej: `program_routines`)
- [ ] ¿Cómo se estructura la relación: Programa Semanal → Rutinas Diarias → Ejercicios?
- [ ] ¿Hay endpoints separados o se maneja con query params?
- [ ] ¿Se puede filtrar por tipo en el endpoint actual de listado?

**Frontend:**

- [ ] ¿Existen ya los componentes de creación split con bibliotecas?
- [ ] ¿Hay componente reutilizable para selección de rutinas?
- [ ] ¿Cómo manejar el estado de creación multi-paso?

**Migración:**

- [ ] ¿Hay que migrar datos existentes para agregar campo "tipo"?
- [ ] ¿Cómo identificar rutinas existentes que son programas vs rutinas simples?

---

## 9. ESTRUCTURA TÉCNICA ESPERADA

**Backend - Modelo de datos propuesto:**

```
Rutina Diaria (DailyRoutine)
  - id
  - nombre
  - dificultad
  - descripcion
  - created_at
  - ejercicios[] (relación a través de routine_exercises)

Programa Semanal (WeeklyProgram)
  - id
  - nombre
  - dificultad
  - descripcion
  - created_at
  - rutinas_diarias[] (relación a través de program_routines)

program_routines (tabla intermedia)
  - program_id
  - routine_id
  - dia_semana (1-7)
  - orden
```

**O alternativa con discriminador:**

```
Rutinas (tabla única)
  - id
  - nombre
  - tipo: ENUM('rutina_diaria', 'programa_semanal')
  - dificultad
  - parent_id (null si es rutina diaria, tiene valor si es parte de programa)
  - dia_semana (solo para rutinas dentro de programas)
```

**Endpoints esperados:**

- `GET /api/routines?type=rutina_diaria` - Listar rutinas diarias
- `GET /api/routines?type=programa_semanal` - Listar programas semanales
- `GET /api/routines/:id/daily-routines` - Obtener rutinas de un programa
- `POST /api/routines` - Crear (con campo type en body)
- `PUT /api/routines/:id` - Actualizar
- `DELETE /api/routines/:id` - Eliminar

---

**Prioridad de implementación:**

1. Análisis y ajuste de backend (diferenciación de tipos, relaciones)
2. Actualización de endpoints y filtros
3. Migración de datos existentes
4. Actualización de tabla (columna tipo, filtro, acciones)
5. Modal de selección de tipo
6. Flujos de creación específicos
7. Testing completo

---
