import { MonthlyRevenueDto, PaymentMethodDistributionDto } from './financial-dashboard.dto';

export class AdminDashboardDto {
  role: 'admin';

  // Financial KPIs
  ingresosMes: number;
  ingresosHoy: number;
  morosos: number;
  proyeccionMes: number;

  // Operational KPIs
  asistenciasHoy: number;
  miembrosActivos: number;
  expiranPronto: number;

  // Workout KPIs
  rutinasActivas: number;
  prsDelMes: number;

  // Chart data
  ingresosMensuales: MonthlyRevenueDto[];
  distribucionMetodosPago: PaymentMethodDistributionDto[];
}
