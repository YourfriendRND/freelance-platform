import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateTaskDto, UpdateTaskDto } from '@freelance-platform/shared-dto';
import { CommonRdo, TaskRdo } from '@freelance-platform/shared-rdo';
import { AuthUserPayload } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';
import { AuthCheck } from '../auth/decorators/auth-check.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TaskService } from './task.service';

@ApiTags('Задачи')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({
    description: 'Получение списка задач',
  })
  @ApiOkResponse({
    description: 'Список задач',
    type: TaskRdo,
    isArray: true,
  })
  async findAll(): Promise<TaskRdo[]> {
    const tasks = await this.taskService.findAll();

    return fillRdo(TaskRdo, tasks);
  }

  @Get(':id')
  @ApiOperation({
    description: 'Получение задачи по id',
  })
  @ApiOkResponse({
    description: 'Данные задачи',
    type: TaskRdo,
  })
  @ApiNotFoundResponse({
    description: 'Задача не найдена',
    example: {
      statusCode: 404,
      message: 'Задача с "b4252672-a116-41ee-b78c-d694b236db32" не найдена',
      error: 'Not Found',
    },
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskRdo> {
    const task = await this.taskService.findOne(id);

    return fillRdo(TaskRdo, task);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AuthCheck()
  @ApiOperation({
    description: 'Создание новой задачи',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: 'Задача успешно создана',
    type: TaskRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Cookie не найден',
      error: 'Unauthorized',
    },
  })
  @ApiNotFoundResponse({
    description: 'Категория задачи не найдена',
    example: {
      statusCode: 404,
      message: 'Категория с "b4252672-a116-41ee-b78c-d694b236db32" не найдена',
      error: 'Not Found',
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные задачи',
    example: {
      statusCode: 400,
      message: ['Минимальный бюджет должен быть меньше максимального'],
      error: 'Bad Request',
    },
  })
  @ApiForbiddenResponse({
    description: 'Создавать задачу может только заказчик',
    example: {
      statusCode: 403,
      message: 'Создавать задачу может только заказчик',
      error: 'Forbidden',
    },
  })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskRdo> {
    const task = await this.taskService.create(dto, authUser);

    return fillRdo(TaskRdo, task);
  }

  @Patch(':id')
  @AuthCheck()
  @ApiOperation({
    description: 'Обновление задачи',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: 'Задача успешно обновлена',
    type: TaskRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Cookie не найден',
      error: 'Unauthorized',
    },
  })
  @ApiNotFoundResponse({
    description: 'Задача или категория не найдена',
    example: {
      statusCode: 404,
      message: 'Задача с "b4252672-a116-41ee-b78c-d694b236db32" не найдена',
      error: 'Not Found',
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные задачи',
    example: {
      statusCode: 400,
      message: ['Минимальный бюджет должен быть меньше максимального'],
      error: 'Bad Request',
    },
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для изменения задачи',
    example: {
      statusCode: 403,
      message: 'Изменять задачу может только владелец',
      error: 'Forbidden',
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<TaskRdo> {
    const task = await this.taskService.update(id, dto, authUser);

    return fillRdo(TaskRdo, task);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @AuthCheck()
  @ApiOperation({
    description: 'Удаление задачи',
  })
  @ApiOkResponse({
    description: 'Задача успешно удалена',
    type: CommonRdo,
  })
  @ApiUnauthorizedResponse({
    description: 'Сессия не найдена, cookie отсутствует или сессия просрочена',
    example: {
      statusCode: 401,
      message: 'Пользователь не авторизован. Cookie не найден',
      error: 'Unauthorized',
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
  @ApiForbiddenResponse({
    description: 'Удалять задачу может только владелец',
    example: {
      statusCode: 403,
      message: 'Удалять задачу может только владелец',
      error: 'Forbidden',
    },
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthUserPayload,
  ): Promise<CommonRdo> {
    await this.taskService.delete(id, authUser);

    return fillRdo(CommonRdo, { message: 'Задача удалена' });
  }
}
