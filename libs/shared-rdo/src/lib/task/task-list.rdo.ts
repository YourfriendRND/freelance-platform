import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskRdo } from './task.rdo';

export class TaskListRdo {
  @Expose()
  @Type(() => TaskRdo)
  @ApiProperty({
    description: 'Задачи текущей страницы',
    type: TaskRdo,
    isArray: true,
  })
  items!: TaskRdo[];

  @Expose()
  @ApiProperty({
    description: 'Общее количество задач с учётом фильтров',
    example: 42,
  })
  total!: number;

  @Expose()
  @ApiProperty({
    description: 'Номер текущей страницы',
    example: 1,
  })
  page!: number;

  @Expose()
  @ApiProperty({
    description: 'Количество задач на странице',
    example: 20,
  })
  limit!: number;
}
