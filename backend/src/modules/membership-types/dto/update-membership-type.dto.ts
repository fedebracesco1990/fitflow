import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMembershipTypeDto } from './create-membership-type.dto';

export class UpdateMembershipTypeDto extends PartialType(CreateMembershipTypeDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
