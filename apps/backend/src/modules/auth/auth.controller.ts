import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigType } from '@nestjs/config';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '@freelance-platform/shared-dto';
import { CommonRdo, UserRdo } from '@freelance-platform/shared-rdo';
import { authConfig } from '@freelance-platform/shared-config';
import { fillRdo } from '../../common/fill-rdo';
import { CookieOptions, Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipExpiresCheck } from './decorators/skip-expires-check.decorator';
import { AuthUserPayload } from '@freelance-platform/shared-types';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  private sessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authConfiguration.cookieSecure,
    };
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Текущий пользователь',
    description:
      'Возвращает данные авторизованного пользователя по cookie-сессии. Если сессия отсутствует или просрочена - 401',
  })
  @ApiOkResponse({
    description: 'Данные текущего пользователя',
    type: UserRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Сессия просрочена',
      error: 'Unauthorized',
    },
  })
  async getCurrentUser(
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<UserRdo> {
    return fillRdo(UserRdo, authUser.user);
  }

  @Post('/join')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description: 'Создаёт нового пользователя на площадке',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Пользователь успешно зарегистрирован',
    type: UserRdo,
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже зарегистрирован',
    example: {
      statusCode: 409,
      message: 'Пользователь с "user@example.com" уже зарегистрирован',
      error: 'Conflict',
    },
  })
  async join(
    @Body() dto: CreateUserDto,
  ): Promise<UserRdo> {
    const joinedUser = await this.authService.joinUser(dto);

    return fillRdo(UserRdo, joinedUser);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: 'Проверяет логин/пароль и создаёт пользовательскую сессию',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Пользователь авторизован',
    type: UserRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный email или пароль',
    example: {
      statusCode: 401,
      message: 'Неверный email',
      error: 'Unauthorized',
    },
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserRdo> {
    const result = await this.authService.loginUser(dto);
    const cookieOptions = this.sessionCookieOptions();

    res.cookie(result.cookieKey, result.token, {
      ...cookieOptions,
      maxAge: Math.max(0, result.refreshAfter.getTime() - Date.now()),
    });

    return fillRdo(UserRdo, result.user);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Выход пользователя',
    description: 'Удаляет текущую сессию пользователя и очищает cookie',
  })
  @ApiOkResponse({
    description: 'Выход выполнен успешно',
    type: CommonRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена или cookie отсутствует',
    example: {
      statusCode: 401,
      message: 'Сессия не найдена',
      error: 'Unauthorized',
    },
  })
  async logout(
    @CurrentUser() authUser: AuthUserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonRdo> {
    const cookieKey = await this.authService.logout(authUser);
    const cookieOptions = this.sessionCookieOptions();
    res.clearCookie(cookieKey, cookieOptions);

    return fillRdo(CommonRdo, { message: 'Выход выполнен успешно' });
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @SkipExpiresCheck()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Обновление сессии',
    description: 'Проверяет текущую сессию и создаёт новую вместо неё',
  })
  @ApiOkResponse({
    description: 'Сессия успешно обновлена',
    type: UserRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, не принадлежит пользователю или просрочена',
    example: {
      statusCode: 401,
      message: 'Сессия просрочена',
      error: 'Unauthorized',
    },
  })
  async refresh(
    @CurrentUser() authUser: AuthUserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserRdo> {
    const result = await this.authService.refresh(authUser);
    const cookieOptions = this.sessionCookieOptions();

    if (result.oldCookieKey) {
      res.clearCookie(result.oldCookieKey, cookieOptions);
    }

    res.cookie(result.cookieKey, result.token, {
      ...cookieOptions,
      maxAge: Math.max(0, result.refreshAfter.getTime() - Date.now()),
    });

    return fillRdo(UserRdo, result.user);
  }
}
