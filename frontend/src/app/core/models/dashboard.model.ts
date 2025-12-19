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

export interface Debtor {
  userId: string;
  userName: string;
  userEmail: string;
  membershipEndDate: string;
  daysOverdue: number;
}

export interface ExpiringMembership {
  userId: string;
  userName: string;
  userEmail: string;
  membershipEndDate: string;
  daysUntilExpiration: number;
  membershipTypeName: string;
}

export interface FinancialDashboard {
  // KPIs principales
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowthPercentage: number;
  todayRevenue: number;

  // Membresías
  totalActiveMembers: number;
  totalDebtors: number;
  expiringInSevenDays: number;
  activeRoutines: number;

  // Distribución por método de pago (mes actual)
  paymentMethodDistribution: PaymentMethodDistribution[];

  // Ingresos mensuales (últimos 6 meses)
  monthlyRevenue: MonthlyRevenue[];

  // Listas
  debtors: Debtor[];
  expiringMemberships: ExpiringMembership[];
}
