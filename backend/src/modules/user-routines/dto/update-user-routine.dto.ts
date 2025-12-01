import { IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

export class UpdateUserRoutineDto {
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
