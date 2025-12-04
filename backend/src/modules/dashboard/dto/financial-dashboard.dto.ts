export class PaymentMethodDistributionDto {
  method: string;
  count: number;
  total: number;
}

export class MonthlyRevenueDto {
  month: string;
  year: number;
  total: number;
}

export class DebtorDto {
  userId: string;
  userName: string;
  userEmail: string;
  membershipEndDate: Date;
  daysOverdue: number;
}

export class ExpiringMembershipDto {
  userId: string;
  userName: string;
  userEmail: string;
  membershipEndDate: Date;
  daysUntilExpiration: number;
  membershipTypeName: string;
}

export class FinancialDashboardDto {
  // KPIs principales
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowthPercentage: number;

  // Membresías
  totalActiveMembers: number;
  totalDebtors: number;
  expiringInSevenDays: number;

  // Distribución por método de pago (mes actual)
  paymentMethodDistribution: PaymentMethodDistributionDto[];

  // Ingresos mensuales (últimos 6 meses)
  monthlyRevenue: MonthlyRevenueDto[];

  // Listas
  debtors: DebtorDto[];
  expiringMemberships: ExpiringMembershipDto[];
}
