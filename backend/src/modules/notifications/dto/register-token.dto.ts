import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DevicePlatform } from '../entities';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform = DevicePlatform.WEB;
}
