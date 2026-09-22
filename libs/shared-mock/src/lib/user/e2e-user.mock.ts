import { CreateUserRequest, UserRole } from '@freelance-platform/shared-types';

export const E2E_USER_PASSWORD = 'securePassword123';

export function uniqueEmail(label: string): string {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

type CreateE2eUserOptions = Partial<CreateUserRequest> & {
  label?: string;
};

export function createE2eUser(
  options: CreateE2eUserOptions = {},
): CreateUserRequest {
  const { label = 'user', ...overrides } = options;

  return {
    role: UserRole.Client,
    firstName: 'E2E',
    lastName: 'Тестов',
    email: uniqueEmail(label),
    password: E2E_USER_PASSWORD,
    ...overrides,
  };
}
