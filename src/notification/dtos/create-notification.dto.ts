import { TypeNotification } from '@/libs/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsEnum } from 'class-validator';

class CreateNotificationDto {
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

  @IsBoolean()
  seen: boolean;
}

export default CreateNotificationDto;
