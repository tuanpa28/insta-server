import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

class UserDto {
  @ApiProperty()
  @IsString()
  googleId: string;

  @ApiProperty()
  @IsString({ message: 'UserName should be a string' })
  @IsNotEmpty({ message: 'UserName should not be empty' })
  @MinLength(4)
  username: string;

  @ApiProperty()
  @IsString({ message: 'Email should be a string' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString({ message: 'Full-Name should be a string' })
  @IsNotEmpty({ message: 'Full-Name should not be empty' })
  @MinLength(4)
  full_name: string;

  @ApiProperty()
  @IsString({ message: 'Avatar should be a string' })
  profile_image: string;

  @ApiProperty()
  @IsString({ message: 'Bio should be a string' })
  bio: string;

  @ApiProperty()
  @IsDate()
  date_of_birth: Date;

  @ApiProperty()
  @IsString({ message: 'Gender should be a string' })
  gender: string;

  @ApiProperty()
  @IsString({ message: 'Current City should be a string' })
  current_city: string;

  @ApiProperty()
  @IsString({ message: 'From should be a string' })
  from: string;

  @ApiProperty()
  @IsArray()
  followers: Array<string>;

  @ApiProperty()
  @IsArray()
  followings: Array<string>;

  @ApiProperty()
  @IsBoolean()
  tick: boolean;

  @ApiProperty()
  @IsBoolean()
  isAdmin: boolean;
}

export default UserDto;
