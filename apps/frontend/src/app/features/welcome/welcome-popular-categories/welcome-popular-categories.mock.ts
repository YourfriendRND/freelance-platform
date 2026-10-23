import { PopularTaskCategory } from '@freelance-platform/shared-types';

export function createMockCategory(index: number, taskCount = index + 1): PopularTaskCategory {
  return {
    id: `category-${index}`,
    title: `Категория ${index}`,
    description: '',
    taskCount,
  };
}
