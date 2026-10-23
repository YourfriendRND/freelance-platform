import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SessionModule } from '../session/session.module';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [SessionModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, AuthGuard],
  exports: [UserService],
})
export class UserModule {}
