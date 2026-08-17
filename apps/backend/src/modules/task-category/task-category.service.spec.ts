import { TaskCategoryEntity } from '@freelance-platform/shared-types';

import { TaskCategoryRepository } from './task-category.repository';
import { TaskCategoryService } from './task-category.service';

describe('TaskCategoryService testing', () => {
  let taskCategoryRepository: {
    findAll: ReturnType<typeof vi.fn>;
  };
  let service: TaskCategoryService;

  const category = new TaskCategoryEntity({
    id: '1090cd0d-01ba-4cb6-a10d-01000136788e',
    title: 'Программирование и IT',
    description: 'Разработка сайтов, приложений, настройка серверов, консультации',
    createdAt: new Date('2026-08-17'),
    updatedAt: new Date('2026-08-17'),
  });

  beforeEach(() => {
    taskCategoryRepository = {
      findAll: vi.fn(),
    };

    service = new TaskCategoryService(
      taskCategoryRepository as unknown as TaskCategoryRepository,
    );
  });

  it('should return categories from repository', async () => {
    const categories = [category];
    taskCategoryRepository.findAll.mockResolvedValue(categories);

    const result = await service.findAll();

    expect(result).toBe(categories);
    expect(taskCategoryRepository.findAll).toHaveBeenCalled();
  });

  it('should return an empty list when there are no categories', async () => {
    taskCategoryRepository.findAll.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(taskCategoryRepository.findAll).toHaveBeenCalled();
  });
});
