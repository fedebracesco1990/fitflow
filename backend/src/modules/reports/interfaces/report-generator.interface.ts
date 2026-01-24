export interface ReportData {
  title: string;
  generatedAt: Date;
  period?: {
    startDate?: Date;
    endDate?: Date;
  };
  data: unknown;
}

export interface FinancialReportData extends ReportData {
  data: {
    totalRevenue: number;
    paymentCount: number;
    payments: Array<{
      date: string;
      userName: string;
      amount: number;
      method: string;
      membershipType: string;
    }>;
    summaryByMethod: Array<{
      method: string;
      total: number;
      count: number;
    }>;
  };
}

export interface AttendanceReportData extends ReportData {
  data: {
    totalAttendances: number;
    uniqueUsers: number;
    attendances: Array<{
      date: string;
      userName: string;
      checkInTime: string;
    }>;
    byDayOfWeek: Array<{
      day: string;
      count: number;
    }>;
    monthlyAverages: Array<{
      month: string;
      average: number;
    }>;
  };
}

export interface UsersReportData extends ReportData {
  data: {
    totalUsers: number;
    activeUsers: number;
    users: Array<{
      name: string;
      email: string;
      membershipType: string;
      membershipStatus: string;
      membershipEndDate: string;
    }>;
    summaryByMembershipType: Array<{
      type: string;
      count: number;
    }>;
  };
}

export interface IReportGenerator {
  generateFinancialReport(data: FinancialReportData): Promise<Buffer>;
  generateAttendanceReport(data: AttendanceReportData): Promise<Buffer>;
  generateUsersReport(data: UsersReportData): Promise<Buffer>;
}
