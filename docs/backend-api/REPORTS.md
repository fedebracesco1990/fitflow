# Reports API

Endpoints para generación de reportes exportables.

## Base URL

```
/api/reports
```

## Autenticación

Todos los endpoints requieren JWT y rol `ADMIN`.

---

## Formatos Disponibles

| Formato | Content-Type                                                        |
| ------- | ------------------------------------------------------------------- |
| `pdf`   | `application/pdf`                                                   |
| `xlsx`  | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `csv`   | `text/csv`                                                          |

---

## Endpoints

### Reporte Financiero

Genera un reporte de ingresos y pagos.

```
POST /reports/financial
```

**Roles:** `ADMIN`

**Body:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "pdf"
}
```

**Response 200:**

Archivo binario con headers:

- `Content-Type`: según formato
- `Content-Disposition`: `attachment; filename="reporte-financiero-2024-01-31.pdf"`

---

### Reporte de Asistencia

Genera un reporte de asistencia de usuarios.

```
POST /reports/attendance
```

**Roles:** `ADMIN`

**Body:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "xlsx"
}
```

**Response 200:**

Archivo binario con headers:

- `Content-Type`: según formato
- `Content-Disposition`: `attachment; filename="reporte-asistencia-2024-01-31.xlsx"`

---

### Reporte de Usuarios

Genera un reporte de usuarios y membresías.

```
POST /reports/users
```

**Roles:** `ADMIN`

**Body:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "csv"
}
```

**Response 200:**

Archivo binario con headers:

- `Content-Type`: según formato
- `Content-Disposition`: `attachment; filename="reporte-usuarios-2024-01-31.csv"`
