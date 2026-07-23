import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@freelance-platform/shared-types';

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
}
