import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LowAttendanceQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minVisits?: number;
}

export class LowAttendanceUserDto {
  id: string;
  name: string;
  email: string;
  visitCount: number;
  lastAttendanceDate: Date | null;
  membershipStatus: string | null;
}

export class LowAttendanceResponseDto {
  users: LowAttendanceUserDto[];
  meta: {
    total: number;
    month: number;
    year: number;
    minVisitsThreshold: number;
  };
}
