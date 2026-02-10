# Centro de Reportes - Guía para Administradores

**Tasks Relacionadas:**

- FITFLOW-DS-09: Página Centro de Reportes con Tabs
- FITFLOW-DS-10: Reporte Financiero - Filtros y Métricas
- FITFLOW-DS-11: Reporte Financiero - Tabla Desglose de Transacciones
- FITFLOW-DS-12: Reporte Uso y Comportamiento - Métricas
- FITFLOW-DS-13: Reporte Uso y Comportamiento - Tabla Análisis

## Descripción General

El Centro de Reportes es una herramienta que te permite visualizar y analizar información financiera y de comportamiento de los miembros de tu gimnasio. Toda la información está organizada en dos pestañas principales para facilitar tu gestión.

## Acceso al Centro de Reportes

1. Inicia sesión en FitFlow con tu cuenta de administrador
2. En el menú lateral, haz clic en **"Reportes"**
3. Serás redirigido al Centro de Reportes

> **Nota:** Solo los administradores tienen acceso a esta funcionalidad.

## Pestañas Disponibles

### 📊 Pestaña Financiero

Esta pestaña te muestra toda la información relacionada con los ingresos y pagos de tu gimnasio.

#### Características

**Filtros:**

- **Mes**: Selecciona el mes que deseas consultar (Enero a Diciembre)
- **Año**: Selecciona el año que deseas consultar

**Métricas Principales:**

- **💰 Ingreso Total**: Suma total de todos los pagos recibidos en el período seleccionado
- **📝 Transacciones**: Cantidad total de pagos registrados
- **⚠️ Morosos Actuales**: Número de miembros con membresías vencidas

**Tabla de Transacciones:**

- Muestra todas las transacciones del período seleccionado
- Información incluida:
  - Fecha del pago
  - Monto en pesos argentinos (ARS)
  - Método de pago (Efectivo, Transferencia o Tarjeta)
  - Email del miembro que realizó el pago
- **Paginación**: La tabla muestra 10 transacciones por página

#### Cómo Usar

1. **Selecciona el período:**

   - Elige el mes y año que deseas consultar
   - Por defecto, se muestra el mes actual

2. **Revisa las métricas:**

   - Observa los tres indicadores principales en la parte superior
   - Estos se actualizan automáticamente al cambiar los filtros

3. **Analiza las transacciones:**

   - Revisa la tabla de transacciones detallada
   - Usa los botones "Anterior" y "Siguiente" para navegar entre páginas
   - Identifica patrones de pago y métodos más utilizados

4. **Exporta los datos:**
   - Haz clic en el botón **"Exportar CSV"** en la parte superior
   - Se descargará un archivo CSV con todas las transacciones del período
   - Puedes abrir este archivo en Excel o Google Sheets

### 👥 Pestaña Uso y Comportamiento

Esta pestaña te muestra información sobre cómo los miembros utilizan el gimnasio y su nivel de actividad.

#### Características

**Filtros:**

- **Fecha Inicio**: Selecciona la fecha de inicio del período a consultar
- **Fecha Fin**: Selecciona la fecha de fin del período a consultar
- **Botones**:
  - **Aplicar**: Aplica los filtros seleccionados
  - **Limpiar**: Restaura los filtros al mes actual

**Métricas Principales:**

- **✅ Visitas Prom. (Activos)**: Promedio de visitas de miembros con membresía activa
- **⚠️ Visitas Prom. (Morosos)**: Promedio de visitas de miembros con membresía vencida
- **💪 Rutinas Activas**: Cantidad total de rutinas de entrenamiento asignadas

**Tabla de Análisis de Miembros:**

- Muestra información de todos los miembros del gimnasio
- Información incluida:
  - Nombre del miembro y email
  - Estado de membresía (Activo, Moroso, Inactivo)
  - Visitas totales en el período
  - Si tiene rutina activa asignada (Sí/No)
- **Filtrado por estado:**
  - Botones para filtrar: Todos, Activos, Morosos, Inactivos
  - Contador de resultados filtrados
- **Ordenamiento:**
  - Haz clic en las columnas para ordenar (Miembro, Estado, Visitas)
  - Indicador visual (▲/▼) muestra el ordenamiento activo
  - Click nuevamente para invertir el orden
- **Paginación**: La tabla muestra 15 miembros por página

#### Cómo Usar

1. **Selecciona el período:**

   - Elige las fechas de inicio y fin
   - Haz clic en "Aplicar" para actualizar los datos
   - Por defecto, se muestra el mes actual

2. **Revisa las métricas:**

   - Compara el promedio de visitas entre miembros activos y morosos
   - Identifica si los miembros morosos están dejando de asistir
   - Verifica cuántas rutinas están activas

3. **Filtra y ordena los datos:**

   - Usa los botones de filtro para ver solo Activos, Morosos o Inactivos
   - Haz clic en las columnas para ordenar por nombre, estado o visitas
   - El contador te muestra cuántos miembros coinciden con tu filtro

4. **Analiza el comportamiento:**

   - Revisa la tabla completa de miembros
   - Identifica miembros con pocas visitas que necesiten seguimiento
   - Verifica qué miembros no tienen rutina asignada
   - Usa los badges de color para identificar rápidamente el estado:
     - 🟢 Verde = Activo
     - 🔴 Rojo = Moroso
     - 🟡 Amarillo = Inactivo

5. **Exporta los datos:**
   - Haz clic en el botón **"Exportar CSV"** en la parte superior
   - Se descargará un archivo CSV con el análisis completo de todos los miembros
   - Útil para hacer seguimiento o análisis más profundos

## Exportación de Datos

### Exportación CSV (Rápida)

1. Asegúrate de estar en la pestaña que deseas exportar (Financiero o Uso y Comportamiento)
2. Configura los filtros según tus necesidades
3. Haz clic en el botón **"Exportar CSV"** ubicado en la esquina superior derecha
4. El archivo se descargará automáticamente con el nombre:
   - `reporte-financiero-YYYY-MM-DD.csv` para datos financieros
   - `reporte-comportamiento-YYYY-MM-DD.csv` para datos de comportamiento

### Exportación PDF/Excel (Avanzada) ✨ NUEVO

Para exportar reportes con formato profesional en PDF o Excel:

1. Haz clic en el botón **"📥 Exportar Reporte"** en la esquina superior derecha
2. Se abrirá un diálogo con las siguientes opciones:

**Tipos de Reporte:**

- 💰 **Financiero**: Pagos, ingresos totales y métodos de pago
- 📊 **Asistencia**: Registros de asistencia por día y mes
- 👥 **Usuarios**: Lista de usuarios con membresías y estados

**Formatos:**

- 📄 **PDF**: Documento con formato profesional, ideal para imprimir
- 📊 **Excel**: Hoja de cálculo editable, ideal para análisis

**Rango de Fechas (Opcional):**

- Selecciona fecha de inicio y fin para filtrar los datos
- Si no seleccionas fechas, se incluirán todos los registros

3. Haz clic en **"Descargar"**
4. El archivo se descargará automáticamente

### Historial de Reportes

Debajo de las pestañas encontrarás una sección **"Reportes Generados"** que muestra:

- Los últimos 10 reportes que has exportado
- Tipo, formato y fechas de cada reporte
- Botón para **regenerar** cualquier reporte anterior
- Opción para **limpiar** el historial

> **Tip:** El historial se guarda en tu navegador. Si cambias de navegador o dispositivo, no verás el historial anterior.

### ¿Qué incluye el CSV?

**Reporte Financiero:**

```
Fecha,Monto,Método,Miembro
19/12/2024,5000,Efectivo,usuario@email.com
18/12/2024,3500,Transferencia,otro@email.com
```

**Reporte de Comportamiento:**

```
Miembro,Email,Estado,Visitas Totales,Rutina Activa
usuario,usuario@email.com,Activo,15,Sí
otro,otro@email.com,Moroso,3,No
```

### ¿Cómo abrir el archivo CSV?

- **Excel**: Abre Excel → Archivo → Abrir → Selecciona el CSV
- **Google Sheets**: Archivo → Importar → Subir → Selecciona el CSV
- **LibreOffice Calc**: Archivo → Abrir → Selecciona el CSV

## Casos de Uso Comunes

### 1. Análisis Mensual de Ingresos

**Objetivo:** Revisar los ingresos del mes anterior

**Pasos:**

1. Ve a la pestaña **Financiero**
2. Selecciona el mes y año anterior
3. Revisa el **Ingreso Total** y compáralo con meses anteriores
4. Exporta el CSV para guardar el registro

### 2. Identificar Miembros en Riesgo

**Objetivo:** Encontrar miembros con pocas visitas para hacer seguimiento

**Pasos:**

1. Ve a la pestaña **Uso y Comportamiento**
2. Selecciona el último mes
3. Ordena mentalmente la tabla por "Visitas Totales"
4. Identifica miembros con menos de 4 visitas al mes
5. Contacta a estos miembros para ofrecerles ayuda o motivación

### 3. Seguimiento de Morosos

**Objetivo:** Ver cuántos miembros tienen membresías vencidas

**Pasos:**

1. Ve a la pestaña **Financiero**
2. Revisa la métrica **Morosos Actuales**
3. Ve a la pestaña **Uso y Comportamiento**
4. Filtra visualmente por badges rojos (Moroso)
5. Verifica si siguen asistiendo al gimnasio
6. Contacta para renovar membresías

### 4. Evaluación de Rutinas

**Objetivo:** Verificar cuántos miembros tienen rutinas asignadas

**Pasos:**

1. Ve a la pestaña **Uso y Comportamiento**
2. Revisa la métrica **Rutinas Activas**
3. En la tabla, identifica miembros sin rutina (columna "Rutina Activa" = No)
4. Asigna rutinas a los miembros que lo necesiten

### 5. Análisis de Métodos de Pago

**Objetivo:** Identificar qué métodos de pago son más utilizados

**Pasos:**

1. Ve a la pestaña **Financiero**
2. Selecciona el período deseado
3. Exporta el CSV
4. Abre en Excel y crea una tabla dinámica por método de pago
5. Analiza tendencias y preferencias

## Tips y Mejores Prácticas

### 📅 Revisión Regular

- **Semanal**: Revisa los morosos actuales y contacta a los miembros
- **Mensual**: Analiza ingresos totales y compara con meses anteriores
- **Trimestral**: Exporta datos y crea reportes de tendencias

### 💡 Consejos de Uso

- **Usa los filtros**: No te quedes solo con el mes actual, explora períodos anteriores
- **Exporta regularmente**: Guarda los CSV mensualmente para tener histórico
- **Compara períodos**: Usa los datos exportados para comparar meses y detectar tendencias
- **Actúa sobre los datos**: Los reportes son útiles solo si tomas acciones basadas en ellos

### ⚠️ Puntos de Atención

- **Morosos con pocas visitas**: Prioridad alta para contactar y retener
- **Activos sin rutina**: Oportunidad para mejorar el servicio
- **Caída en visitas promedio**: Puede indicar problemas de satisfacción
- **Métodos de pago**: Si un método tiene problemas, los miembros lo evitarán

## Solución de Problemas

### No veo datos en el reporte

**Posible causa:** No hay transacciones o visitas en el período seleccionado

**Solución:**

- Verifica que el período seleccionado sea correcto
- Intenta con otro mes o año
- Confirma que haya datos registrados en el sistema

### El botón "Exportar CSV" no funciona

**Posible causa:** Error de conexión o permisos

**Solución:**

- Verifica tu conexión a internet
- Recarga la página (F5)
- Intenta nuevamente
- Si persiste, contacta al soporte técnico

### Los números no coinciden con mis registros

**Posible causa:** Diferencia en el período o datos no sincronizados

**Solución:**

- Verifica que los filtros estén correctamente configurados
- Asegúrate de estar viendo el mismo período
- Confirma que todos los pagos estén registrados en el sistema
- Si persiste, contacta al soporte técnico

### La tabla no muestra todos los miembros

**Posible causa:** La tabla está paginada

**Solución:**

- Usa los botones "Anterior" y "Siguiente" para navegar
- Cada página muestra 10-15 registros
- Para ver todos, exporta el CSV

## Preguntas Frecuentes

**¿Puedo ver reportes de años anteriores?**
Sí, solo selecciona el año deseado en los filtros.

**¿Los datos se actualizan en tiempo real?**
Los datos se cargan al abrir la página o al cambiar filtros. Para ver datos actualizados, recarga la página.

**¿Puedo exportar solo algunos miembros?**
No, la exportación incluye todos los datos del período. Puedes filtrar después en Excel.

**¿Qué diferencia hay entre "Moroso" e "Inactivo"?**

- **Moroso**: Membresía vencida pero puede seguir asistiendo
- **Inactivo**: Sin membresía activa ni vencida

**¿Puedo compartir los reportes con otros?**
Sí, puedes compartir los archivos CSV exportados. Solo asegúrate de proteger la información personal de los miembros.

## Soporte

Si tienes problemas o preguntas adicionales:

- Contacta al equipo de soporte técnico
- Revisa la documentación técnica en `docs/technical/centro-reportes-tabs.md`
- Consulta con otros administradores de tu gimnasio
