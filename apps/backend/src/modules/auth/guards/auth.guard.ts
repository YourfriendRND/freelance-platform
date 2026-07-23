import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { authConfig } from '@freelance-platform/shared-config';
import { SessionService } from '../../session/session.service';
import { UserService } from '../../user/user.service';
import { AUTH_USER_KEY, AuthUserPayload } from '@freelance-platform/shared-types';
import { SKIP_EXPIRES_CHECK_KEY } from '../decorators/skip-expires-check.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { [AUTH_USER_KEY]?: AuthUserPayload }>();
    const cookies = request.cookies ?? {};
    const prefix = `${this.authConfiguration.appPrefix}_`;

    const cookieName = Object.keys(cookies).find((name) => name.startsWith(prefix));

    if (!cookieName) {
      throw new UnauthorizedException('Пользователь не авторизован. Cookie не найден');
    }

    const sessionId = cookieName.slice(prefix.length);
    const token = cookies[cookieName];

    if (!sessionId || !token) {
      throw new UnauthorizedException('Пользователь не авторизован. Cookie не содержит данных');
    }

    const session = await this.sessionService.findByIdAndToken(sessionId, String(token));

    if (!session) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия не найдена');
    }

    const skipExpiresCheck = this.reflector.getAllAndOverride<boolean>(SKIP_EXPIRES_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!skipExpiresCheck && Date.now() >= session.expiresAt.getTime()) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия просрочена');
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
        throw new UnauthorizedException('Пользователь не авторизован. Пользователь не найден');
      }

      throw err;
    }

    return true;
  }
}
