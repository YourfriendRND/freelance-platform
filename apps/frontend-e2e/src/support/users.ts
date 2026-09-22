import { createE2eUser } from '@freelance-platform/shared-mock';
import { CreateUserRequest, UserRole } from '@freelance-platform/shared-types';

export { uniqueEmail } from '@freelance-platform/shared-mock';

export type RegisterUserData = CreateUserRequest;

export function createRegisterUser(
  label: string,
  role: UserRole = UserRole.Client,
): RegisterUserData {
  return createE2eUser({ label, role });
}
