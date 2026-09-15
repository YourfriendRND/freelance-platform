import { validate, ValidationError } from 'class-validator';
import { UpdateTaskApplicationDto } from '@freelance-platform/shared-dto';
import { TaskApplicationStatus } from '@freelance-platform/shared-types';

function constraintMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...constraintMessages(error.children ?? []),
  ]);
}

describe('UpdateTaskApplicationDto testing', () => {
  it('should accept status accept', async () => {
    const dto = Object.assign(new UpdateTaskApplicationDto(), {
      status: TaskApplicationStatus.Accept,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject unknown status', async () => {
    const dto = Object.assign(new UpdateTaskApplicationDto(), {
      status: 'unknown',
    });

    const errors = await validate(dto);

    expect(constraintMessages(errors).length).toBeGreaterThan(0);
  });
});
