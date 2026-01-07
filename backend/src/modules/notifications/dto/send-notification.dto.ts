import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities';

export class SendNotificationDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  templateType?: NotificationType;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  body?: string;
}
