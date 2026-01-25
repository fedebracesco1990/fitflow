export interface LowAttendanceUser {
  id: string;
  name: string;
  email: string;
  visitCount: number;
  lastAttendanceDate: string | null;
  membershipStatus: string | null;
}

export interface LowAttendanceMeta {
  total: number;
  month: number;
  year: number;
  minVisitsThreshold: number;
}

export interface LowAttendanceResponse {
  users: LowAttendanceUser[];
  meta: LowAttendanceMeta;
}

export interface LowAttendanceQueryParams {
  month?: number;
  year?: number;
  minVisits?: number;
}
