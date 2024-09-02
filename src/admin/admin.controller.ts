import {
    Body,
    Controller,
    ForbiddenException,
    NotFoundException,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/schemas/user.schema';
import { UserService } from 'src/users/users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindUserByEmailDto } from './dto/findUser.dto';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

 @ApiOperation({ summary: 'Find a user by email' })
  @ApiResponse({ status: 200, description: 'User found.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('find')
  async findUserByEmail(@Body() findUserByEmailDto: FindUserByEmailDto, @Request() req: any) {
    const adminId = req.user.userId;
    const { email } = findUserByEmailDto;

    // Find the user by email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
  

  @ApiOperation({ summary: 'Ban a user' })
  @ApiResponse({ status: 200, description: 'User successfully banned.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('ban/:id')
  async banUser(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.userId;

    if (id === adminId) {
      throw new ForbiddenException("You cannot ban yourself.");
    }

    return this.userService.banUser(id);
  }

  @ApiOperation({ summary: 'Unban a user' })
  @ApiResponse({ status: 200, description: 'User successfully unbanned.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('unban/:id')
  async unbanUser(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.userId;

    if (id === adminId) {
      throw new ForbiddenException("You cannot unban yourself.");
    }

    return this.userService.unbanUser(id);
  }
}
