# Formulario de Solicitud de Cambio - FitFlow

Completa este formulario y pégalo en el chat de Cascade junto con las imágenes de referencia.

---

## 1. INFORMACIÓN BÁSICA

**Nombre del cambio:**
> [Ej: "Agregar filtro por fecha en lista de pagos"]

**Tipo de cambio:**
> [ ] Visual/Estético
> [ ] Funcional/Flujo
> [ ] Corrección de bug
> [ ] Nuevo feature

**Prioridad:**
> [ ] Alta | [ ] Media | [ ] Baja

**Rol afectado:**
> [ ] Admin | [ ] Trainer | [ ] User | [ ] Todos

---

## 2. UBICACIÓN DEL CAMBIO

**Pantalla/Módulo:**
> [Ej: "Pagos", "Dashboard", "Mi Progreso", "Rutinas"]

**URL aproximada:**
> [Ej: "/payments", "/dashboard", "/my-routines"]

**Componente específico (si lo conoces):**
> [Ej: "Tabla de pagos", "Card de membresía", "Gráfico de progreso"]

---

## 3. DESCRIPCIÓN DEL CAMBIO

**¿Qué quiere el cliente?**
> [Describe con detalle qué cambio solicita el cliente]

**¿Cómo funciona actualmente?**
> [Describe el comportamiento actual]

**¿Cómo debería funcionar después del cambio?**
> [Describe el comportamiento esperado]

---

## 4. FLUJO DE USUARIO (si aplica)

Describe paso a paso:
1. El usuario está en [pantalla]
2. Hace click en [elemento]
3. El sistema [acción]
4. El usuario ve [resultado]

---

## 5. REGLAS DE NEGOCIO (si aplica)

- [ ] ¿Solo visible para ciertos roles?
- [ ] ¿Requiere validación de datos?
- [ ] ¿Depende de alguna condición? (ej: membresía activa)

Especifica las reglas:
> [Ej: "Solo mostrar si el usuario tiene membresía activa"]

---

## 6. IMÁGENES DE REFERENCIA

**Captura del estado actual:**
> [Adjunta imagen o describe: "Ver imagen 1"]

**Mockup/diseño deseado:**
> [Adjunta imagen o describe: "Ver imagen 2"]

**Referencia externa (si hay):**
> [Ej: "Similar a la app Strong - ver imagen 3"]

---

## 7. NOTAS ADICIONALES

**Comentarios del cliente:**
> [Cualquier comentario textual del cliente]

**Contexto importante:**
> [Información adicional que pueda ser útil]

---

## 8. PARA CASCADE (opcional)

**¿Qué documentación revisar antes?**
> [ ] `docs/technical/[nombre].md`
> [ ] `docs/backend-api/[ENDPOINT].md`
> [ ] `docs/user_manuals/[guia].md`

**Modo de trabajo:**
> [ ] Implementar directamente
> [ ] Primero mostrar plan/approach
> [ ] Solo análisis sin código

---

# EJEMPLO COMPLETO

```
## 1. INFORMACIÓN BÁSICA
Nombre: Agregar gráfico de asistencia mensual
Tipo: [x] Funcional/Flujo
Prioridad: [x] Media
Rol: [x] User

## 2. UBICACIÓN
Pantalla: Dashboard del usuario
URL: /dashboard
Componente: UserDashboardComponent

## 3. DESCRIPCIÓN
¿Qué quiere?: El cliente quiere ver un gráfico de barras 
con la asistencia del mes actual vs mes anterior.

Actualmente: Solo muestra contador de visitas del mes.

Después: Además del contador, mostrar gráfico comparativo.

## 4. FLUJO
1. Usuario entra al dashboard
2. Ve su card de membresía
3. Debajo aparece gráfico de asistencia
4. Puede ver comparación mes actual vs anterior

## 5. REGLAS
- Solo visible para usuarios con membresía
- Mostrar últimos 2 meses

## 6. IMÁGENES
- Estado actual: [imagen 1]
- Diseño deseado: [imagen 2]

## 7. NOTAS
Cliente dijo: "Quiero motivar a los usuarios a venir más"

## 8. PARA CASCADE
Revisar: docs/technical/dashboard-por-rol.md
Modo: [x] Primero mostrar plan
```

---

**Instrucciones:**
1. Copia este template
2. Completa las secciones relevantes
3. Toma capturas de pantalla si tienes
4. Pega todo en el chat de Cascade
5. Adjunta las imágenes arrastrándolas al chat
