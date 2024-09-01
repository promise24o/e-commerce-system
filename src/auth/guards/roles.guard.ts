import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;  
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user; 

    if (!user || !requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('You do not have permission (Roles)');
    }

    return true;
  }
}
