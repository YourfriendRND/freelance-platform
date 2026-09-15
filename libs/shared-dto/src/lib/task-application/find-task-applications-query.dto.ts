import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FindTaskApplicationsQueryDto {
  @ApiPropertyOptional({
    description: 'Идентификатор задачи (только для заказчика)',
    example: 'b4252672-a116-41ee-b78c-d694b236db32',
  })
  @IsOptional()
  @IsUUID()
  taskId?: string;
}
