import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskExecutionType, TaskStatus } from '@freelance-platform/shared-types';
import { IsGreaterThan } from './is-greater-than.decorator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Название задачи',
    example: 'Разработка лендинга',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Описание задачи',
    example: 'Нужен адаптивный лендинг для запуска продукта',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Статус задачи. Если не указан, создаётся черновик',
    enum: [TaskStatus.Draft, TaskStatus.Open],
    example: TaskStatus.Open,
    required: false,
  })
  @IsOptional()
  @IsIn([TaskStatus.Draft, TaskStatus.Open])
  status?: TaskStatus;

  @ApiProperty({
    description: 'Минимальный бюджет',
    example: 10000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  budgetMin!: number;

  @ApiProperty({
    description: 'Максимальный бюджет',
    example: 25000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsGreaterThan('budgetMin', {
    message: 'Минимальный бюджет должен быть меньше максимального',
  })
  budgetMax!: number;

  @ApiProperty({
    description: 'Способ выполнения задачи',
    enum: TaskExecutionType,
    example: TaskExecutionType.Remote,
  })
  @IsEnum(TaskExecutionType)
  executionType!: TaskExecutionType;

  @ApiProperty({
    description: 'Срок выполнения задачи',
    example: '2026-09-01',
  })
  @IsDateString()
  deadline!: string;

  @ApiProperty({
    description: 'Идентификатор категории задачи',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  @IsUUID()
  categoryId!: string;
}
