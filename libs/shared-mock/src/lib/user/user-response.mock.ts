import { UserResponse, UserRole } from '@freelance-platform/shared-types';

export const MOCK_USER_ID_CLIENT = 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61';
export const MOCK_USER_ID_FREELANCER = 'c8f25b13-a2d4-5e69-b337-2d3e4f5a6b72';
export const MOCK_USER_ID_AUTHOR = '8caf25cf-d7b9-4950-a0c5-baea8505ff1d';

export const MOCK_USER_EMAIL = 'ivan.petrov@example.com';
export const MOCK_USER_CREATED_AT = '2026-08-01T00:00:00.000Z';

type MockUserResponseOverrides = Partial<UserResponse>;

export function createMockUserResponse(
  overrides: MockUserResponseOverrides = {},
): UserResponse {
  return {
    id: MOCK_USER_ID_CLIENT,
    email: MOCK_USER_EMAIL,
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: MOCK_USER_CREATED_AT,
    ...overrides,
  };
}

export const mockClientUserResponse = createMockUserResponse();

export const mockFreelancerUserResponse = createMockUserResponse({
  id: MOCK_USER_ID_FREELANCER,
  role: UserRole.Freelancer,
});

export const mockAuthorUserResponse = createMockUserResponse({
  id: MOCK_USER_ID_AUTHOR,
});
