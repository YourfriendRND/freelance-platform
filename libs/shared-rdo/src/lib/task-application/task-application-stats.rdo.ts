import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskApplicationStatsRdo {
  @Expose()
  @ApiProperty({
    description: 'Всего откликов пользователя',
    example: 12,
  })
  total!: number;

  @Expose()
  @ApiProperty({
    description: 'Отклики на рассмотрении',
    example: 4,
  })
  pending!: number;

  @Expose()
  @ApiProperty({
    description: 'Принятые отклики',
    example: 3,
  })
  accepted!: number;
}
