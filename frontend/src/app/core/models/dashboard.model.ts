// Dashboard Stats Models (Legacy)

export interface DashboardStats {
  miembrosActivos: number;
  expiranPronto: number;
  morosos: number;
  ingresosMes: number;
  ingresosHoy: number;
  rutinasActivas: number;
}

// Unified Dashboard Models (FITFLOW-61 API)

export interface AdminDashboard {
  role: 'admin';
  ingresosMes: number;
  ingresosHoy: number;
  morosos: number;
  proyeccionMes: number;
  asistenciasHoy: number;
  miembrosActivos: number;
  expiranPronto: number;
  rutinasActivas: number;
  prsDelMes: number;
  ingresosMensuales: MonthlyRevenue[];
  distribucionMetodosPago: PaymentMethodDistribution[];
}

export interface TrainerStudentSummary {
  userId: string;
  userName: string;
  userEmail: string;
  rutinasAsignadas: number;
  ultimaActividad: string | null;
  tieneRutinaActiva: boolean;
}

export interface TrainerDashboard {
  role: 'trainer';
  totalAlumnos: number;
  alumnosActivos: number;
  rutinasActivasCreadas: number;
  prsAlumnosMes: number;
  alumnosRecientes: TrainerStudentSummary[];
}

export type UnifiedDashboard = AdminDashboard | TrainerDashboard;

export function isAdminDashboard(data: UnifiedDashboard): data is AdminDashboard {
  return data.role === 'admin';
}

export function isTrainerDashboard(data: UnifiedDashboard): data is TrainerDashboard {
  return data.role === 'trainer';
}

// Dashboard Financial Models

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  total: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  total: number;
}
