import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';

@Module({
  imports: [],
  providers: [SessionService, SessionRepository],
  exports: [SessionService],
})
export class SessionModule {}
