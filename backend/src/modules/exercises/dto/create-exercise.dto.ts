import { IsString, IsOptional, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { MuscleGroup } from '../../../common/enums/muscle-group.enum';
import { Difficulty } from '../../../common/enums/difficulty.enum';

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

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
