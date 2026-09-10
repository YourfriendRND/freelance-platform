import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
  PUBLIC_TASK_STATUSES,
  PublicTaskStatus,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { IsGreaterThan } from './is-greater-than.decorator';

export class FindTasksQueryDto implements FindTasksQuery {
  @ApiPropertyOptional({
    description: 'Идентификатор категории задачи',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Статус задачи',
    enum: PUBLIC_TASK_STATUSES,
    example: TaskStatus.Open,
  })
  @IsOptional()
  @IsIn(PUBLIC_TASK_STATUSES)
  status?: PublicTaskStatus;

  @ApiPropertyOptional({
    description: 'Минимальный бюджет задачи',
    example: 10000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  budgetMin?: number;

  @ApiPropertyOptional({
    description: 'Максимальный бюджет задачи',
    example: 50000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @IsGreaterThan('budgetMin', {
    message: 'Минимальный бюджет должен быть меньше максимального',
  })
  budgetMax?: number;

  @ApiPropertyOptional({
    description: 'Сортировка задач',
    enum: TaskSort,
    example: TaskSort.Newest,
  })
  @IsOptional()
  @IsEnum(TaskSort)
  sort?: TaskSort;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    default: PAGINATION_DEFAULT_PAGE,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = PAGINATION_DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Количество задач на странице',
    default: PAGINATION_DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_MAX_LIMIT,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit: number = PAGINATION_DEFAULT_LIMIT;
}
