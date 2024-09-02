import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: "The name of the user",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The email address of the user",
    example: "john.doe@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "The password for the user account",
    example: "Str0ngP@ssw0rd",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsStrongPassword()
  password: string;
}
