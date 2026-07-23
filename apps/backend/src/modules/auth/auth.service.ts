import {
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto } from '@freelance-platform/shared-dto';
import { AuthUserPayload, SuccessLoginUser, UserEntity } from '@freelance-platform/shared-types';
import { authConfig } from '@freelance-platform/shared-config';
import { verifyPassword } from '../../common/verify-password';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly sessionService: SessionService,
  ) {}

  async joinUser(dto: CreateUserDto): Promise<UserEntity> {
    try {
      await this.userService.findByEmail(dto.email);
      throw new ConflictException(`Пользователь с "${dto.email}" уже зарегистрирован`);
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }

      if (!(err instanceof NotFoundException)) {
        throw err;
      }
    }

    return this.userService.createUser(dto);
  }

  async loginUser(
    dto: LoginUserDto,
  ): Promise<SuccessLoginUser> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email');
    }

    const credentials = await this.userService.findAuthCredentialsById(user.id);

    const isPasswordValid = await verifyPassword(
      dto.password,
      credentials.passwordHash,
      this.authConfiguration.saltWord,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const session = await this.sessionService.createUserSession(
      user.id
    );

    const cookieKey = `${this.authConfiguration.appPrefix}_${session.id}`;

    return {
      user,
      sessionId: session.id,
      token: session.token,
      refreshAfter: session.refreshAfter,
      cookieKey,
    };
  }

  async logout(authUser: AuthUserPayload): Promise<string> {
    const deleted = await this.sessionService.deleteByIdAndUserId(
      authUser.sessionId,
      authUser.user.id,
    );

    if (!deleted) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    return `${this.authConfiguration.appPrefix}_${authUser.sessionId}`;
  }

  async refresh(authUser: AuthUserPayload): Promise<SuccessLoginUser> {
    const session = await this.sessionService.findByIdAndToken(
      authUser.sessionId,
      authUser.token,
    );

    if (!session) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия не найдена');
    }

    if (session.userId !== authUser.user.id) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия не принадлежит пользователю');
    }

    if (Date.now() >= session.refreshAfter.getTime()) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия просрочена');
    }

    const deleted = await this.sessionService.deleteByIdAndUserId(
      authUser.sessionId,
      authUser.user.id,
    );

    if (!deleted) {
      throw new UnauthorizedException('Пользователь не авторизован. Сессия не найдена');
    }

    const newSession = await this.sessionService.createUserSession(authUser.user.id);
    const oldCookieKey = `${this.authConfiguration.appPrefix}_${authUser.sessionId}`;
    const cookieKey = `${this.authConfiguration.appPrefix}_${newSession.id}`;

    return {
      user: authUser.user,
      sessionId: newSession.id,
      token: newSession.token,
      refreshAfter: newSession.refreshAfter,
      cookieKey,
      oldCookieKey,
    };
  }
}
