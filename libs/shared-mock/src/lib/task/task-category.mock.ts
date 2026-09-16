import { TaskCategoryResponse } from '@freelance-platform/shared-types';

export const MOCK_TASK_CATEGORY_ID = '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102';

type MockTaskCategoryResponseOverrides = Partial<TaskCategoryResponse>;

export function createMockTaskCategoryResponse(
  overrides: MockTaskCategoryResponseOverrides = {},
): TaskCategoryResponse {
  return {
    id: MOCK_TASK_CATEGORY_ID,
    title: 'Программирование и IT',
    description:
      'Разработка сайтов, приложений, настройка серверов, консультации',
    ...overrides,
  };
}

export const mockTaskCategoryResponse = createMockTaskCategoryResponse();
