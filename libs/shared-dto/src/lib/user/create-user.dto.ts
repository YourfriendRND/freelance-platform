import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@freelance-platform/shared-types';

export class CreateUserDto {
  @ApiProperty({
    description: 'Роль пользователя на площадке',
    enum: UserRole,
    example: UserRole.Client,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(2)
  firstName!: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    required: false,
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  lastName?: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
