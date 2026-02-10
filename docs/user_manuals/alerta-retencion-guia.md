# Widget de Alerta de Retención - Guía de Usuario

## Descripción

El widget de **Alerta de Retención** te permite identificar miembros que no han asistido al gimnasio en los últimos 7 días y contactarlos directamente con una notificación push.

## Ubicación

El widget se encuentra en el **Dashboard** del administrador, en la sección de widgets.

## Funcionalidades

### Vista de Usuarios Inactivos

El widget muestra una tabla con:

| Columna            | Descripción                             |
| ------------------ | --------------------------------------- |
| **Usuario**        | Nombre y email del miembro              |
| **Días sin venir** | Cantidad de días desde su última visita |
| **Última vez**     | Cuándo fue la última vez que asistió    |
| **Estado**         | Pendiente o Contactado                  |
| **Acciones**       | Botón para enviar mensaje               |

### Enviar Notificación

1. Haz click en el botón de mensaje (💬) junto al usuario
2. Se abrirá un dialog con:
   - **Título**: El título de la notificación
   - **Mensaje**: El contenido del mensaje
3. Completa ambos campos
4. Haz click en **"Enviar notificación"**
5. El usuario recibirá una notificación push en su dispositivo

### Estados

| Estado         | Significado                           |
| -------------- | ------------------------------------- |
| **Pendiente**  | El usuario aún no ha sido contactado  |
| **Contactado** | Ya se envió una notificación este mes |

Una vez que envíes un mensaje, el estado cambiará automáticamente a "Contactado".

## Indicadores

En el encabezado del widget verás:

- **Número de pendientes**: Cuántos usuarios faltan por contactar
- **Total de usuarios**: Cantidad total de usuarios inactivos

## Tips

- **Personaliza tus mensajes**: Usa el nombre del usuario y un mensaje amigable
- **Revisa regularmente**: Los usuarios inactivos pueden volver si reciben un mensaje a tiempo
- **Estado mensual**: El estado de "Contactado" se reinicia cada mes

## Ejemplos de Mensajes

### Mensaje motivacional

- **Título**: ¡Te extrañamos! 💪
- **Mensaje**: Hola, hace unos días que no te vemos por el gym. ¿Todo bien? ¡Te esperamos!

### Recordatorio amigable

- **Título**: Tu rutina te espera
- **Mensaje**: No pierdas el ritmo, cada día cuenta. ¡Vení a entrenar!

### Oferta especial

- **Título**: Promoción especial para vos
- **Mensaje**: Tenemos clases nuevas esta semana. ¡Pasá a conocerlas!

## Preguntas Frecuentes

**¿Por qué un usuario aparece como inactivo?**
Un usuario aparece en la lista si no ha registrado asistencia (escaneado QR) en los últimos 7 días.

**¿Puedo volver a contactar a un usuario ya contactado?**
No directamente desde este widget, pero podés usar la sección de Notificaciones para enviar mensajes adicionales.

**¿El usuario recibe la notificación inmediatamente?**
Sí, es una notificación push que llega al dispositivo del usuario si tiene la app instalada y notificaciones habilitadas.

**¿El estado de "Contactado" se guarda permanentemente?**
El estado se reinicia cada mes para que puedas volver a evaluar y contactar usuarios si es necesario.
