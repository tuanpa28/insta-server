import { IsNotEmpty, IsString } from 'class-validator';

class FindOptionsDto {
  @IsString({ message: 'Field should be a string' })
  @IsNotEmpty({ message: 'Field should not be empty' })
  field: string;

  @IsNotEmpty({ message: 'Payload should not be empty' })
  payload: any;
}

export default FindOptionsDto;
