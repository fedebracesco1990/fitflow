# Especificaciones UI/UX - Módulo de Rutinas de Ejercicio

## 📱 PANTALLA 1: LISTADO DE RUTINAS (Home)

### Descripción Visual

Pantalla principal que muestra un resumen de las rutinas de entrenamiento de la semana.

### Layout

- **Header superior** con logo, avatar circular del usuario y icono de notificaciones
- **Card destacada grande** con fondo morado/violeta (#6366F1):
  - Ícono de pesas blanco en la esquina superior izquierda
  - Título "Mis Rutinas" en texto grande y blanco
  - Subtítulo "Plan semanal de entrenamiento" en blanco con opacidad reducida
  - Botón "Activa" en la esquina superior derecha con fondo morado más claro
  - Bordes muy redondeados
- **Sección "Esta Semana"** con:
  - Título a la izquierda
  - Link "Ver todo" en azul a la derecha
- **Lista de rutinas** con diferentes estados visuales

### Estados de Rutinas

**Rutina Completada:**

- Fondo gris muy claro
- Título en negro
- Texto secundario: fecha y "Finalizado" en gris
- Ícono de check verde circular en el lado derecho

**Rutina Pendiente/Actual:**

- Fondo blanco con sombra sutil
- **Borde izquierdo grueso (4px) en azul**
- Ícono de ejercicio (corredor) en círculo azul claro a la izquierda
- Título en negro
- Texto "Hoy • Pendiente" en azul
- Ícono de pesas en círculo azul sólido a la derecha

### Navegación

- Al tocar una rutina pendiente → ir a Pantalla 2 (Detalle de Rutina)
- Al tocar "Ver todo" → ver todas las rutinas disponibles
- Barra de navegación inferior presente

---

## 📱 PANTALLA 2: DETALLE DE RUTINA ACTIVA

### Descripción Visual

Muestra los ejercicios específicos de la rutina seleccionada con su progreso en tiempo real.

### Layout

- **Header:**

  - Botón "back" (flecha izquierda) a la izquierda
  - Título de la rutina centrado (ej: "Pierna-Trasero")
  - Subtítulo con fecha (ej: "Hoy • Sáb. 14/2")
  - Indicador de progreso numérico a la derecha (ej: "1/5")

- **Card de estado activo** con fondo morado:

  - Título "Entrenamiento Activo" en blanco
  - Tiempo transcurrido contando hacia arriba (ej: "12:45")
  - Ícono de cronómetro a la derecha

- **Lista de ejercicios** con tres estados posibles:

### Estados de Ejercicios

**Ejercicio Completado:**

- Fondo blanco
- Borde izquierdo verde grueso (4px)
- Nombre del ejercicio en negro
- Detalles: "3 series de 10 - 10kg" en gris
- Check verde circular a la derecha
- Botón "Editar" con borde gris

**Ejercicio ACTUAL:**

- Fondo blanco
- Borde izquierdo verde grueso
- Badge "ACTUAL" en la esquina superior derecha con fondo azul claro y texto azul
- Nombre del ejercicio
- Detalles del ejercicio
- Dos botones en fila:
  - "Skip" con borde gris (izquierda)
  - "Entrar →" con fondo morado y texto blanco (derecha)

**Ejercicio Pendiente:**

- Similar al actual pero sin el badge "ACTUAL"
- Dos botones: "Skip" y "Entrar"

- **Botón "Finalizar Rutina"** al final:
  - Fondo morado
  - Texto blanco
  - Ancho completo
  - Bordes redondeados

### Interacciones

- "Entrar" → ir a Pantalla 3 (Vista de Sets del ejercicio)
- "Skip" → marcar ejercicio como saltado y pasar al siguiente
- "Editar" → abrir dialog de edición
- "Finalizar Rutina" → completar toda la rutina y volver al Home
- Botón back → volver a Pantalla 1

---

## 📱 PANTALLA 3: VISTA DE SETS DEL EJERCICIO

### Descripción Visual

Muestra los sets individuales del ejercicio actual con indicador visual de progreso.

### Layout

- **Header:** igual que Pantalla 2 (título de rutina, fecha, indicador de progreso)

- **Card del ejercicio actual** con fondo morado:

  - Nombre del ejercicio (ej: "Prensa de piernas") en blanco
  - Resumen: "3 Sets, 8 Reps, 80KG" en blanco con opacidad
  - **Indicador de progreso visual:** 3 líneas horizontales delgadas que representan los 3 sets
    - Set completado: línea blanca sólida y opaca
    - Set pendiente: línea blanca semi-transparente o outline

- **Lista de sets individuales:**

### Estados de Sets

**Set Completado:**

- Fondo blanco
- Borde izquierdo verde grueso
- Título "Set 1" en negro
- Detalles: "8 Reps / 80kg" en gris
- Check verde circular a la derecha
- Botón "Editar" con borde gris

**Set ACTUAL:**

- Fondo blanco
- Borde izquierdo verde grueso
- Badge "ACTUAL" en azul en la esquina superior derecha
- Título "Set 3" en negro
- Detalles del set en gris
- Botón "Editar"

**Set Pendiente:**

- Similar pero sin badge ni check

- **Botón "Agregar Set"** al final:
  - Borde punteado gris
  - Texto gris
  - Ícono + a la izquierda del texto
  - Sin fondo (outline)

### Interacciones

- "Editar" → abrir Dialog de Edición (Pantalla 4)
- Completar un set manualmente → pasa automáticamente al siguiente
- Completar el último set → mostrar Pantalla 5 (Descanso) por 90 segundos
- Botón back → volver a Pantalla 2

---

## 📱 PANTALLA 4: DIALOG EDITAR SET

### Descripción Visual

Modal/Dialog centrado que aparece sobre la pantalla actual para editar repeticiones y peso de un set.

### Layout del Dialog

**Overlay:** Fondo oscuro semi-transparente detrás del dialog

**Dialog:**

- **Header con fondo morado:**

  - Título "Editar Set 3" en blanco a la izquierda
  - Botón X para cerrar a la derecha (blanco)

- **Cuerpo con fondo blanco:**

  - Dos columnas lado a lado:

  **Columna 1 - REPETICIONES:**

  - Label "REPETICIONES" en mayúsculas, gris, pequeño
  - Botón flecha arriba (↑)
  - Número grande en el centro (ej: "8") muy destacado
  - Botón flecha abajo (↓)

  **Columna 2 - PESO (KG):**

  - Label "PESO (KG)" en mayúsculas, gris, pequeño
  - Botón flecha arriba (↑)
  - Número grande en el centro (ej: "80") muy destacado
  - Botón flecha abajo (↓)

- **Botones de acción en la parte inferior:**
  - "Cancelar" con borde gris (izquierda)
  - "Aceptar" con fondo morado (derecha)

### Estilo Visual

- Dialog con bordes muy redondeados
- Sombra pronunciada para dar sensación de elevación
- Centrado en la pantalla
- Ancho: ~80-90% del ancho de pantalla móvil

### Interacciones

- Flechas arriba/abajo → incrementar o decrementar valores
- "Aceptar" → guardar cambios y cerrar
- "Cancelar" → descartar cambios y cerrar
- X → cerrar sin guardar
- Tocar fuera del dialog → cerrar

---

## 📱 PANTALLA 5: DESCANSO ENTRE EJERCICIOS

### Descripción Visual

Pantalla de transición que muestra un temporizador de descanso entre sets o ejercicios.

### Layout

Todo centrado verticalmente en la pantalla:

- **Ícono de reloj:**

  - Círculo grande azul claro de fondo
  - Ícono de reloj morado/azul en el centro
  - Diseño minimalista y limpio

- **Título:** "¡Descansa!" en negro, grande y bold

- **Subtítulo:** "Tómate un respiro antes de la siguiente serie" en gris, centrado

- **Card del temporizador:**

  - Fondo morado (#6366F1)
  - Timer muy grande y destacado: "01:30" en blanco (formato MM:SS)
  - Subtítulo "Tiempo restante" en blanco con opacidad
  - Bordes muy redondeados
  - Padding generoso

- **Botón "Saltar":**
  - Ícono de fast-forward (⏩) a la izquierda
  - Texto "Saltar" en gris
  - Borde gris, sin fondo (outline)
  - Centrado

### Comportamiento del Timer

- Cuenta regresiva desde 01:30 (90 segundos)
- Número actualiza cada segundo
- Opcional: animación de pulso en el número cada segundo
- Al llegar a 00:00 → automáticamente ir al siguiente ejercicio/set

### Interacciones

- "Saltar" → cancelar el descanso e ir inmediatamente al siguiente ejercicio/set
- Timer se completa → avanzar automáticamente

---

## 🔄 FLUJO COMPLETO DEL USUARIO

```
1. PANTALLA 1 (Home - Listado)
   Usuario ve sus rutinas de la semana
   ↓
   [Toca rutina "Pierna-Trasero" marcada como "Hoy • Pendiente"]
   ↓

2. PANTALLA 2 (Detalle de Rutina)
   Ve lista de 5 ejercicios
   Timer de entrenamiento inicia (00:00, 00:01, 00:02...)
   Primer ejercicio "Sentadilla" ya completado (check verde)
   Segundo ejercicio "Prensa de piernas" marcado como "ACTUAL"
   ↓
   [Toca botón "Entrar →" en ejercicio actual]
   ↓

3. PANTALLA 3 (Vista de Sets)
   Ve 3 sets del ejercicio "Prensa de piernas"
   Indicador visual muestra: Set 1 ✓, Set 2 ✓, Set 3 pendiente
   Set 3 está marcado como "ACTUAL"
   ↓
   [Toca "Editar" en Set 3]
   ↓

4. PANTALLA 4 (Dialog Editar)
   Modal aparece sobre la pantalla
   Usuario ajusta repeticiones de 10 → 8
   Usuario ajusta peso de 10kg → 80kg
   ↓
   [Toca "Aceptar"]
   ↓

3. PANTALLA 3 (vuelve)
   Set 3 ahora muestra "8 Reps / 80kg"
   Usuario completa el set
   ↓
   [Sistema detecta que es el último set del ejercicio]
   ↓

5. PANTALLA 5 (Descanso)
   Temporizador muestra 01:30 y empieza cuenta regresiva
   01:29... 01:28... 01:27...
   ↓
   [Timer llega a 00:00 O usuario toca "Saltar"]
   ↓

2. PANTALLA 2 (vuelve)
   "Prensa de piernas" ahora aparece completado (check verde)
   Siguiente ejercicio "Extensión de cuádri." ahora es "ACTUAL"
   ↓
   [Usuario continúa con los ejercicios restantes...]
   ↓
   [Después de completar todos los ejercicios, toca "Finalizar Rutina"]
   ↓

1. PANTALLA 1 (Home)
   La rutina "Pierna-Trasero" ahora muestra "Finalizado" con check verde
```

---

## 🎨 ESPECIFICACIONES DE DISEÑO

### Paleta de Colores

- **Morado principal:** #6366F1 (cards destacadas, botones primarios)
- **Azul:** #3B82F6 (badges "ACTUAL", links, estados activos)
- **Verde:** #10B981 (checks, bordes de elementos completados)
- **Gris claro:** #F9FAFB (fondos de cards completadas)
- **Gris texto:** #6B7280 (textos secundarios)
- **Blanco:** #FFFFFF (fondos de cards, texto sobre morado)
- **Negro:** #111827 (títulos, texto principal)

### Espaciado y Tamaños

- **Padding de cards:** Generoso, aproximadamente 16px
- **Bordes redondeados:** Muy pronunciados (20px+)
- **Borde lateral de estado:** 4px de grosor
- **Altura mínima de botones:** ~44px para fácil interacción táctil
- **Separación entre elementos:** 12-16px consistente

### Tipografía

- **Títulos grandes:** Bold, tamaño grande
- **Subtítulos:** Regular o medium, opacidad reducida
- **Textos secundarios:** Pequeños, color gris
- **Labels en mayúsculas:** Muy pequeños, gris, espaciado de letras aumentado

### Íconos

- Pesas, cronómetro, check, flecha atrás, corredor, reloj
- Estilo: Línea o relleno según contexto
- Tamaño consistente con el texto circundante

---

## ⚡ COMPORTAMIENTOS E INTERACCIONES

### Timer de Entrenamiento (Pantalla 2)

- Inicia en 00:00 cuando usuario entra a la rutina
- Cuenta hacia arriba continuamente
- Se mantiene corriendo incluso si usuario navega a otras pantallas
- Formato: MM:SS (ej: 12:45)

### Timer de Descanso (Pantalla 5)

- Inicia en 01:30 (90 segundos)
- Cuenta regresiva hacia 00:00
- Actualiza cada segundo visualmente
- Al llegar a 00:00 → transición automática
- Usuario puede saltarlo en cualquier momento

### Progreso Visual

- **En Pantalla 2:** Número "X/Y" muestra ejercicio actual de total
- **En Pantalla 3:** Barras horizontales muestran sets completados vs pendientes
- Los elementos completados tienen check verde
- El elemento actual tiene badge "ACTUAL" azul

### Transiciones de Estado

1. Pendiente → Actual → Completado
2. El siguiente elemento en la lista se marca automáticamente como "Actual"
3. Los cambios de estado son inmediatos al completar

### Navegación con Back Button

- Cada pantalla (excepto Home) tiene flecha atrás
- Vuelve a la pantalla anterior en el flujo
- Mantiene el estado de la rutina (timer sigue corriendo)

### Persistencia

- Si usuario sale de la app y vuelve, debe recordar:
  - Qué rutina está activa
  - Qué ejercicio está haciendo
  - Timer de entrenamiento transcurrido
  - Sets completados

---

## 📝 NOTAS IMPORTANTES

### Lo que NO está en las capturas pero puede necesitarse:

- Confirmación antes de "Finalizar Rutina"
- Indicador de carga al guardar cambios
- Feedback visual al completar un set (animación)
- Manejo de errores si falla guardado
- Estados de carga iniciales

### Casos Edge a Considerar:

- ¿Qué pasa si usuario presiona back durante el timer de descanso?
- ¿Se puede editar un set ya completado?
- ¿Se puede agregar más de 3 sets?
- ¿Hay límite de peso/repeticiones?
- ¿Se puede eliminar un set agregado?

### Responsive

- Todo el diseño está pensado para móvil (320px-768px)
- Botones grandes y tocables
- Texto legible sin zoom
- Cards con separación suficiente
