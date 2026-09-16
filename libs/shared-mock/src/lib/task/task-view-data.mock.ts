import {
  TaskExecutionType,
  TaskStatus,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { mockAuthorUserResponse } from '../user/user-response.mock';

export const MOCK_TASK_VIEW_ID = '58ba88f8-0336-41a3-84de-38fce101c289';
export const MOCK_TASK_VIEW_CREATED_AT = '2026-05-29T12:00:00.000Z';

type MockTaskViewDataOverrides = Partial<TaskViewData>;

export function createMockTaskViewData(
  overrides: MockTaskViewDataOverrides = {},
): TaskViewData {
  return {
    id: MOCK_TASK_VIEW_ID,
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    createdAt: MOCK_TASK_VIEW_CREATED_AT,
    categoryTitle: 'Программирование и IT',
    applicationsCount: 0,
    viewsCount: 0,
    author: null,
    ...overrides,
  };
}

export const mockTaskViewData = createMockTaskViewData();

export function createMockTaskViewDataWithAuthor(
  overrides: MockTaskViewDataOverrides = {},
): TaskViewData {
  return createMockTaskViewData({
    author: mockAuthorUserResponse,
    ...overrides,
  });
}
