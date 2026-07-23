import { UserEntity } from '../user';

export type SuccessLoginUser = {
  user: UserEntity;
  sessionId: string;
  token: string;
  refreshAfter: Date;
  cookieKey: string;
  oldCookieKey?: string;
};
