import { TaskStatus } from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';
import { TaskCategoryRepository } from './task-category.repository';

describe('TaskCategoryRepository findPopular testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: TaskCategoryRepository;

  const categoryRow = {
    id: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
    title: 'Программирование и IT',
    description: 'Разработка сайтов, приложений, настройка серверов, консультации',
    task_count: '5',
  };

  beforeEach(() => {
    database = { query: vi.fn() };
    repository = new TaskCategoryRepository(database as unknown as DatabaseClient);
  });

  it('should return categories with open tasks ordered by count', async () => {
    database.query.mockResolvedValue({ rows: [categoryRow] });

    const result = await repository.findPopular();
    const [sql, values] = database.query.mock.calls[0];

    expect(database.query).toHaveBeenCalledTimes(1);
    expect(sql).toContain('INNER JOIN tasks AS t ON t.category_id = tc.id');
    expect(sql).toContain('WHERE t.status = $1');
    expect(sql).toContain('ORDER BY task_count DESC, tc.title ASC');
    expect(sql).toContain('LIMIT $2');
    expect(values).toEqual([TaskStatus.Open, 8]);
    expect(result).toEqual([{
      id: categoryRow.id,
      title: categoryRow.title,
      description: categoryRow.description,
      taskCount: 5,
    }]);
  });

  it('should return an empty list when there are no open tasks', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.findPopular();

    expect(result).toEqual([]);
  });
});
