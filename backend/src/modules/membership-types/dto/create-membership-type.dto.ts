import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { AccessType } from '../../../common/enums/access-type.enum';

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

  @IsEnum(AccessType)
  accessType: AccessType;
}
