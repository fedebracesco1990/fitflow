# Mi Progreso - Guía de Usuario

## Descripción

La sección **Mi Progreso** te permite visualizar tu evolución física a lo largo del tiempo mediante gráficos interactivos. Puedes ver cómo han mejorado tus pesos, volumen de entrenamiento y distribución de trabajo por grupo muscular.

---

## Cómo Acceder

1. Inicia sesión en FitFlow
2. Navega a **Mi Progreso** desde el menú principal
3. También puedes acceder directamente desde `/my-progress`

---

## Funcionalidades

### 📊 Resumen del Mes

Al ingresar, verás 4 tarjetas con las estadísticas del mes actual comparadas con el mes anterior:

| Tarjeta | Descripción |
|---------|-------------|
| **Entrenamientos** | Cantidad de entrenamientos completados |
| **Volumen Total** | Suma de peso × repeticiones de todos los ejercicios |
| **Series Totales** | Cantidad total de series realizadas |
| **Récords Personales** | Nuevos PRs alcanzados este mes |

Cada tarjeta muestra:
- Valor actual del mes
- Cambio respecto al mes anterior (+/-)
- Porcentaje de cambio

**Colores:**
- 🟢 Verde: Mejora respecto al mes anterior
- 🔴 Rojo: Disminución respecto al mes anterior
- ⚪ Gris: Sin cambio

---

### 📈 Volumen de Entrenamiento

Esta sección muestra dos gráficos:

#### Volumen por Fecha
- Gráfico de barras con el volumen diario
- Útil para ver la consistencia de entrenamientos
- Muestra cantidad de entrenamientos por día en tooltips

#### Distribución por Grupo Muscular
- Gráfico circular (doughnut)
- Muestra qué porcentaje del volumen total dedicaste a cada grupo muscular
- Útil para identificar desequilibrios en el entrenamiento

---

### 🏋️ Progreso por Ejercicio

Selecciona un ejercicio específico para ver tu evolución:

1. **Seleccionar ejercicio**: Usa el dropdown para elegir el ejercicio
2. **Ver gráfico**: Se mostrará un gráfico de línea con:
   - **Línea azul**: Peso máximo levantado por sesión
   - **Línea verde**: Volumen máximo (peso × reps) por sesión

3. **Resumen de progreso**: Debajo del gráfico verás:
   - Peso inicial (primera sesión del período)
   - Peso actual (última sesión)
   - Cambio total (+/- kg)
   - Cantidad de entrenamientos

---

## Filtro de Período

Puedes ajustar el período de tiempo mostrado usando los botones de filtro:

| Opción | Descripción |
|--------|-------------|
| **7 días** | Última semana |
| **30 días** | Último mes (default) |
| **90 días** | Últimos 3 meses |
| **1 año** | Último año completo |
| **Todo** | Todo el historial disponible |

**Nota**: El filtro afecta tanto a los gráficos de volumen como al progreso por ejercicio.

---

## Tips para Aprovechar Mi Progreso

### 🎯 Seguimiento de Objetivos
- Revisa semanalmente tu comparación mensual
- Si el volumen baja, considera ajustar tu rutina
- Apunta a incrementos graduales de peso (progresión)

### 💪 Identificar Puntos Débiles
- Usa el gráfico de grupos musculares para ver desequilibrios
- Si un grupo tiene menos del 10%, considera agregar ejercicios

### 📉 Detectar Estancamiento
- Si el gráfico de un ejercicio se aplana, podrías estar estancado
- Considera cambiar repeticiones, series o ejercicios auxiliares

### 📅 Comparación a Largo Plazo
- Usa el filtro de 90 días o 1 año para ver tendencias
- El progreso real se ve mejor en períodos largos

---

## Solución de Problemas

### No veo datos en los gráficos
- Asegúrate de haber completado entrenamientos con la función "Registrar Entrenamiento"
- Verifica que el período seleccionado incluya fechas con entrenamientos

### El ejercicio que busco no aparece
- Solo aparecen ejercicios que hayas realizado al menos una vez
- Verifica que el ejercicio esté en tu rutina asignada

### Los datos parecen incorrectos
- Los datos se calculan desde los entrenamientos registrados
- Asegúrate de registrar correctamente peso y repeticiones

---

## Métricas Explicadas

### Volumen
```
Volumen = Peso (kg) × Repeticiones
```
Ejemplo: 3 series de 10 reps con 50kg = 50 × 10 × 3 = 1,500 kg de volumen

### Peso Máximo
El mayor peso levantado en una serie individual durante esa sesión.

### Cambio Porcentual
```
Cambio % = ((Actual - Anterior) / Anterior) × 100
```

---

## Preguntas Frecuentes

**¿Cada cuánto se actualizan los datos?**
Los datos se actualizan en tiempo real cada vez que registras un entrenamiento.

**¿Puedo exportar mis datos?**
Actualmente no está disponible la exportación. Esta función está planificada para futuras versiones.

**¿Los entrenadores pueden ver mi progreso?**
Sí, los entrenadores con acceso a tu perfil pueden ver tu progreso desde el Centro de Reportes.
