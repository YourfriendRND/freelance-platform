import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskApplicationRdo } from './task-application.rdo';

export class TaskApplicationListRdo {
  @Expose()
  @Type(() => TaskApplicationRdo)
  @ApiProperty({
    description: 'Список откликов',
    type: TaskApplicationRdo,
    isArray: true,
  })
  items!: TaskApplicationRdo[];
}
