import { UserRole } from '../user/user-role';

export type CreateUserRequest = {
  role: UserRole;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
};
