import { validate } from 'class-validator';
import { CreateTaskApplicationDto } from '@freelance-platform/shared-dto';
import { validCreateTaskApplicationPayload } from './task-application.dto.mock';

describe('CreateTaskApplicationDto testing', () => {
  it('should accept correct payload', async () => {
    const dto = Object.assign(new CreateTaskApplicationDto(), validCreateTaskApplicationPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should accept payload without proposedPrice', async () => {
    const dto = Object.assign(new CreateTaskApplicationDto(), {
      taskId: validCreateTaskApplicationPayload.taskId,
      message: validCreateTaskApplicationPayload.message,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject payload without taskId', async () => {
    const dto = Object.assign(new CreateTaskApplicationDto(), {
      message: validCreateTaskApplicationPayload.message,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject proposedPrice less than 1', async () => {
    const dto = Object.assign(new CreateTaskApplicationDto(), {
      ...validCreateTaskApplicationPayload,
      proposedPrice: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
