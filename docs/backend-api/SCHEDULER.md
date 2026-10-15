# Scheduler Controller

Endpoints para ejecutar manualmente las tareas programadas (cron) de membresías y asistencia, que envían notificaciones a los socios.

**Ruta base:** `/scheduler`

---

## Endpoints

| Método | Ruta                                        | Descripción                                   | Roles |
| ------ | ------------------------------------------- | --------------------------------------------- | ----- |
| POST   | `/scheduler/trigger/expiring-memberships`   | Ejecuta el chequeo de membresías por vencer   | ADMIN |
| POST   | `/scheduler/trigger/expired-memberships`    | Ejecuta el chequeo de membresías vencidas     | ADMIN |
| POST   | `/scheduler/trigger/low-attendance-weekly`  | Ejecuta el chequeo semanal de baja asistencia | ADMIN |
| POST   | `/scheduler/trigger/low-attendance-monthly` | Ejecuta el chequeo mensual de baja asistencia | ADMIN |

Ninguno de los endpoints recibe body ni query params. Cada uno ejecuta de forma síncrona el mismo método que corre el cron correspondiente y responde cuando termina.

**Errores (todos los endpoints):**

| Código | Descripción                     |
| ------ | ------------------------------- |
| 401    | No autenticado                  |
| 403    | El usuario no tiene rol `ADMIN` |

> Los errores internos del job (fallo de base de datos, template inactivo, usuario sin tokens, etc.) se capturan y solo se registran en el log del servidor. El endpoint responde `201` igualmente; no informa cuántas notificaciones se enviaron.

---

## POST /scheduler/trigger/expiring-memberships

Ejecuta `handleExpiringMemberships`: busca las membresías `ACTIVE` cuya fecha de fin es **exactamente dentro de 3 días** y envía a cada socio la notificación del template `MEMBERSHIP_EXPIRING`.

**Roles:** `ADMIN`

**Response (201):**

```json
{
  "message": "Expiring memberships check triggered successfully"
}
```

---

## POST /scheduler/trigger/expired-memberships

Ejecuta `handleExpiredMemberships`:

1. Pasa a `EXPIRED` todas las membresías `ACTIVE` con fecha de fin anterior a hoy.
2. Busca las membresías `ACTIVE` cuya fecha de fin es **hoy** y envía a cada socio la notificación del template `MEMBERSHIP_EXPIRED`.

**Roles:** `ADMIN`

**Response (201):**

```json
{
  "message": "Expired memberships check triggered successfully"
}
```

---

## POST /scheduler/trigger/low-attendance-weekly

Ejecuta `handleWeeklyLowAttendanceCheck`: cuenta los accesos concedidos (`granted = true`) de cada socio en el **mes en curso** y envía el template `LOW_ATTENDANCE` a quienes tienen menos de 8 visitas.

**Roles:** `ADMIN`

**Response (201):**

```json
{
  "message": "Weekly low attendance check triggered successfully"
}
```

---

## POST /scheduler/trigger/low-attendance-monthly

Ejecuta `handleMonthlyLowAttendanceCheck`: cuenta los accesos concedidos de cada usuario activo con rol `user` en el **mes anterior** (calendario completo) y envía el template `LOW_ATTENDANCE` a quienes tuvieron menos de 8 visitas. Al ejecutarlo manualmente, siempre evalúa el mes anterior a la fecha actual.

**Roles:** `ADMIN`

**Response (201):**

```json
{
  "message": "Monthly low attendance check triggered successfully"
}
```

---

## Tareas programadas (cron)

Definidas con `@Cron` en `SchedulerService`. Todas usan la zona horaria `America/Montevideo`.

| Job (`name`)                | Expresión   | Cuándo corre                     | Qué hace                                                                                                    | Trigger manual                                   |
| --------------------------- | ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `checkExpiringMemberships`  | `0 8 * * *` | Todos los días a las 08:00       | Notifica (`MEMBERSHIP_EXPIRING`) a los socios cuya membresía activa vence exactamente en 3 días             | `POST /scheduler/trigger/expiring-memberships`   |
| `checkExpiredMemberships`   | `0 8 * * *` | Todos los días a las 08:00       | Marca como `EXPIRED` las membresías vencidas y notifica (`MEMBERSHIP_EXPIRED`) a las que vencen hoy         | `POST /scheduler/trigger/expired-memberships`    |
| `checkWeeklyLowAttendance`  | `0 9 * * 1` | Todos los lunes a las 09:00      | Notifica (`LOW_ATTENDANCE`) a los socios con menos de 8 visitas en el mes en curso                          | `POST /scheduler/trigger/low-attendance-weekly`  |
| `checkMonthlyLowAttendance` | `0 9 1 * *` | El día 1 de cada mes a las 09:00 | Notifica (`LOW_ATTENDANCE`) a los usuarios activos con rol `user` con menos de 8 visitas en el mes anterior | `POST /scheduler/trigger/low-attendance-monthly` |

**Constantes:**

| Constante               | Valor | Uso                                                         |
| ----------------------- | ----- | ----------------------------------------------------------- |
| `EXPIRATION_DAYS_AHEAD` | 3     | Días de anticipación para avisar el vencimiento             |
| `MIN_MONTHLY_VISITS`    | 8     | Umbral de visitas mensuales para considerar baja asistencia |

---

## Notas

- **Notificaciones:** se envían con `NotificationsService.sendByTemplate`, que persiste la notificación in-app, la emite por WebSocket y, si Firebase está configurado, envía push FCM. Ver [NOTIFICATIONS.md](./NOTIFICATIONS.md).
- **Templates requeridos:** si el template (`MEMBERSHIP_EXPIRING`, `MEMBERSHIP_EXPIRED` o `LOW_ATTENDANCE`) no existe o está inactivo, el envío falla para cada usuario y solo queda registrado en el log.
- **Baja asistencia:** solo se consideran socios con al menos un acceso concedido en el período; quien no registró ninguna visita no recibe la notificación.
- **Zona horaria:** la zona `America/Montevideo` define cuándo se dispara el cron; los cálculos de fechas dentro de los jobs ("hoy", "en 3 días", "mes anterior") usan la hora local del servidor.
- Un fallo al notificar a un usuario no interrumpe el job: se registra el error y se continúa con el siguiente.
