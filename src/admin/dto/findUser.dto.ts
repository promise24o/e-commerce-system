import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserByEmailDto {
  @ApiProperty({
    description: 'The email of the user to be found.',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;
}
