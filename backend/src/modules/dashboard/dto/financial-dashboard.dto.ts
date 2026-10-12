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
  // Main KPIs
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowthPercentage: number;
  todayRevenue: number;

  // Memberships
  totalActiveMembers: number;
  totalDebtors: number;
  expiringInSevenDays: number;
  activeRoutines: number;

  // Distribution by payment method (current month)
  paymentMethodDistribution: PaymentMethodDistributionDto[];

  // Monthly revenue (last 6 months)
  monthlyRevenue: MonthlyRevenueDto[];

  // Lists
  debtors: DebtorDto[];
  expiringMemberships: ExpiringMembershipDto[];
}
