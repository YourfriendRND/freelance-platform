import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewEntity, ReviewStats, UserReviewStats } from '@freelance-platform/shared-types';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async findByTargetId(targetId: string): Promise<ReviewEntity[]> {
    const exists = await this.reviewRepository.userExists(targetId);

    if (!exists) {
      throw new NotFoundException(`Пользователь с "${targetId}" не найден`);
    }

    return this.reviewRepository.findByTargetId(targetId);
  }

  async getStats(userId: string): Promise<ReviewStats> {
    const [stats] = await this.getStatsByUserIds([userId]);
    const { rating, reviewsCount } = stats ?? { rating: 0, reviewsCount: 0 };

    return { rating, reviewsCount };
  }

  // Рейтинг пачкой для списков, где он виден у каждого человека: отклики на странице задачи и ожидающие отклики в аналитике заказчика. Один запрос на набор id. Нет строки => 0
  async getStatsByUserIds(userIds: string[]): Promise<UserReviewStats[]> {
    const uniqueIds = [...new Set(userIds)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const found = await this.reviewRepository.findStatsByUserIds(uniqueIds);
    const foundByUserId = new Map(found.map((item) => [item.userId, item]));

    return uniqueIds.map((userId) => {
      const current = foundByUserId.get(userId);

      return current ?? { userId, rating: 0, reviewsCount: 0 };
    });
  }
}
