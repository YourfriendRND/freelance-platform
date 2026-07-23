import { IEntity } from '../abstract/entity';

export interface ISession extends IEntity {
  userId: string;
  token: string;
  refreshAfter: Date;
  expiresAt: Date;
}
