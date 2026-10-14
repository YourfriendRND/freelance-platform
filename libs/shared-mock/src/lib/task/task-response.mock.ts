import {
  TaskExecutionType,
  TaskListResponse,
  TaskResponse,
  TaskStatus,
  UserRole,
} from '@freelance-platform/shared-types';
import { MOCK_USER_CREATED_AT, MOCK_USER_EMAIL, MOCK_USER_ID_CLIENT } from '../user/user-response.mock';
import { MOCK_TASK_CATEGORY_ID } from './task-category.mock';

export const MOCK_TASK_ID = '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01';
export const MOCK_TASK_CREATED_AT = '2026-08-20T09:00:00.000Z';
export const MOCK_TASK_UPDATED_AT = '2026-08-20T09:00:00.000Z';

type MockTaskResponseOverrides = Partial<TaskResponse>;

export function createMockTaskResponse(
  overrides: MockTaskResponseOverrides = {},
): TaskResponse {
  return {
    id: MOCK_TASK_ID,
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    customerId: MOCK_USER_ID_CLIENT,
    categoryId: MOCK_TASK_CATEGORY_ID,
    createdAt: MOCK_TASK_CREATED_AT,
    updatedAt: MOCK_TASK_UPDATED_AT,
    applicationsCount: 0,
    viewsCount: 0,
    author: {
      id: MOCK_USER_ID_CLIENT,
      email: MOCK_USER_EMAIL,
      firstName: 'Иван',
      lastName: 'Петров',
      role: UserRole.Client,
      createdAt: MOCK_USER_CREATED_AT,
      rating: 0,
      reviewsCount: 0,
    },
    ...overrides,
  };
}

export const mockTaskResponse = createMockTaskResponse();

type MockTaskListResponseOverrides = Partial<TaskListResponse>;

export function createMockTaskListResponse(
  overrides: MockTaskListResponseOverrides = {},
): TaskListResponse {
  const items = overrides.items ?? [mockTaskResponse];

  return {
    items,
    total: items.length,
    page: 1,
    limit: 20,
    ...overrides,
  };
}
