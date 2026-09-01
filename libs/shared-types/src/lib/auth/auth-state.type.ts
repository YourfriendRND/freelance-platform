import { UserResponse } from './auth-client.type';

export type AuthState = {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  isSessionResolved: boolean;
};
