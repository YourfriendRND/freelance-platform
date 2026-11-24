import { NotFoundException } from '@nestjs/common';
import { ReviewEntity } from '@freelance-platform/shared-types';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';

describe('ReviewService testing', () => {
  let repository: {
    findByTargetId: ReturnType<typeof vi.fn>;
    userExists: ReturnType<typeof vi.fn>;
    findStatsByUserIds: ReturnType<typeof vi.fn>;
  };
  let service: ReviewService;

  const clientId = '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2';
  const freelancerId = '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101';

  beforeEach(() => {
    repository = {
      findByTargetId: vi.fn(),
      userExists: vi.fn(),
      findStatsByUserIds: vi.fn(),
    };
    service = new ReviewService(repository as unknown as ReviewRepository);
  });

  it('should reject a missing user before reading reviews', async () => {
    repository.userExists.mockResolvedValue(false);

    await expect(service.findByTargetId(freelancerId)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findByTargetId).not.toHaveBeenCalled();
  });

  it('should return reviews about an existing user', async () => {
    const review = new ReviewEntity({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      mark: 5,
      review: 'Сдал работу в срок',
      authorId: clientId,
      targetId: freelancerId,
    });
    repository.userExists.mockResolvedValue(true);
    repository.findByTargetId.mockResolvedValue([review]);

    const result = await service.findByTargetId(freelancerId);

    expect(repository.findByTargetId).toHaveBeenCalledWith(freelancerId);
    expect(result).toEqual([review]);
  });

  it('should return a different average for the freelancer and the client', async () => {
    repository.findStatsByUserIds.mockResolvedValue([
      { userId: freelancerId, rating: 3, reviewsCount: 1 },
      { userId: clientId, rating: 4.5, reviewsCount: 2 },
    ]);

    const result = await service.getStatsByUserIds([freelancerId, clientId]);

    expect(repository.findStatsByUserIds).toHaveBeenCalledWith([freelancerId, clientId]);
    expect(result).toEqual([
      { userId: freelancerId, rating: 3, reviewsCount: 1 },
      { userId: clientId, rating: 4.5, reviewsCount: 2 },
    ]);
  });

  it('should return zero when the user has no reviews', async () => {
    repository.findStatsByUserIds.mockResolvedValue([]);

    const result = await service.getStats(freelancerId);

    expect(result).toEqual({ rating: 0, reviewsCount: 0 });
  });

  it('should skip the query when there are no user ids', async () => {
    const result = await service.getStatsByUserIds([]);

    expect(result).toEqual([]);
    expect(repository.findStatsByUserIds).not.toHaveBeenCalled();
  });
});
