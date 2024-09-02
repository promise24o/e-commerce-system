import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/schemas/user.schema";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully registered.",
    type: User
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request. Validation failed or missing fields.",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict. User with the same email already exists.",
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully logged in.",
    type: User
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid credentials.",
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
