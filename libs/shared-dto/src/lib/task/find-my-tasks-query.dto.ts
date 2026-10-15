import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FindMyTasksQuery, TaskStatus } from '@freelance-platform/shared-types';
import { FindTasksQueryFieldsDto } from './find-tasks-query.dto';

export class FindMyTasksQueryDto extends FindTasksQueryFieldsDto implements FindMyTasksQuery {
  @ApiPropertyOptional({
    description: 'Статус задачи, включая черновик',
    enum: TaskStatus,
    example: TaskStatus.Draft,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
