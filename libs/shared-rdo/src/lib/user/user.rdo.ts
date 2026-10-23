import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@freelance-platform/shared-types';
import { formatBirthday } from './format-birthday';

export class UserRdo {
  @Expose()
  @ApiProperty({
    description: 'Идентификатор пользователя',
    example: 'b4252672-a116-41ee-b78c-d694b236db32'
  })
  id?: string;

  @Expose()
  @ApiProperty({
    description: 'Email пользователя',
    example: 'example_username@example.com'
  })
  email?: string;

  @Expose()
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван'
  })
  firstName?: string;

  @Expose()
  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    required: false
  })
  lastName?: string;

  @Expose()
  @ApiProperty({
    description: 'Роль пользователя на площадке',
    example: UserRole.Client
  })
  role?: UserRole;

  @Expose()
  @ApiProperty({
    description: 'Дата и время создания пользователя на площадке',
    example: '2026-07-03T18:30:00.000Z'
  })
  createdAt?: Date;

  @Expose()
  @ApiProperty({
    description: 'Рейтинг пользователя',
    example: 0,
  })
  rating?: number;

  @Expose()
  @ApiProperty({
    description: 'Число отзывов',
    example: 0,
  })
  reviewsCount?: number;

  @Expose()
  @ApiProperty({
    description: 'О себе',
    example: 'Верстаю интерфейсы и собираю дизайн-системы',
    nullable: true,
  })
  @Transform(({ value }) => value ?? null)
  bio!: string | null;

  @Expose()
  @ApiProperty({
    description: 'Дата рождения',
    example: '1994-05-12',
    nullable: true,
  })
  @Transform(({ value }) => formatBirthday(value))
  birthday!: string | null;

  @Expose()
  @ApiProperty({
    description: 'Ставка за час',
    example: 2500,
    nullable: true,
  })
  @Transform(({ value }) => value ?? null)
  rate!: number | null;
}
