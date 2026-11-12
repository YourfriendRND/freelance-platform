import { DatabaseClient } from '../../database/database.client';
import { SkillRepository } from './skill.repository';

describe('SkillRepository findByUserId testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: SkillRepository;

  const userId = '9bbc43d8-9ba6-4425-b6fb-9cbffa4f99b2';
  const firstSkill = {
    id: '1c2a8e14-5d93-4f1b-9b27-2e5d8c01f101',
    name: 'nodejs',
  };
  const secondSkill = {
    id: '2c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
    name: 'typescript',
  };

  beforeEach(() => {
    database = { query: vi.fn() };
    repository = new SkillRepository(database as unknown as DatabaseClient);
  });

  it('should read skills in position order', async () => {
    database.query.mockResolvedValue({ rows: [firstSkill, secondSkill] });

    const result = await repository.findByUserId(userId);
    const [sql, values] = database.query.mock.calls[0];

    expect(database.query).toHaveBeenCalledTimes(1);
    expect(sql).toContain('FROM user_skills');
    expect(sql).toContain('INNER JOIN skills ON skills.id = user_skills.skill_id');
    expect(sql).toContain('WHERE user_skills.user_id = $1');
    expect(sql).toContain('ORDER BY user_skills.position ASC');
    expect(values).toEqual([userId]);
    expect(result).toEqual([
      { id: firstSkill.id, name: firstSkill.name },
      { id: secondSkill.id, name: secondSkill.name },
    ]);
  });

  it('should return an empty list when the user has no skills', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.findByUserId(userId);

    expect(result).toEqual([]);
  });
});
