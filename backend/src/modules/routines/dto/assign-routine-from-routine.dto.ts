import { IsUUID, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

export class AssignRoutineFromRoutineDto {
  @IsUUID()
  userId: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
