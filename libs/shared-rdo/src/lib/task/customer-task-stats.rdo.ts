import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerTaskStatsRdo {
  @Expose()
  @ApiProperty({
    description: 'Открытые задачи заказчика',
    example: 3,
  })
  open!: number;

  @Expose()
  @ApiProperty({
    description: 'Закрытые задачи заказчика',
    example: 1,
  })
  closed!: number;

  @Expose()
  @ApiProperty({
    description: 'Задачи заказчика в статусе черновик',
    example: 2,
  })
  draft!: number;

  @Expose()
  @ApiProperty({
    description: 'Отклики на рассмотрении по открытым задачам заказчика',
    example: 4,
  })
  pendingApplications!: number;
}
