import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskApplicationDto {
  @ApiProperty({
    description: 'Идентификатор задачи',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  @IsUUID()
  taskId!: string;

  @ApiProperty({
    description: 'Сопроводительное сообщение',
    example: 'Готов выполнить задачу в указанные сроки',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    description: 'Предлагаемая цена',
    example: 15000,
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
}
