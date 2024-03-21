import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class ChangePasswordDto {
  @ApiProperty()
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @ApiProperty()
  @IsString({ message: 'New Password should be a string' })
  @IsNotEmpty({ message: 'New Password should not be empty' })
  new_password: string;
}

export default ChangePasswordDto;
