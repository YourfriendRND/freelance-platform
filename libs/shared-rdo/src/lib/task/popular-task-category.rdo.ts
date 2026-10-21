import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskCategoryRdo } from './task-category.rdo';

export class PopularTaskCategoryRdo extends TaskCategoryRdo {
  @Expose()
  @ApiProperty({
    description: 'Количество открытых задач в категории',
    example: 5,
  })
  taskCount!: number;
}
