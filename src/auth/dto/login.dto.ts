import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "john.doe@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "The password for the user account",
    example: "P@ssw0rd123",
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
