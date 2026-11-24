import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ShortPublicUserRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор пользователя',
    example: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  firstName!: string;

  @Expose()
  @ApiProperty({
    description: 'Фамилия пользователя. Пустая строка, если фамилия не задана',
    example: 'Иванов',
  })
  @Transform(({ value }) => value ?? '')
  lastName!: string;
}
