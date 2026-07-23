import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SessionRepository } from './session.repository';
import { randomBytes } from 'node:crypto';
import { authConfig } from '@freelance-platform/shared-config';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  private generateToken(): string {
    return randomBytes(64).toString('hex');
  }

  async createUserSession(userId: string) {

    const token = this.generateToken();
    const refreshAfter = new Date(
      Date.now() + this.authConfiguration.refreshAfterSeconds * 1000,
    );

    const expiresAt = new Date(
      Date.now() +
        this.authConfiguration.sessionLifetimeSeconds * 1000,
    );

    return this.sessionRepository.createSession({
      userId,
      expiresAt,
      refreshAfter,
      token,
    });
  }

  async findByIdAndToken(sessionId: string, token: string) {
    return this.sessionRepository.findByIdAndToken(sessionId, token);
  }

  async deleteByIdAndUserId(sessionId: string, userId: string) {
    return this.sessionRepository.deleteByIdAndUserId(sessionId, userId);
  }
}
