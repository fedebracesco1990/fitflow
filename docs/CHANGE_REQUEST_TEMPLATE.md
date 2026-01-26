# Template: Solicitud de Cambio Frontend

Usa este template para solicitar cambios en el frontend de FitFlow. Copia y completa las secciones relevantes.

---

## Información Básica

**Tipo de cambio:** (marca uno)

- [ ] Visual/Estético (colores, espaciado, diseño)
- [ ] Funcional (nuevo feature, modificar flujo)
- [ ] Corrección de bug
- [ ] Mejora de UX

**Prioridad:** (marca uno)

- [ ] Alta (bloquea al cliente)
- [ ] Media (necesario pronto)
- [ ] Baja (mejora nice-to-have)

---

## Descripción del Cambio

### ¿Qué quiere el cliente?

> Describe aquí lo que el cliente pidió en sus propias palabras.

```
Ejemplo: "El cliente quiere que cuando un socio vea su rutina del día,
pueda marcar ejercicios como completados y ver su progreso en tiempo real"
```

### ¿Dónde se aplica el cambio?

> Especifica la pantalla, sección o componente afectado.

- **Feature/Módulo:** (ej: my-routines, dashboard, profile)
- **Pantalla específica:** (ej: vista semanal, detalle de workout)
- **Componente:** (si lo conoces, ej: TodayRoutineCard)

### ¿Para qué rol(es)?

- [ ] Admin
- [ ] Trainer
- [ ] User (Socio)
- [ ] Todos

---

## Referencia Visual (Opcional pero Recomendado)

### Capturas de Pantalla

**Estado actual** (cómo se ve ahora):

> Adjunta captura o describe la pantalla actual

**Diseño deseado** (cómo debería verse):

> Adjunta mockup, captura de referencia, o describe el diseño esperado

### Cómo adjuntar imágenes

1. **Desde archivo local:**

   - Arrastra la imagen al chat de Cascade
   - O usa: "Revisa esta imagen: [ruta del archivo]"

2. **Captura de pantalla:**

   - Windows: `Win + Shift + S` → pegar en chat
   - La imagen se guarda temporalmente y puedo verla

3. **Mockup/Figma:**
   - Exporta como PNG y adjunta
   - O describe los elementos clave

---

## Comportamiento Esperado

### Flujo del Usuario

> Describe paso a paso qué debería pasar

```
1. El usuario entra a [pantalla]
2. Ve [elemento]
3. Hace click en [botón/acción]
4. El sistema [respuesta esperada]
5. El usuario ve [resultado final]
```

### Validaciones/Reglas de Negocio

> ¿Hay condiciones especiales?

```
Ejemplo:
- Solo mostrar si el usuario tiene membresía activa
- El botón se deshabilita después de completar
- Mostrar mensaje de confirmación antes de guardar
```

---

## Contexto Adicional (Opcional)

### Documentación Relacionada

> Si conoces docs relevantes, menciónalas

- [ ] Revisar: `docs/technical/[nombre].md`
- [ ] Revisar: `docs/backend-api/[ENDPOINT].md`
- [ ] Revisar: `docs/user_manuals/[guia].md`

### Dependencias

> ¿Este cambio depende de algo más?

- [ ] Requiere cambio en backend
- [ ] Requiere nuevo endpoint API
- [ ] Depende de otro feature
- [ ] Es independiente

### Notas del Cliente

> Cualquier comentario adicional del cliente

```
Ejemplo: "El cliente mencionó que esto es similar a como lo hace
la app XYZ, me pasó esta referencia: [link]"
```

---

## Para Cascade: Instrucciones de Ejecución

### Modo de trabajo preferido:

- [ ] **Rápido**: Implementar directamente (cambios pequeños)
- [ ] **Workflow completo**: Usar `/task` → `/discovery` → `/design` → `/implement`
- [ ] **Solo análisis**: Revisar código y proponer solución sin implementar

### Antes de implementar, quiero que:

- [ ] Revises la documentación existente del feature
- [ ] Me muestres qué archivos vas a modificar
- [ ] Me expliques el approach antes de codear
- [ ] Implementes directamente

---

# Ejemplo de Uso Completo

```markdown
## Información Básica

**Tipo de cambio:** [x] Funcional
**Prioridad:** [x] Media

## Descripción del Cambio

### ¿Qué quiere el cliente?

El cliente quiere que en la pantalla de "Mi Progreso" se muestre un gráfico
de líneas con la evolución del peso levantado en los últimos 3 meses,
filtrable por ejercicio.

### ¿Dónde se aplica el cambio?

- **Feature/Módulo:** progress
- **Pantalla específica:** página principal de Mi Progreso
- **Componente:** nuevo componente de gráfico

### ¿Para qué rol(es)?

- [x] User (Socio)

## Referencia Visual

[Adjunto captura de la app "Strong" que el cliente usa como referencia]

## Comportamiento Esperado

1. Usuario entra a Mi Progreso
2. Ve un selector de ejercicios (dropdown)
3. Selecciona "Press Banca"
4. Ve gráfico de líneas con fechas en X y peso en Y
5. Puede hacer hover para ver detalles de cada punto

## Para Cascade

- [x] Revisar docs/technical/graficos-evolucion-progreso.md
- [x] Implementar directamente
```
