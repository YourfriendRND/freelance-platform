import { ReviewEntity } from '@freelance-platform/shared-types';

describe('ReviewEntity testing', () => {
  const createdAt = new Date('2026-11-23T10:00:00.000Z');
  const updatedAt = new Date('2026-11-23T10:05:00.000Z');

  it('should map a review row to the entity and back', () => {
    const review = ReviewEntity.fromDb({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      mark: 5,
      review: 'Сдал работу в срок',
      author_id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      target_id: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
      created_at: createdAt,
      updated_at: updatedAt,
    });

    expect(review.toObject()).toEqual({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      createdAt,
      updatedAt,
      mark: 5,
      review: 'Сдал работу в срок',
      authorId: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      targetId: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
    });
    expect(review.toDb()).toEqual({
      id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
      mark: 5,
      review: 'Сдал работу в срок',
      author_id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      target_id: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
      created_at: createdAt,
      updated_at: updatedAt,
    });
    expect(review.author).toBeUndefined();
  });

  it('should attach the author name from the joined columns', () => {
    const review = ReviewEntity.fromDb({
      author_id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      author_first_name: 'Иван',
      author_last_name: 'Иванов',
    });

    expect(review.author).toMatchObject({
      id: '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2',
      firstName: 'Иван',
      lastName: 'Иванов',
    });
  });
});
