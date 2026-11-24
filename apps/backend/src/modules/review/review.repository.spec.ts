import { DatabaseClient } from '../../database/database.client';
import { ReviewRepository } from './review.repository';

describe('ReviewRepository testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: ReviewRepository;

  const clientId = '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2';
  const freelancerId = '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101';
  const createdAt = new Date('2026-11-23T10:00:00.000Z');
  const updatedAt = new Date('2026-11-23T10:05:00.000Z');

  beforeEach(() => {
    database = { query: vi.fn() };
    repository = new ReviewRepository(database as unknown as DatabaseClient);
  });

  it('should read reviews about a user from newest to oldest', async () => {
    database.query.mockResolvedValue({
      rows: [
        {
          id: '4f6a2c18-1b7e-4d90-8c3a-6e5b9d2f7011',
          mark: 5,
          review: 'Сдал работу в срок',
          author_id: clientId,
          target_id: freelancerId,
          created_at: createdAt,
          updated_at: updatedAt,
          author_first_name: 'Иван',
          author_last_name: null,
        },
      ],
    });

    const [review] = await repository.findByTargetId(freelancerId);
    const [sql, values] = database.query.mock.calls[0];

    expect(sql).toContain('FROM reviews');
    expect(sql).toContain('INNER JOIN users AS author ON author.id = reviews.author_id');
    expect(sql).toContain('WHERE reviews.target_id = $1');
    expect(sql).toContain('ORDER BY reviews.created_at DESC');
    expect(values).toEqual([freelancerId]);
    expect(review?.mark).toBe(5);
    expect(review?.authorId).toBe(clientId);
    expect(review?.targetId).toBe(freelancerId);
    expect(review?.author).toMatchObject({ id: clientId, firstName: 'Иван', lastName: '' });
  });

  it('should return an empty list when the user has no reviews', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.findByTargetId(freelancerId);

    expect(result).toEqual([]);
  });

  it('should detect an existing user', async () => {
    database.query.mockResolvedValue({ rows: [{ id: clientId }] });

    const exists = await repository.userExists(clientId);
    const [sql, values] = database.query.mock.calls[0];

    expect(sql).toContain('FROM users');
    expect(sql).toContain('WHERE id = $1');
    expect(values).toEqual([clientId]);
    expect(exists).toBe(true);
  });

  it('should report a missing user', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const exists = await repository.userExists(clientId);

    expect(exists).toBe(false);
  });

  it('should map a separate average for the freelancer and the client', async () => {
    database.query.mockResolvedValue({
      rows: [
        { target_id: freelancerId, reviews_count: 1, rating: 3 },
        { target_id: clientId, reviews_count: 2, rating: 4.5 },
      ],
    });

    const result = await repository.findStatsByUserIds([freelancerId, clientId]);
    const [sql, values] = database.query.mock.calls[0];

    expect(sql).toContain('target_id = ANY($1::uuid[])');
    expect(sql).toContain('ROUND(AVG(mark)::numeric, 1)::float8 AS rating');
    expect(sql).toContain('COUNT(*)::int AS reviews_count');
    expect(values).toEqual([[freelancerId, clientId]]);
    expect(result).toEqual([
      { userId: freelancerId, rating: 3, reviewsCount: 1 },
      { userId: clientId, rating: 4.5, reviewsCount: 2 },
    ]);
  });

  it('should skip the query when there are no user ids', async () => {
    const result = await repository.findStatsByUserIds([]);

    expect(result).toEqual([]);
    expect(database.query).not.toHaveBeenCalled();
  });
});
