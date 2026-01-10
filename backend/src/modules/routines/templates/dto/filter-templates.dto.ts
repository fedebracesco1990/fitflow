import { IsEnum, IsOptional } from 'class-validator';
import { TemplateCategory } from '../../../../common/enums/template-category.enum';
import { PaginationDto } from '../../../../common/dto';

export class FilterTemplatesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;
}
