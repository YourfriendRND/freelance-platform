import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CommonRdo {
  @Expose()
  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Выход выполнен успешно',
  })
  message!: string;
}
