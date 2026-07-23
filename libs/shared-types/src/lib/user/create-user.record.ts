import { UserRole } from './user-role';

export interface CreateUserRecord {
  email: string;
  firstName: string;
  lastName?: string;
  passwordHash: string;
  role: UserRole;
}
