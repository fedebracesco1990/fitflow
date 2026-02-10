export interface InactiveUser {
  id: string;
  name: string;
  email: string;
  lastAttendanceDate: string | null;
  daysSinceLastVisit: number;
  membershipStatus: string | null;
}

export interface InactiveUsersMeta {
  total: number;
  daysSinceLastVisitThreshold: number;
}

export interface InactiveUsersResponse {
  users: InactiveUser[];
  meta: InactiveUsersMeta;
}

export interface InactiveUsersQueryParams {
  daysSinceLastVisit?: number;
}
