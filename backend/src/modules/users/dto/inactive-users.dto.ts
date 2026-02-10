import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InactiveUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  daysSinceLastVisit?: number = 7;
}

export class InactiveUserDto {
  id: string;
  name: string;
  email: string;
  lastAttendanceDate: Date | null;
  daysSinceLastVisit: number;
  membershipStatus: string | null;
}

export class InactiveUsersResponseDto {
  users: InactiveUserDto[];
  meta: {
    total: number;
    daysSinceLastVisitThreshold: number;
  };
}
