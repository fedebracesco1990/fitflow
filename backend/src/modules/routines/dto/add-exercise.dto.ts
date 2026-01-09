import { IsUUID, IsOptional, IsInt, Min, Max, IsString, IsNumber } from 'class-validator';

export class AddExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  suggestedWeight?: number;
}

export class UpdateRoutineExerciseDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  suggestedWeight?: number;
}
