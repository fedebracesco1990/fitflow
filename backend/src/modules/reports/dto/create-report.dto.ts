import { IsEnum, IsOptional, IsDateString, IsObject } from 'class-validator';

export enum ReportType {
  FINANCIAL = 'financial',
  ATTENDANCE = 'attendance',
  USERS = 'users',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ReportFiltersDto {
  @IsOptional()
  membershipStatus?: string;

  @IsOptional()
  userId?: string;

  @IsOptional()
  paymentMethod?: string;
}

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  filters?: ReportFiltersDto;
}
