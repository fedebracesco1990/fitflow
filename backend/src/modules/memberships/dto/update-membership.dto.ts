import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateMembershipDto } from './create-membership.dto';
import { MembershipStatus } from '../entities/membership.entity';

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
