import { TypeNotification } from '@/libs/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

class NotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(TypeNotification)
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  source_id: string;

  @ApiProperty()
  @IsBoolean()
  seen: boolean;
}

export default NotificationDto;
