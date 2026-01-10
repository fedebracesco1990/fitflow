import { IsUUID, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

export class UserDayAssignment {
  @IsUUID()
  userId: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;
}

export class BulkAssignRoutineDto {
  @IsUUID()
  routineId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDayAssignment)
  assignments: UserDayAssignment[];

  @IsDateString()
  startDate: string;
}

export interface BulkAssignResult {
  success: boolean;
  totalAssigned: number;
  totalNotifications: number;
  errors: string[];
}
