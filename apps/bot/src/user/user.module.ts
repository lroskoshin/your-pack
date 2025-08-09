import { Module } from '@nestjs/common';
import { UserMiddleware } from './user.middleware';

@Module({
  providers: [UserMiddleware],
  exports: [UserMiddleware],
})
export class UserModule {}
