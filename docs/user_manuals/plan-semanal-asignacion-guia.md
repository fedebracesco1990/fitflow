# Plan Semanal - Guía de Asignación

## Descripción

Esta guía explica cómo asignar planes semanales a usuarios, reasignar planes existentes, y consultar el historial de planes asignados.

## Funcionalidades

- **Asignar plan semanal** a uno o varios usuarios
- **Reasignar plan** a usuarios que ya tienen uno (con confirmación)
- **Ver historial** de planes asignados a cada usuario
- **Notificación automática** al usuario cuando se le asigna un plan

## Cómo Asignar un Plan Semanal

1. Ir a **Rutinas** en el menú lateral
2. Buscar el plan semanal que querés asignar
3. Hacer clic en **Asignar** en el plan
4. En el diálogo:
   - Buscar usuarios por nombre o email
   - Los usuarios que ya tienen un plan activo muestran un **badge amarillo** con el nombre del plan actual
   - Seleccionar uno o más usuarios
   - Elegir fecha de inicio
5. Hacer clic en **Confirmar**

## Reasignar un Plan (Reemplazar Plan Existente)

Si seleccionás usuarios que ya tienen un plan activo:

1. Aparece un **modal de confirmación** listando los usuarios afectados y su plan actual
2. Revisá la lista para asegurarte de que querés reemplazar esos planes
3. Hacé clic en **Reemplazar y asignar** para confirmar, o **Cancelar** para volver atrás

> **Importante:** El plan anterior se desactiva automáticamente y queda registrado en el historial del usuario.

## Ver Historial de Planes de un Usuario

1. Ir a **Usuarios** en el menú lateral
2. Hacer clic en un usuario para ver su detalle
3. Desplazarse hacia abajo hasta la sección **Planes Semanales**
4. Se muestra:
   - **Plan activo** (badge verde "Activo") con fecha de inicio
   - **Historial** de planes anteriores (badge gris "Finalizado") con rango de fechas
5. Hacer clic en un plan para expandir y ver las **rutinas asignadas** con duración estimada

## Notificaciones

Al asignar un plan semanal, el usuario recibe automáticamente:

- **Notificación push** (si tiene la app instalada)
- **Notificación in-app** vía WebSocket (en tiempo real)
- Mensaje: "Se te ha asignado el plan [nombre]. ¡Revisa tus rutinas!"

## Consejos

- Verificá el badge amarillo antes de asignar para saber si el usuario ya tiene plan
- Usá la búsqueda para encontrar usuarios rápidamente en gimnasios con muchos miembros
- El historial conserva los datos **base** del plan tal como fue asignado, independientemente de la ejecución del usuario

## Solución de Problemas

- **No veo el badge de plan activo:** Asegurate de estar asignando un plan semanal (no una rutina diaria)
- **No aparece la sección de historial:** Verificá que estás en la vista de detalle del usuario (clic en el usuario desde la lista)
- **El usuario no recibió notificación:** Verificá que el usuario tenga el navegador abierto o la PWA instalada
