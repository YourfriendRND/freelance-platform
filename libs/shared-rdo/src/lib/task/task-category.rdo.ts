import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskCategoryRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор категории',
    example: 'b4252672-a116-41ee-b78c-d694b236db32'
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование и IT'
  })
  title!: string;

  @Expose()
  @ApiProperty({
    description: 'Описание категории',
    example: 'Разработка сайтов, приложений, настройка серверов, консультации'
  })
  description!: string;
}
