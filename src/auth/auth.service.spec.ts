import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    prismaClient: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.prismaClient.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(prisma.prismaClient.user, 'create').mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(prisma.prismaClient.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: 'hashedPassword',
        },
      });
    });

    it('should throw an error if the user already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.prismaClient.user, 'findUnique').mockResolvedValue({
        id: 'existing-id',
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.register(registerDto)).rejects.toThrow(UserAlreadyExistsError);
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.prismaClient.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if the credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.prismaClient.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsError);
    });
  });
});
