import { IsUUID, IsInt, IsOptional, IsString, Min, IsNumber } from 'class-validator';

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

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  suggestedWeight?: number;
}

export class UpdateProgramRoutineExerciseDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  sets?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  reps?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  restSeconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  suggestedWeight?: number;
}

export class BulkUpdateProgramRoutineExercisesDto {
  exercises: CreateProgramRoutineExerciseDto[];
}
