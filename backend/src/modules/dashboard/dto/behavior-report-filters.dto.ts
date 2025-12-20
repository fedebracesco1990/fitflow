import { IsOptional, IsDateString } from 'class-validator';

export class BehaviorReportFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
