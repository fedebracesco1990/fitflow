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
