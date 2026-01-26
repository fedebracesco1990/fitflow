import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationWithFilterDto } from '../../../common/dto';
import { RoutineType } from '../../../common/enums/routine-type.enum';

export class FilterRoutinesDto extends PaginationWithFilterDto {
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  @IsEnum(RoutineType)
  type?: RoutineType;
}
