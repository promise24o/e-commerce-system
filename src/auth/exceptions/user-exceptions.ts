import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User not found');
  }
}

export class UserBannedException extends ForbiddenException {
  constructor() {
    super('User is banned');
  }
}
