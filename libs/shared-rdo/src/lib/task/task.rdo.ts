import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskExecutionType, TaskStatus } from '@freelance-platform/shared-types';

export class TaskRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор задачи',
    example: 'b4252672-a116-41ee-b78c-d694b236db32'
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Название задачи',
    example: 'Разработка лендинга'
  })
  title!: string;

  @Expose()
  @ApiProperty({
    description: 'Описание задачи',
    example: 'Нужен адаптивный лендинг для запуска продукта'
  })
  description!: string;

  @Expose()
  @ApiProperty({
    description: 'Статус задачи',
    enum: TaskStatus,
    example: TaskStatus.Draft
  })
  status!: TaskStatus;

  @Expose()
  @ApiProperty({
    description: 'Минимальный бюджет',
    example: 10000
  })
  budgetMin!: number;

  @Expose()
  @ApiProperty({
    description: 'Максимальный бюджет',
    example: 25000
  })
  budgetMax!: number;

  @Expose()
  @ApiProperty({
    description: 'Способ выполнения задачи',
    enum: TaskExecutionType,
    example: TaskExecutionType.Remote
  })
  executionType!: TaskExecutionType;

  @Expose()
  @ApiProperty({
    description: 'Срок выполнения задачи',
    example: '2026-09-01'
  })
  deadline!: Date;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор заказчика',
    example: 'c49a08da-f665-4533-8b4f-ac30b5e4de19'
  })
  customerId!: string;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор категории',
    example: '1090cd0d-01ba-4cb6-a10d-01000136788e'
  })
  categoryId!: string;

  @Expose()
  @ApiProperty({
    description: 'Дата и время создания задачи',
    example: '2026-08-19T12:00:00.000Z'
  })
  createdAt!: Date;

  @Expose()
  @ApiProperty({
    description: 'Дата и время обновления задачи',
    example: '2026-08-19T12:00:00.000Z'
  })
  updatedAt!: Date;
}
