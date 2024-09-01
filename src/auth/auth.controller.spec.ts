import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass',
      };

      jest.spyOn(service, 'register').mockResolvedValue({ access_token: 'jwt-token' });

      const result = await controller.register(registerDto);

      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if the user already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'register').mockRejectedValue(new UserAlreadyExistsError());

      await expect(controller.register(registerDto)).rejects.toThrow(UserAlreadyExistsError);
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'login').mockResolvedValue({ access_token: 'jwt-token' });

      const result = await controller.login(loginDto);

      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if the credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'login').mockRejectedValue(new InvalidCredentialsError());

      await expect(controller.login(loginDto)).rejects.toThrow(InvalidCredentialsError);
    });
  });
});
