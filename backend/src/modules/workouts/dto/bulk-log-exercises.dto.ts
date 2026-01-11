import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class BulkExerciseLogItemDto {
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

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rir?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;
}

export class BulkLogExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkExerciseLogItemDto)
  exercises: BulkExerciseLogItemDto[];
}
