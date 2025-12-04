# Dashboard Controller

Endpoints para métricas y estadísticas del sistema.

**Ruta base:** `/dashboard`

---

## Endpoints

| Método | Ruta                   | Descripción          | Roles |
| ------ | ---------------------- | -------------------- | ----- |
| GET    | `/dashboard/financial` | Dashboard financiero | ADMIN |

---

## GET /dashboard/financial

Obtiene métricas financieras del gimnasio.

**Roles:** `ADMIN`

**Response (200):**

```json
{
  "currentMonthRevenue": 150000,
  "previousMonthRevenue": 120000,
  "revenueGrowthPercentage": 25.0,
  "totalActiveMembers": 45,
  "totalDebtors": 5,
  "expiringInSevenDays": 8,
  "paymentMethodDistribution": [
    { "method": "cash", "count": 15, "total": 75000 },
    { "method": "card", "count": 10, "total": 50000 },
    { "method": "transfer", "count": 5, "total": 25000 }
  ],
  "monthlyRevenue": [
    { "month": "Jul", "year": 2024, "total": 100000 },
    { "month": "Ago", "year": 2024, "total": 110000 },
    { "month": "Sep", "year": 2024, "total": 105000 },
    { "month": "Oct", "year": 2024, "total": 115000 },
    { "month": "Nov", "year": 2024, "total": 120000 },
    { "month": "Dic", "year": 2024, "total": 150000 }
  ],
  "debtors": [
    {
      "userId": "uuid",
      "userName": "Juan Pérez",
      "userEmail": "juan@email.com",
      "membershipEndDate": "2024-11-15",
      "daysOverdue": 15
    }
  ],
  "expiringMemberships": [
    {
      "userId": "uuid",
      "userName": "María García",
      "userEmail": "maria@email.com",
      "membershipEndDate": "2024-12-05",
      "daysUntilExpiration": 5,
      "membershipTypeName": "Mensual"
    }
  ]
}
```

---

## Campos de Respuesta

### KPIs Principales

| Campo                   | Tipo   | Descripción                                     |
| ----------------------- | ------ | ----------------------------------------------- |
| currentMonthRevenue     | number | Total recaudado en el mes actual                |
| previousMonthRevenue    | number | Total recaudado en el mes anterior              |
| revenueGrowthPercentage | number | Porcentaje de crecimiento respecto mes anterior |
| totalActiveMembers      | number | Cantidad de membresías activas                  |
| totalDebtors            | number | Cantidad de miembros morosos                    |
| expiringInSevenDays     | number | Membresías que vencen en los próximos 7 días    |

### Distribución por Método de Pago

| Campo  | Tipo   | Descripción                                  |
| ------ | ------ | -------------------------------------------- |
| method | string | Método de pago (cash, card, transfer, other) |
| count  | number | Cantidad de pagos                            |
| total  | number | Monto total                                  |

### Ingresos Mensuales

| Campo | Tipo   | Descripción                     |
| ----- | ------ | ------------------------------- |
| month | string | Nombre del mes (Ene, Feb, etc.) |
| year  | number | Año                             |
| total | number | Total recaudado                 |

### Morosos (Debtors)

| Campo             | Tipo   | Descripción                       |
| ----------------- | ------ | --------------------------------- |
| userId            | UUID   | ID del usuario                    |
| userName          | string | Nombre del usuario                |
| userEmail         | string | Email del usuario                 |
| membershipEndDate | date   | Fecha de vencimiento de membresía |
| daysOverdue       | number | Días de mora                      |

### Membresías por Vencer

| Campo               | Tipo   | Descripción            |
| ------------------- | ------ | ---------------------- |
| userId              | UUID   | ID del usuario         |
| userName            | string | Nombre del usuario     |
| userEmail           | string | Email del usuario      |
| membershipEndDate   | date   | Fecha de vencimiento   |
| daysUntilExpiration | number | Días hasta vencimiento |
| membershipTypeName  | string | Tipo de membresía      |

---

## Notas de Implementación

- Los ingresos se calculan sumando todos los pagos registrados en el período
- Los morosos son usuarios con membresías expiradas o en período de gracia cuya fecha de fin es anterior a hoy
- Las membresías por vencer son aquellas activas que vencen en los próximos 7 días
- El porcentaje de crecimiento se calcula como: `((actual - anterior) / anterior) * 100`
- Los ingresos mensuales incluyen los últimos 6 meses
