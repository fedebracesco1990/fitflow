import { IsOptional, IsUUID } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';

export class CreatePaymentWithMembershipUpdateDto extends CreatePaymentDto {
  @IsOptional()
  @IsUUID()
  newMembershipTypeId?: string;
}
