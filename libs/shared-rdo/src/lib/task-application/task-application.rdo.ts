import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';

export class TaskApplicationRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор отклика',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор задачи',
    example: 'c49a08da-f665-4533-8b4f-ac30b5e4de19',
  })
  taskId!: string;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор исполнителя',
    example: '1090cd0d-01ba-4cb6-a10d-01000136788e',
  })
  performerId!: string;

  @Expose()
  @ApiProperty({
    description: 'Предлагаемая цена',
    example: 15000,
    nullable: true,
  })
  proposedPrice!: number | null;

  @Expose()
  @ApiProperty({
    description: 'Сопроводительное сообщение',
    example: 'Готов выполнить задачу в указанные сроки',
  })
  message!: string;

  @Expose()
  @ApiProperty({
    description: 'Статус отклика',
    enum: TaskApplicationStatus,
    example: TaskApplicationStatus.Pending,
  })
  status!: TaskApplicationStatus;

  @Expose()
  @ApiProperty({
    description: 'Дата и время создания отклика',
    example: '2026-09-14T12:00:00.000Z',
  })
  createdAt!: Date;

  @Expose()
  @ApiProperty({
    description: 'Дата и время обновления отклика',
    example: '2026-09-14T12:00:00.000Z',
  })
  updatedAt!: Date;
}
