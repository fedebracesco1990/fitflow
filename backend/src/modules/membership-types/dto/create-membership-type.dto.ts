import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateMembershipTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  durationDays: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  gracePeriodDays?: number;
}
