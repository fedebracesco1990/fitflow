import { IsOptional, IsUUID } from 'class-validator';
import { PaginationWithFilterDto } from '../../../common/dto';

export class FilterRoutinesDto extends PaginationWithFilterDto {
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
