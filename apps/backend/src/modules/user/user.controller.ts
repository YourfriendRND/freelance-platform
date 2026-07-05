import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRdo } from '@freelance-platform/shared-rdo';
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
    return this.userService.findOne(id);
  }
}
