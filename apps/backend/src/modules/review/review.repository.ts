import { Injectable } from '@nestjs/common';
import { ReviewDbRow, ReviewEntity, UserReviewStats } from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';

type ReviewStatsRow = {
  target_id: string;
  reviews_count: number;
  rating: number;
};

type UserIdRow = {
  id: string;
};

@Injectable()
export class ReviewRepository {
  constructor(private readonly database: DatabaseClient) {}

  async findByTargetId(targetId: string): Promise<ReviewEntity[]> {
    const { rows } = await this.database.query<ReviewDbRow>(
      `
        SELECT
          reviews.id,
          reviews.mark,
          reviews.review,
          reviews.author_id,
          reviews.target_id,
          reviews.created_at,
          reviews.updated_at,
          author.first_name AS author_first_name,
          author.last_name AS author_last_name
        FROM reviews
        INNER JOIN users AS author ON author.id = reviews.author_id
        WHERE reviews.target_id = $1
        ORDER BY reviews.created_at DESC
      `,
      [targetId],
    );

    return rows.map((row: ReviewDbRow) => ReviewEntity.fromDb(row));
  }

  async userExists(userId: string): Promise<boolean> {
    const { rows } = await this.database.query<UserIdRow>(
      `
        SELECT id
        FROM users
        WHERE id = $1
      `,
      [userId],
    );
    const [row] = rows;

    return Boolean(row);
  }

  async findStatsByUserIds(userIds: string[]): Promise<UserReviewStats[]> {
    if (!userIds.length) {
      return [];
    }

    const { rows } = await this.database.query<ReviewStatsRow>(
      `
        SELECT
          target_id,
          COUNT(*)::int AS reviews_count,
          ROUND(AVG(mark)::numeric, 1)::float8 AS rating
        FROM reviews
        WHERE target_id = ANY($1::uuid[])
        GROUP BY target_id
      `,
      [userIds],
    );

    return rows.map((row: ReviewStatsRow) => this.toStats(row));
  }

  private toStats(row: ReviewStatsRow): UserReviewStats {
    const { target_id: userId, rating, reviews_count: reviewsCount } = row;

    return {
      userId,
      rating: Number(rating),
      reviewsCount: Number(reviewsCount),
    };
  }
}
