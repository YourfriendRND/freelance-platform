import { Entity } from '../abstract';
import { UserEntity } from '../user/user.entity';
import { IReview } from './review';
import { ReviewDbRow } from './review.db-row';

export class ReviewEntity extends Entity<IReview> {
  mark!: number;
  review!: string;
  authorId!: string;
  targetId!: string;
  author?: UserEntity;

  constructor(props?: Partial<IReview>) {
    super(props);
  }

  static fromDb(row: Partial<ReviewDbRow>): ReviewEntity {
    const review = new ReviewEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.mark !== undefined && { mark: row.mark }),
      ...(row.review !== undefined && { review: row.review }),
      ...(row.author_id !== undefined && { authorId: row.author_id }),
      ...(row.target_id !== undefined && { targetId: row.target_id }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });

    if (row.author_id !== undefined && row.author_first_name !== undefined) {
      review.author = new UserEntity({
        id: row.author_id,
        firstName: row.author_first_name,
        ...(row.author_last_name != null && { lastName: row.author_last_name }),
      });
    }

    return review;
  }

  toDb(): Partial<ReviewDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.mark !== undefined && { mark: this.mark }),
      ...(this.review !== undefined && { review: this.review }),
      ...(this.authorId !== undefined && { author_id: this.authorId }),
      ...(this.targetId !== undefined && { target_id: this.targetId }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): IReview {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      mark: this.mark,
      review: this.review,
      authorId: this.authorId,
      targetId: this.targetId,
    };
  }
}
