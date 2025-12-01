import { IsUUID, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { MembershipStatus } from '../entities/membership.entity';

export class CreateMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  membershipTypeId: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
