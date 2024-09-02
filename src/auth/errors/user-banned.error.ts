import { BadRequestException } from '@nestjs/common';

export class UserBannedError extends BadRequestException {
  constructor() {
    super('User is banned and cannot log in.');
  }
}
