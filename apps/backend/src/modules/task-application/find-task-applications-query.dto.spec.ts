import { validate } from 'class-validator';
import { FindTaskApplicationsQueryDto } from '@freelance-platform/shared-dto';
import { TASK_APPLICATION_TASK_ID } from './task-application.dto.mock';

describe('FindTaskApplicationsQueryDto testing', () => {
  it('should accept empty query', async () => {
    const dto = new FindTaskApplicationsQueryDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should accept valid taskId', async () => {
    const dto = Object.assign(new FindTaskApplicationsQueryDto(), {
      taskId: TASK_APPLICATION_TASK_ID,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject invalid taskId', async () => {
    const dto = Object.assign(new FindTaskApplicationsQueryDto(), {
      taskId: 'not-a-uuid',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
