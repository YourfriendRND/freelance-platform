import { UserRole } from '@freelance-platform/shared-types';

export interface UserRdo {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
