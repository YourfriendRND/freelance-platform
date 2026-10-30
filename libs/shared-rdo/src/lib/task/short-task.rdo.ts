import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskExecutionType } from '@freelance-platform/shared-types';
import { UserRdo } from '../user/user.rdo';

export class ShortTaskRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор задачи',
    example: 'c49a08da-f665-4533-8b4f-ac30b5e4de19',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Название задачи',
    example: 'Разработка лендинга',
  })
  title!: string;

  @Expose()
  @ApiProperty({
    description: 'Минимальный бюджет',
    example: 10000,
  })
  budgetMin!: number;

  @Expose()
  @ApiProperty({
    description: 'Максимальный бюджет',
    example: 25000,
  })
  budgetMax!: number;

  @Expose()
  @ApiProperty({
    description: 'Срок выполнения задачи',
    example: '2026-09-01',
  })
  deadline!: Date;

  @Expose()
  @ApiProperty({
    description: 'Способ выполнения задачи',
    enum: TaskExecutionType,
    example: TaskExecutionType.Remote,
  })
  executionType!: TaskExecutionType;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор категории',
    example: '1090cd0d-01ba-4cb6-a10d-01000136788e',
  })
  categoryId!: string;

  @Expose()
  @Type(() => UserRdo)
  @ApiProperty({
    description: 'Заказчик задачи',
    type: UserRdo,
  })
  author!: UserRdo;
}
