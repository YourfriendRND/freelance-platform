import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindMyTasksQueryDto } from '@freelance-platform/shared-dto';
import { TaskStatus } from '@freelance-platform/shared-types';

function dtoFrom(payload: Record<string, unknown>): FindMyTasksQueryDto {
  return plainToInstance(FindMyTasksQueryDto, payload);
}

describe('FindMyTasksQueryDto testing', () => {
  it('should accept draft status', async () => {
    const dto = dtoFrom({ status: TaskStatus.Draft });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.status).toBe(TaskStatus.Draft);
  });

  it('should accept open and closed statuses', async () => {
    const openDto = dtoFrom({ status: TaskStatus.Open });
    const closedDto = dtoFrom({ status: TaskStatus.Closed });

    expect(await validate(openDto)).toHaveLength(0);
    expect(await validate(closedDto)).toHaveLength(0);
  });

  it('should reject an unknown status', async () => {
    const dto = dtoFrom({ status: 'archived' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should transform budget and page to numbers', async () => {
    const dto = dtoFrom({
      budgetMin: '1000',
      budgetMax: '5000',
      page: '2',
      limit: '10',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.budgetMin).toBe(1000);
    expect(dto.budgetMax).toBe(5000);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });
});
