import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class AssignProgramDto {
  @IsUUID()
  programId: string;

  @IsUUID()
  userId: string;

  @IsDateString()
  @IsOptional()
  assignedAt?: string;
}
