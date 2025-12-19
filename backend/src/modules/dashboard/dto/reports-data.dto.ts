import { RevenueItemDto } from './revenue-item.dto';
import { AttendanceItemDto } from './attendance-item.dto';
import { MembershipItemDto } from './membership-item.dto';

export class ReportsDataDto {
  revenue: RevenueItemDto[];
  attendance: AttendanceItemDto[];
  memberships: MembershipItemDto[];
}
