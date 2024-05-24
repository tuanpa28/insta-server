import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

class SharePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'UserId should not be empty' })
  user_id: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty({ message: 'Date should not be empty' })
  date: Date;
}

export default SharePostDto;
