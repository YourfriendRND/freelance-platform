import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { FindTasksQueryDto } from '@freelance-platform/shared-dto';
import {
  PAGINATION_MAX_LIMIT,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';

const budgetMessage = 'Минимальный бюджет должен быть меньше максимального';
const categoryId = '9bce14fc-45b4-44ad-99c3-01fbeccf4e7f';

function constraintMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...constraintMessages(error.children ?? []),
  ]);
}

function dtoFrom(payload: Record<string, unknown>): FindTasksQueryDto {
  return plainToInstance(FindTasksQueryDto, payload);
}

describe('FindTasksQueryDto testing', () => {
  it('should accept an empty query with defaults', async () => {
    const dto = dtoFrom({});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('should accept valid filters and pagination', async () => {
    const dto = dtoFrom({
      categoryId,
      status: TaskStatus.Open,
      budgetMin: '10000',
      budgetMax: '50000',
      sort: TaskSort.BudgetDesc,
      page: '2',
      limit: '10',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.budgetMin).toBe(10000);
    expect(dto.budgetMax).toBe(50000);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('should reject invalid categoryId', async () => {
    const dto = dtoFrom({ categoryId: 'not-a-uuid' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject draft status filter', async () => {
    const dto = dtoFrom({ status: TaskStatus.Draft });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject budgetMin greater than budgetMax', async () => {
    const dto = dtoFrom({
      budgetMin: 50000,
      budgetMax: 10000,
    });

    const errors = await validate(dto);

    expect(constraintMessages(errors)).toContain(budgetMessage);
  });

  it('should reject non-positive budget values', async () => {
    const dto = dtoFrom({ budgetMin: 0 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject unknown sort value', async () => {
    const dto = dtoFrom({ sort: 'invalid' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject page less than 1', async () => {
    const dto = dtoFrom({ page: 0 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject limit greater than max', async () => {
    const dto = dtoFrom({ limit: PAGINATION_MAX_LIMIT + 1 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept limit equal to max', async () => {
    const dto = dtoFrom({ limit: PAGINATION_MAX_LIMIT });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
