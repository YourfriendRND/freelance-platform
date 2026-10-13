import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { authConfig } from '@freelance-platform/shared-config';
import { AUTH_USER_KEY, AuthUserPayload } from '@freelance-platform/shared-types';
import { SessionService } from '../../session/session.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { [AUTH_USER_KEY]?: AuthUserPayload }>();
    const cookies = request.cookies ?? {};
    const prefix = `${this.authConfiguration.appPrefix}_`;
    const cookieName = Object.keys(cookies).find((name) => name.startsWith(prefix));

    if (!cookieName) {
      return true;
    }

    const sessionId = cookieName.slice(prefix.length);
    const token = cookies[cookieName];

    if (!sessionId || !token) {
      return true;
    }

    const session = await this.sessionService.findByIdAndToken(sessionId, String(token));

    if (!session || Date.now() >= session.expiresAt.getTime()) {
      return true;
    }

    try {
      const user = await this.userService.findOne(session.userId);

      request[AUTH_USER_KEY] = {
        user,
        sessionId: session.id,
        token: String(token),
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        return true;
      }

      throw err;
    }

    return true;
  }
}
