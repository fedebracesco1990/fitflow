import { MonthlyRevenueDto, PaymentMethodDistributionDto } from './financial-dashboard.dto';

export class AdminDashboardDto {
  role: 'admin';

  // KPIs financieros
  ingresosMes: number;
  ingresosHoy: number;
  morosos: number;
  proyeccionMes: number;

  // KPIs operativos
  asistenciasHoy: number;
  miembrosActivos: number;
  expiranPronto: number;

  // KPIs entrenamientos
  rutinasActivas: number;
  prsDelMes: number;

  // Datos para gráficos
  ingresosMensuales: MonthlyRevenueDto[];
  distribucionMetodosPago: PaymentMethodDistributionDto[];
}
