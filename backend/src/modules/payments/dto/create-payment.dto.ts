import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';
import { IsCoverageValid } from '../../../common/validators/is-coverage-valid.validator';

export class CreatePaymentDto {
  @IsUUID()
  membershipId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsDateString()
  paymentDate: string;

  @IsDateString()
  coverageStartDate: string;

  @IsDateString()
  @IsCoverageValid('coverageStartDate')
  coverageEndDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
