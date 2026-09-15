import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
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
    description: 'Статус отклика (для заказчика: accept или decline)',
    enum: TaskApplicationStatus,
    example: TaskApplicationStatus.Accept,
  })
  @IsOptional()
  @IsEnum(TaskApplicationStatus)
  status?: TaskApplicationStatus;
}
