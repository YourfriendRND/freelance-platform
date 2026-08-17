import { IEntity } from '../abstract/entity';

export interface ITaskCategory extends IEntity {
  title: string;
  description: string;
}
