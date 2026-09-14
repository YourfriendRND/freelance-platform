import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CreateTaskApplicationDto,
  FindTaskApplicationsQueryDto,
  UpdateTaskApplicationDto,
} from '@freelance-platform/shared-dto';
import {
  TaskApplicationListRdo,
  TaskApplicationRdo,
} from '@freelance-platform/shared-rdo';
import { AuthUserPayload } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';
import { AuthCheck } from '../auth/decorators/auth-check.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TaskApplicationService } from './task-application.service';

@ApiTags('Отклики на задачи')
@AuthCheck()
@ApiUnauthorizedResponse({
  description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
  example: {
    statusCode: 401,
    message: 'Пользователь не авторизован. Cookie не найден',
    error: 'Unauthorized',
  },
})
@Controller('task-applications')
export class TaskApplicationController {
  constructor(
    private readonly taskApplicationService: TaskApplicationService,
  ) {}

  @Get()
  @ApiOperation({
    description:
      'Список откликов: исполнитель — свои отклики; заказчик — отклики на свои задачи (опционально taskId)',
  })
  @ApiOkResponse({
    description: 'Список откликов',
    type: TaskApplicationListRdo,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные параметры запроса',
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Параметр taskId доступен только заказчику',
      error: 'Bad Request',
    },
  })
  @ApiNotFoundResponse({
    description: 'Задача не найдена или недоступна заказчику',
    example: {
      statusCode: 404,
      message: 'Задача с "b4252672-a116-41ee-b78c-d694b236db32" не найдена',
      error: 'Not Found',
    },
  })
  async findAll(
    @Query() query: FindTaskApplicationsQueryDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskApplicationListRdo> {
    const items = await this.taskApplicationService.findAll(query, authUser);

    return fillRdo(TaskApplicationListRdo, { items });
  }

  @Get(':id')
  @ApiOperation({
    description: 'Получение отклика по id',
  })
  @ApiOkResponse({
    description: 'Данные отклика',
    type: TaskApplicationRdo,
  })
  @ApiNotFoundResponse({
    description: 'Отклик не найден',
    example: {
      statusCode: 404,
      message: 'Отклик с "b4252672-a116-41ee-b78c-d694b236db32" не найден',
      error: 'Not Found',
    },
  })
  @ApiForbiddenResponse({
    description: 'Нет доступа к отклику',
    example: {
      statusCode: 403,
      message: 'Нет доступа к этому отклику',
      error: 'Forbidden',
    },
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskApplicationRdo> {
    const application = await this.taskApplicationService.findOne(id, authUser);

    return fillRdo(TaskApplicationRdo, application);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'Создание отклика на задачу',
  })
  @ApiBody({ type: CreateTaskApplicationDto })
  @ApiCreatedResponse({
    description: 'Отклик успешно создан',
    type: TaskApplicationRdo,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания отклика',
    example: {
      statusCode: 403,
      message: 'Откликаться на задачу может только исполнитель',
      error: 'Forbidden',
    },
  })
  @ApiNotFoundResponse({
    description: 'Задача не найдена',
    example: {
      statusCode: 404,
      message: 'Задача с "b4252672-a116-41ee-b78c-d694b236db32" не найдена',
      error: 'Not Found',
    },
  })
  @ApiConflictResponse({
    description: 'Отклик на задачу уже существует',
    example: {
      statusCode: 409,
      message: 'Вы уже откликались на эту задачу',
      error: 'Conflict',
    },
  })
  async create(
    @Body() dto: CreateTaskApplicationDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskApplicationRdo> {
    const application = await this.taskApplicationService.create(dto, authUser);

    return fillRdo(TaskApplicationRdo, application);
  }

  @Patch(':id')
  @ApiOperation({
    description: 'Обновление отклика по id',
  })
  @ApiBody({ type: UpdateTaskApplicationDto })
  @ApiOkResponse({
    description: 'Отклик успешно обновлён',
    type: TaskApplicationRdo,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные отклика',
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Не переданы данные для обновления',
      error: 'Bad Request',
    },
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения отклика',
    example: {
      statusCode: 403,
      message: 'Изменить можно только отклик на рассмотрении',
      error: 'Forbidden',
    },
  })
  @ApiNotFoundResponse({
    description: 'Отклик не найден',
    example: {
      statusCode: 404,
      message: 'Отклик с "b4252672-a116-41ee-b78c-d694b236db32" не найден',
      error: 'Not Found',
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskApplicationDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskApplicationRdo> {
    const application = await this.taskApplicationService.update(id, dto, authUser);

    return fillRdo(TaskApplicationRdo, application);
  }
}
