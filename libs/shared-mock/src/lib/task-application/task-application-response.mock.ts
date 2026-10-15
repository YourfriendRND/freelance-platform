import {
  TaskApplicationResponse,
  TaskApplicationStatus,
} from '@freelance-platform/shared-types';
import { MOCK_USER_ID_FREELANCER, mockFreelancerUserResponse } from '../user/user-response.mock';
import { MOCK_TASK_ID } from '../task/task-response.mock';

export const MOCK_TASK_APPLICATION_ID = 'b4252672-a116-41ee-b78c-d694b236db32';
export const MOCK_TASK_APPLICATION_CREATED_AT = '2026-09-14T12:00:00.000Z';

type MockTaskApplicationResponseOverrides = Partial<TaskApplicationResponse>;

export function createMockTaskApplicationResponse(
  overrides: MockTaskApplicationResponseOverrides = {},
): TaskApplicationResponse {
  return {
    id: MOCK_TASK_APPLICATION_ID,
    taskId: MOCK_TASK_ID,
    performerId: MOCK_USER_ID_FREELANCER,
    proposedPrice: 2500,
    message: 'Готов выполнить задачу в указанные сроки и рассказать о подходе',
    timeline: '2 недели',
    status: TaskApplicationStatus.Pending,
    createdAt: MOCK_TASK_APPLICATION_CREATED_AT,
    updatedAt: MOCK_TASK_APPLICATION_CREATED_AT,
    user: mockFreelancerUserResponse,
    ...overrides,
  };
}

export const mockTaskApplicationResponse = createMockTaskApplicationResponse();
