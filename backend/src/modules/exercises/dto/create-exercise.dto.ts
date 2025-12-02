import { IsString, IsOptional, IsEnum, IsUrl, MaxLength, IsUUID } from 'class-validator';
import { Difficulty } from '../../../common/enums/difficulty.enum';

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  muscleGroupId: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
