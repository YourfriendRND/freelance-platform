import { ReviewRdo } from '@freelance-platform/shared-rdo';
import { ReviewEntity, UserEntity } from '@freelance-platform/shared-types';
import { fillRdo } from '../../common/fill-rdo';

describe('ReviewRdo testing', () => {
  const createdAt = new Date('2026-11-23T10:00:00.000Z');
  const authorId = '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2';

  function reviewWithAuthor(lastName?: string): ReviewEntity {
    const review = new ReviewEntity({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      mark: 5,
      review: 'Сдал работу в срок',
      authorId,
      targetId: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
      createdAt,
      updatedAt: new Date('2026-11-23T10:05:00.000Z'),
    });
    review.author = new UserEntity({
      id: authorId,
      firstName: 'Иван',
      ...(lastName !== undefined && { lastName }),
    });

    return review;
  }

  it('should expose the author name instead of the author id', () => {
    const [result] = fillRdo(ReviewRdo, [reviewWithAuthor('Иванов')]);

    expect(result).toEqual({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      mark: 5,
      review: 'Сдал работу в срок',
      author: {
        id: authorId,
        firstName: 'Иван',
        lastName: 'Иванов',
      },
      targetId: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
      createdAt,
    });
    expect(result).not.toHaveProperty('authorId');
    expect(result).not.toHaveProperty('updatedAt');
  });

  it('should return null when the author has no last name', () => {
    const [result] = fillRdo(ReviewRdo, [reviewWithAuthor()]);

    expect(result.author.lastName).toBeNull();
  });
});
