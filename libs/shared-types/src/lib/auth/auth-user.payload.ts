import { UserEntity } from '../user';

export const AUTH_USER_KEY = 'authUser';

export type AuthUserPayload = {
  user: UserEntity;
  sessionId: string;
  token: string;
};
