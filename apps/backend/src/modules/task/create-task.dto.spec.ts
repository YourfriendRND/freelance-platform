import { validate, ValidationError } from 'class-validator';
import { CreateTaskDto, UpdateTaskDto } from '@freelance-platform/shared-dto';
import { TaskExecutionType } from '@freelance-platform/shared-types';

const budgetMessage = 'Минимальный бюджет должен быть меньше максимального';

const validPayload = {
  title: 'Разработка лендинга',
  description: 'Нужен адаптивный лендинг для запуска продукта',
  budgetMin: 10000,
  budgetMax: 25000,
  executionType: TaskExecutionType.Remote,
  deadline: '2026-09-01',
  categoryId: '9bce14fc-45b4-44ad-99c3-01fbeccf4e7f',
};

function constraintMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...constraintMessages(error.children ?? []),
  ]);
}

describe('CreateTaskDto testing', () => {
  it('should accept payload when budgetMax is greater than budgetMin', async () => {
    const dto = Object.assign(new CreateTaskDto(), validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject payload when budgetMax is not greater than budgetMin', async () => {
    const dto = Object.assign(new CreateTaskDto(), {
      ...validPayload,
      budgetMin: 25000,
      budgetMax: 10000,
    });

    const errors = await validate(dto);

    expect(constraintMessages(errors)).toContain(budgetMessage);
  });

  it('should reject payload when budgetMax equals budgetMin', async () => {
    const dto = Object.assign(new CreateTaskDto(), {
      ...validPayload,
      budgetMin: 10000,
      budgetMax: 10000,
    });

    const errors = await validate(dto);

    expect(constraintMessages(errors)).toContain(budgetMessage);
  });
});

describe('UpdateTaskDto testing', () => {
  it('should accept patch when budgetMax is greater than budgetMin', async () => {
    const dto = Object.assign(new UpdateTaskDto(), {
      budgetMin: 10000,
      budgetMax: 25000,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject patch when budgetMax is not greater than budgetMin', async () => {
    const dto = Object.assign(new UpdateTaskDto(), {
      budgetMin: 25000,
      budgetMax: 10000,
    });

    const errors = await validate(dto);

    expect(constraintMessages(errors)).toContain(budgetMessage);
  });
});
