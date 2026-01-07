import { IsOptional, IsEnum, IsUUID, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '../../../common/enums/difficulty.enum';
import { Equipment } from '../../../common/enums/equipment.enum';

export class FilterExercisesDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  includeInactive?: string;

  @IsOptional()
  @IsUUID()
  muscleGroupId?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(Equipment)
  equipment?: Equipment;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
