import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ShortPublicUserRdo } from '../user/short-public-user.rdo';

export class ReviewRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор отзыва',
    example: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Оценка от 1 до 5',
    example: 5,
  })
  mark!: number;

  @Expose()
  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Сдал работу в срок',
  })
  review!: string;

  @Expose()
  @Type(() => ShortPublicUserRdo)
  @ApiProperty({
    description: 'Автор отзыва',
    type: ShortPublicUserRdo,
  })
  author!: ShortPublicUserRdo;

  @Expose()
  @ApiProperty({
    description: 'Идентификатор пользователя, о котором отзыв',
    example: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
  })
  targetId!: string;

  @Expose()
  @ApiProperty({
    description: 'Дата и время создания отзыва',
    example: '2026-11-23T10:00:00.000Z',
  })
  createdAt!: Date;
}
