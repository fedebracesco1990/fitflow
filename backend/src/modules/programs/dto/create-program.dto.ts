import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '../../../common/enums/difficulty.enum';

export class CreateProgramRoutineExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(1)
  order: number;

  @IsInt()
  @Min(1)
  sets: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  restSeconds?: number;

  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateProgramRoutineDto {
  @IsUUID()
  routineId: string;

  @IsInt()
  @Min(1)
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramRoutineExerciseDto)
  @IsOptional()
  exercises?: CreateProgramRoutineExerciseDto[];
}

export class CreateProgramDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramRoutineDto)
  routines: CreateProgramRoutineDto[];
}
