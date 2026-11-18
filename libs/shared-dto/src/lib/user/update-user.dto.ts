import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { SKILL_NAME_MAX_LENGTH, USER_RATE_MAX } from '@freelance-platform/shared-types';
import { IsBirthday } from './is-birthday.decorator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    required: false,
    minLength: 2,
    maxLength: 255,
  })
  @ValidateIf((dto: UpdateUserDto) => dto.firstName !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    required: false,
    nullable: true,
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastName?: string | null;

  @ApiProperty({
    description: 'О себе',
    example: 'Верстаю интерфейсы и собираю дизайн-системы',
    required: false,
    nullable: true,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string | null;

  @ApiProperty({
    description: 'Дата рождения',
    example: '1994-05-12',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBirthday()
  birthday?: string | null;

  @ApiProperty({
    description: 'Ставка за час',
    example: 2500,
    required: false,
    nullable: true,
    minimum: 0,
    maximum: USER_RATE_MAX,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(USER_RATE_MAX)
  rate?: number | null;

  @ApiProperty({
    description: 'Навыки исполнителя. Список целиком заменяет текущий набор',
    example: ['TypeScript', 'Angular'],
    required: false,
    type: [String],
    minLength: 1,
    maxLength: SKILL_NAME_MAX_LENGTH,
  })
  @ValidateIf((dto: UpdateUserDto) => dto.skills !== undefined)
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true, message: 'Название навыка не может быть пустым' })
  @MaxLength(SKILL_NAME_MAX_LENGTH, {
    each: true,
    message: `Название навыка не длиннее ${SKILL_NAME_MAX_LENGTH} символов`,
  })
  skills?: string[];
}
