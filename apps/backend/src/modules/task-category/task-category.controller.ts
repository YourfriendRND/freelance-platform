import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskCategoryRdo } from '@freelance-platform/shared-rdo';
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
}
