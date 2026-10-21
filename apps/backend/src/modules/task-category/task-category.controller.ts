import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PopularTaskCategoryRdo, TaskCategoryRdo } from '@freelance-platform/shared-rdo';
import { fillRdo } from '../../common/fill-rdo';
import { TaskCategoryService } from './task-category.service';

@ApiTags('Категории задач')
@Controller('task-categories')
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @Get()
  @ApiOperation({
    description: 'Получение списка доступных категорий задач'
  })
  @ApiOkResponse({
    description: 'Список категорий задач',
    type: TaskCategoryRdo,
    isArray: true
  })
  async findAll(): Promise<TaskCategoryRdo[]> {
    const categories = await this.taskCategoryService.findAll();

    return fillRdo(TaskCategoryRdo, categories);
  }

  @Get('popular')
  @ApiOperation({
    summary: 'Популярные категории',
    description:
      'До 8 категорий, в которых есть открытые задачи. Категории без открытых задач не возвращаются',
  })
  @ApiOkResponse({
    description: 'Популярные категории с числом открытых задач',
    type: PopularTaskCategoryRdo,
    isArray: true,
  })
  async findPopular(): Promise<PopularTaskCategoryRdo[]> {
    const categories = await this.taskCategoryService.findPopular();

    return fillRdo(PopularTaskCategoryRdo, categories);
  }
}
