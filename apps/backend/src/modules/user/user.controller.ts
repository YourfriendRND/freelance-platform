import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from '@freelance-platform/shared-dto';
import { UserRdo } from '@freelance-platform/shared-rdo';
import { AuthUserPayload } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';
import { AuthCheck } from '../auth/decorators/auth-check.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';

@ApiTags('Пользователи')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({
    description: 'Получение данных пользователя по его id'
  })
  @ApiOkResponse({
    description: 'Данные пользователя',
    type: UserRdo
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    example: `Пользователь с "b4252672-a116-41ee-b78c-d694b236db32" не найден`
  })
  async findUser(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<UserRdo> {
    const user = await this.userService.findOne(id);

    return fillRdo(UserRdo, user);
  }

  @Patch(':id')
  @AuthCheck()
  @ApiOperation({
    summary: 'Редактирование профиля',
    description: 'Меняет данные только своего профиля. Пустые поля в теле запроса не меняются, null очищает фамилию, описание, дату рождения и ставку',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Профиль обновлен',
    type: UserRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Cookie не найден',
      error: 'Unauthorized',
    },
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения профиля',
    example: {
      statusCode: 403,
      message: 'Изменять профиль может только владелец',
      error: 'Forbidden',
    },
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
    example: {
      statusCode: 404,
      message: 'Пользователь с "b4252672-a116-41ee-b78c-d694b236db32" не найден',
      error: 'Not Found',
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные профиля',
    example: {
      statusCode: 400,
      message: ['Дата рождения не может быть в будущем'],
      error: 'Bad Request',
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<UserRdo> {
    const user = await this.userService.update(id, dto, authUser);
    authUser.user = user;

    return fillRdo(UserRdo, user);
  }
}
