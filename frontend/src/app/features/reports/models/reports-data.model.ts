export interface RevenueItem {
  month: string;
  year: number;
  total: number;
}

export interface AttendanceItem {
  date: string;
  count: number;
}

export interface MembershipItem {
  status: string;
  count: number;
  total: number;
}

export interface ReportsData {
  revenue: RevenueItem[];
  attendance: AttendanceItem[];
  memberships: MembershipItem[];
}
