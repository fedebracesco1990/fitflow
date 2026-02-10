import {
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';

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
  @Type(() => Number)
  suggestedWeight?: number;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;
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
  @Type(() => Number)
  suggestedWeight?: number;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;
}

export class ReplaceExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddExerciseDto)
  exercises: AddExerciseDto[];
}
