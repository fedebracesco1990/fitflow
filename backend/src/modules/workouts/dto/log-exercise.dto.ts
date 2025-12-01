import {
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class LogExerciseDto {
  @IsUUID()
  routineExerciseId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  setNumber: number;

  @IsInt()
  @Min(0)
  @Max(100)
  reps: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExerciseLogDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
