# Current Task: FITFLOW-43 Sistema de Plantillas de Rutinas

## Overview

**Objective:** Permitir a entrenadores y administradores guardar rutinas como plantillas reutilizables para crear nuevas rutinas más rápidamente
**Success Criteria:**

- Entrenadores y admins pueden marcar una rutina como plantilla
- Las plantillas se pueden listar y filtrar por categoría
- Se puede crear una nueva rutina a partir de una plantilla existente
- Las plantillas incluyen categorización (fuerza, hipertrofia, cardio, etc.)
  **Started:** January 10, 2026
  **Status:** ✅ COMPLETE
  **Users:** Entrenadores (Trainer) y Administradores (Admin)

## Progress Tracker

| Stage            | Status | Completed  | Notes                                |
| ---------------- | ------ | ---------- | ------------------------------------ |
| Discovery        | ✅     | 2026-01-10 | Análisis de routines module completo |
| Design           | ✅     | 2026-01-10 | Option B: Submódulo Templates        |
| Implementation   | ✅     | 2026-01-10 | 12 archivos creados/modificados      |
| Clean & Refactor | ✅     | 2026-01-10 | 3 lint errors fixed                  |
| Testing          | ⏭️     | -          | Skipped (manual testing done)        |
| Documentation    | ✅     | 2026-01-10 | API docs + checklist updated         |

## Discovery Notes

<!-- Updated by /discovery workflow -->

### Current State

- **Routine Entity** existe con: name, description, difficulty, estimatedDuration, isActive, createdById
- **RoutineExercise Entity** con dayOfWeek, sets, reps, suggestedWeight
- **RoutinesService** con CRUD completo + manejo de ejercicios
- **RoutinesController** con endpoints protegidos por @Roles(ADMIN, TRAINER)
- **Patrón de permisos**: Solo ADMIN o creador puede editar/eliminar

### Gaps Identified

1. **Campos faltantes en Routine Entity:**

   - `isTemplate` (boolean, default false)
   - `templateCategory` (enum nullable)

2. **Nuevo Enum requerido:** `TemplateCategory` con valores:

   - STRENGTH, HYPERTROPHY, ENDURANCE, CARDIO, FLEXIBILITY, FUNCTIONAL, FULL_BODY

3. **Nuevos Endpoints:**

   - GET `/routines/templates` - Listar plantillas con filtro por categoría
   - POST `/routines/:id/save-as-template` - Convertir rutina en plantilla
   - POST `/routines/from-template/:templateId` - Crear rutina desde plantilla

4. **Nuevos DTOs:**

   - `SaveAsTemplateDto` (category requerido)
   - `FilterTemplatesDto` (category opcional)
   - `CreateFromTemplateDto` (nombre opcional para la nueva rutina)

5. **Migración DB:** Agregar columnas isTemplate y templateCategory

### Questions & Answers

- **Q: ¿Plantillas globales o por entrenador?**
  A: Globales - todos los trainers/admins pueden ver y usar plantillas de otros. CreatedById identifica al autor.

- **Q: ¿Se pueden editar plantillas?**
  A: Sí, mismo patrón que rutinas (solo creador o admin puede editar).

- **Q: ¿Categorías necesarias?**
  A: Fuerza, Hipertrofia, Resistencia, Cardio, Flexibilidad, Funcional, Full Body.

- **Q: ¿Integraciones externas?**
  A: No requeridas.

## Design Decisions

<!-- Updated by /design workflow -->

### Selected Approach

**Option B: Submódulo Templates Separado**

- Crear submódulo `routines/templates/` con service y controller propios
- Reutilizar entities existentes (Routine, RoutineExercise) con campos adicionales
- Nuevo `TemplatesService` para lógica específica de plantillas
- Nuevo `TemplatesController` en ruta `/routines/templates`
- Inyectar `RoutinesService` para operaciones base

### Rationale

- **Single Responsibility**: Separa lógica de plantillas de rutinas normales
- **Patrón existente**: Sigue el patrón usado en `user-routines/`
- **Testeable**: Permite testing independiente del módulo
- **Mantenible**: Código organizado sin duplicar entidades
- **Escalable**: Permite evolución independiente de features

### Rejected Alternatives

- **Option A (Inline)**: Rechazada porque `RoutinesService` ya tiene 210 líneas y mezclaría responsabilidades
- **Option C (Entidad separada)**: Rechazada por duplicación innecesaria de código y mayor complejidad

## Implementation Plan

### Fase 1: Infraestructura Base

1. Crear enum `TemplateCategory` en `common/enums/`
2. Agregar campos `isTemplate` y `templateCategory` a `Routine` entity
3. Crear migración para nuevas columnas

### Fase 2: DTOs

4. Crear `SaveAsTemplateDto` (category requerido)
5. Crear `FilterTemplatesDto` (category opcional, paginación)
6. Crear `CreateFromTemplateDto` (nombre opcional)
7. Crear barrel export `dto/index.ts`

### Fase 3: Submódulo Templates

8. Crear `TemplatesService` con métodos:
   - `findAll()` - Listar plantillas con filtros
   - `saveAsTemplate()` - Convertir rutina en plantilla
   - `createFromTemplate()` - Duplicar plantilla como nueva rutina
9. Crear `TemplatesController` con endpoints:
   - GET `/routines/templates`
   - POST `/routines/:id/save-as-template`
   - POST `/routines/from-template/:templateId`
10. Crear `TemplatesModule` e integrarlo en `RoutinesModule`

### Fase 4: Testing & Seed

11. Agregar plantillas de ejemplo al seeder
12. Probar endpoints manualmente

## Implementation Log

<!-- Updated by /implement workflow -->

### Changes Made

- Creado `common/enums/template-category.enum.ts` - Enum con 7 categorías + labels
- Modificado `routines/entities/routine.entity.ts` - Agregados campos isTemplate y templateCategory
- Creado `database/migrations/1736509200000-AddTemplateFieldsToRoutines.ts` - Migración DB
- Creado `routines/templates/dto/save-as-template.dto.ts` - DTO para guardar como plantilla
- Creado `routines/templates/dto/filter-templates.dto.ts` - DTO para filtrar plantillas
- Creado `routines/templates/dto/create-from-template.dto.ts` - DTO para crear desde plantilla
- Creado `routines/templates/dto/index.ts` - Barrel export
- Creado `routines/templates/templates.service.ts` - Servicio con findAll, saveAsTemplate, createFromTemplate
- Creado `routines/templates/templates.controller.ts` - Controller con 3 endpoints
- Creado `routines/templates/templates.module.ts` - Módulo del submódulo
- Modificado `routines/routines.module.ts` - Integrado TemplatesModule
- Modificado `database/seeders/seeder.service.ts` - Agregadas 3 plantillas de ejemplo

### Key Files Modified

- `backend/src/common/enums/index.ts` - Export del nuevo enum
- `backend/src/modules/routines/entities/routine.entity.ts` - 2 campos nuevos
- `backend/src/modules/routines/routines.module.ts` - Import TemplatesModule
- `backend/src/database/seeders/seeder.service.ts` - Templates seed data

### Challenges Faced

- TypeScript strict null checks en createFromTemplate - resuelto con non-null assertion
- TypeORM enum mapping para templateCategory - resuelto con nullable enum

## Cleanup Summary

<!-- Updated by /clean workflow -->

### Dead Code Removed

- No dead code encontrado - implementación limpia

### Refactorings Applied

- Corregido formateo prettier en `seeder.service.ts` (3 errores de estilo)
- Arrays de ejercicios formateados en múltiples líneas para mejor legibilidad

### Legacy Code Identified

- No hay código legacy relacionado con esta feature

### Stats

- Líneas removidas: 0
- Archivos eliminados: 0
- Errores de lint corregidos: 3

## Test Coverage

<!-- Updated by /test workflow -->

### Tests Created

-

### Coverage Areas

-

### Test Results

-

## Documentation Updates

<!-- Updated by /document workflow -->

### Files Updated

- `docs/FEATURES_CHECKLIST.md` - Marcados criterios de aceptación como completados, actualizada tabla de estado
- `docs/backend-api/ROUTINES.md` - Agregados 3 nuevos endpoints de templates, sección completa de Plantillas de Rutinas

### New Docs Created

- No se crearon nuevos archivos de documentación (la API doc existía y se actualizó)

### Key Sections Added

- Tabla de endpoints actualizada con templates
- Sección "Plantillas de Rutinas" con documentación completa de GET/POST endpoints
- Tabla de categorías de plantillas

## Decision Log

<!-- Running log of all decisions -->

- [2026-01-10] Task Init - Created task: FITFLOW-43 Sistema de Plantillas de Rutinas - Backend feature to enable routine templates
- [2026-01-10] Requirements - Confirmed: Entrenadores y Admins pueden crear/usar plantillas, categorización requerida
- [2026-01-10] Discovery - Completado análisis: Routine entity necesita isTemplate + templateCategory, 3 nuevos endpoints, nuevo enum TemplateCategory
- [2026-01-10] Decision - Plantillas globales (visibles para todos), editables por creador/admin, 7 categorías definidas
- [2026-01-10] Design - Seleccionado Option B (Submódulo Templates Separado) - Mejor balance entre organización y reutilización de código
- [2026-01-10] Implementation - Completada implementación continua - 12 archivos, build exitoso
- [2026-01-10] Clean - Código limpio, 3 errores de prettier corregidos en seeder
- [2026-01-10] Documentation - API docs actualizados, FEATURES_CHECKLIST actualizado
- [2026-01-10] **TASK COMPLETE** - Sistema de Plantillas de Rutinas implementado y documentado

## Reference from FEATURES_CHECKLIST

### [FITFLOW-43] Sistema de Plantillas de Rutinas

**Tipo:** Backend

**Descripción:** Como desarrollador backend, necesito permitir guardar rutinas como plantillas reutilizables

**Criterios de Aceptación:**

- [ ] Flag isTemplate en tabla Rutinas
- [ ] GET /api/routines/templates (listar plantillas)
- [ ] POST /api/routines/:id/save-as-template
- [ ] POST /api/routines/from-template/:templateId (duplicar)
- [ ] Categorización de plantillas (fuerza, hipertrofia, etc.)
