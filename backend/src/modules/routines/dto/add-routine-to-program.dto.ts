import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

export class AddRoutineToProgramDto {
  @IsUUID()
  routineId: string;

  @IsInt()
  @Min(1)
  @Max(7)
  dayNumber: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
