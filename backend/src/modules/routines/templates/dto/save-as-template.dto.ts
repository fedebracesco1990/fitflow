import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TemplateCategory } from '../../../../common/enums/template-category.enum';

export class SaveAsTemplateDto {
  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
