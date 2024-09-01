import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,  
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { name, email, password } = registerDto;

    // Find user by email using Mongoose
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document using Mongoose
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token for the new user
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Find user by email using Mongoose
    const user = await this.userModel.findOne({ email }).exec();

    // Check if user exists and if password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new InvalidCredentialsError();
    }

    // Generate JWT token for the logged-in user
    return this.generateToken(user);
  }

  private generateToken(user: User): { access_token: string } {
    const payload: JwtPayload = { 
      sub: user._id.toString(), 
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Sign the JWT token with the payload
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
