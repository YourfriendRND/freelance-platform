import { Type } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';
import { TaskStatus } from '@freelance-platform/shared-types';
import { CreateTaskDto } from './create-task.dto';
import { IsGreaterThan } from './is-greater-than.decorator';

type UpdateTaskBaseFields = Partial<
  Omit<CreateTaskDto, 'status' | 'budgetMin' | 'budgetMax'>
>;

const UpdateTaskDtoBase: Type<UpdateTaskBaseFields> = PartialType(
  OmitType(CreateTaskDto, ['status', 'budgetMin', 'budgetMax'] as const),
);

function hasBudgetPatch(dto: UpdateTaskDto) {
  return dto.budgetMin !== undefined || dto.budgetMax !== undefined;
}

export class UpdateTaskDto extends UpdateTaskDtoBase {
  @ApiProperty({
    description: 'Статус задачи',
    enum: TaskStatus,
    example: TaskStatus.Open,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Минимальный бюджет',
    example: 10000,
    minimum: 1,
    required: false,
  })
  @ValidateIf(hasBudgetPatch)
  @IsInt()
  @Min(1)
  budgetMin?: number;

  @ApiProperty({
    description: 'Максимальный бюджет',
    example: 25000,
    minimum: 1,
    required: false,
  })
  @ValidateIf(hasBudgetPatch)
  @IsInt()
  @Min(1)
  @IsGreaterThan('budgetMin', {
    message: 'Минимальный бюджет должен быть меньше максимального',
  })
  budgetMax?: number;
}
