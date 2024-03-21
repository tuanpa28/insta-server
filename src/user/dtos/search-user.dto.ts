import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class SearchUserDto {
  @ApiProperty()
  @IsString({ message: 'Query should be a string' })
  @IsNotEmpty({ message: 'Query should not be empty' })
  q: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsString()
  _sort: string;

  @IsString()
  _order: string;
}

export default SearchUserDto;
