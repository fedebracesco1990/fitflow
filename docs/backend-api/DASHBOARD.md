# Dashboard Controller

Endpoints para métricas, estadísticas y reportes del sistema.

**Ruta base:** `/dashboard`

---

## Endpoints

| Método | Ruta                            | Descripción                                             | Roles          |
| ------ | ------------------------------- | ------------------------------------------------------- | -------------- |
| GET    | `/dashboard`                    | Dashboard según el rol del usuario autenticado          | ADMIN, TRAINER |
| GET    | `/dashboard/stats`              | KPIs generales del gimnasio                             | ADMIN          |
| GET    | `/dashboard/reports/financial`  | Reporte financiero de un mes                            | ADMIN          |
| GET    | `/dashboard/reports/behavior`   | Reporte de comportamiento de los socios                 | ADMIN          |
| GET    | `/dashboard/reports/export-csv` | Exporta el reporte financiero o de comportamiento a CSV | ADMIN          |

> Los reportes en PDF y Excel están en el módulo de [Reportes](./REPORTS.md).

---

## GET /dashboard

Devuelve el dashboard que corresponde al rol del usuario:

- **ADMIN:** KPIs del gimnasio, ingresos mensuales y distribución por método de pago (`AdminDashboardDto`).
- **TRAINER:** resumen de sus alumnos y rutinas (`TrainerDashboardDto`).

---

## GET /dashboard/stats

| Campo           | Tipo   | Descripción                                  |
| --------------- | ------ | -------------------------------------------- |
| miembrosActivos | number | Membresías activas                           |
| expiranPronto   | number | Membresías que vencen en los próximos 7 días |
| morosos         | number | Socios con la membresía vencida              |
| ingresosMes     | number | Total recaudado en el mes actual             |
| ingresosHoy     | number | Total recaudado hoy                          |
| rutinasActivas  | number | Programas asignados activos                  |

---

## GET /dashboard/reports/financial

**Query params:** `month` (1-12) y `year`, opcionales. Por defecto, el mes actual.

| Campo           | Tipo   | Descripción                                              |
| --------------- | ------ | -------------------------------------------------------- |
| ingresoTotal    | number | Total recaudado en el período                            |
| transacciones   | number | Cantidad de pagos                                        |
| morososActuales | number | Socios morosos al momento de la consulta                 |
| desglose        | array  | Pagos del período: `fecha`, `monto`, `metodo`, `miembro` |

---

## GET /dashboard/reports/behavior

**Query params:** `startDate` y `endDate` (ISO), opcionales.

| Campo              | Tipo   | Descripción                                                                                                   |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| visitasPromActivos | number | Visitas promedio de los socios con la cuota al día                                                            |
| visitasPromMorosos | number | Visitas promedio de los socios morosos                                                                        |
| rutinasActivas     | number | Socios con un programa activo                                                                                 |
| totalMembers       | number | Cantidad de socios analizados                                                                                 |
| analisis           | array  | Por socio: `miembro`, `email`, `estado` (`ACTIVE` / `OVERDUE` / `INACTIVE`), `visitasTotales`, `rutinaActiva` |

---

## GET /dashboard/reports/export-csv

**Query params:**

- `type`: `financial` o `behavior` (obligatorio).
- `month` y `year` para `financial`; `startDate` y `endDate` para `behavior`.

Devuelve un archivo `text/csv` (`reporte-<type>-<fecha>.csv`). Los campos se escapan: los que contienen comas, comillas o saltos de línea van entre comillas, y los textos que empiezan con `=`, `+`, `-` o `@` se prefijan con `'` para evitar inyección de fórmulas en Excel.
