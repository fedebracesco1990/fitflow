import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateRoutineDto } from './create-routine.dto';

export class UpdateRoutineDto extends PartialType(CreateRoutineDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
