import { IEntity } from '../abstract/entity';
import { UserRole } from './user-role';

export interface IUser extends IEntity {
  firstName: string;
  lastName?: string;
  password: string;
  email: string;
  role: UserRole;
  bio?: string;
  birthday?: Date;
}
