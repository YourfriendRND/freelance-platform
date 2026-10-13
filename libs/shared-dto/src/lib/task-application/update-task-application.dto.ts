import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';

export class UpdateTaskApplicationDto {
  @ApiPropertyOptional({
    description: 'Сопроводительное сообщение',
    example: 'Обновлённое сообщение исполнителя',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Предлагаемая цена',
    example: 18000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  proposedPrice?: number;

  @ApiPropertyOptional({
    description: 'Срок выполнения текстом',
    example: '2 недели',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeline?: string;

  @ApiPropertyOptional({
    description: 'Статус отклика (для заказчика: accept или decline)',
    enum: TaskApplicationStatus,
    example: TaskApplicationStatus.Accept,
  })
  @IsOptional()
  @IsEnum(TaskApplicationStatus)
  status?: TaskApplicationStatus;
}
