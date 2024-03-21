import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Validate } from 'class-validator';

export class LogInDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Username or Email should not be empty' })
  @IsString({ message: 'Username or Email should be a string' })
  @Validate(
    (emailOrUsername) => {
      if (
        !emailOrUsername.match(
          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/,
        )
      ) {
        if (emailOrUsername.length < 3) return true;
      }
      return false;
    },
    { message: 'Invalid email or username format' },
  )
  emailOrUsername: string;

  @ApiProperty()
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6)
  password: string;
}

export default LogInDto;
