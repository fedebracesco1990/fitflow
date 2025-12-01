import { IsString, IsOptional, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Difficulty } from '../../../common/enums/difficulty.enum';

export class CreateRoutineDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(180)
  estimatedDuration?: number;
}
