import { IEntity } from '../abstract/entity';

export interface IReview extends IEntity {
  mark: number;
  review: string;
  authorId: string;
  targetId: string;
}
