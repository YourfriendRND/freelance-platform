import { Injectable } from '@nestjs/common';
import { UserSkill } from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';

type UserSkillRow = {
  id: string;
  name: string;
};

@Injectable()
export class SkillRepository {
  constructor(private readonly database: DatabaseClient) {}

  async findByUserId(userId: string): Promise<UserSkill[]> {
    const { rows } = await this.database.query<UserSkillRow>(
      `
        SELECT skills.id, skills.name
        FROM user_skills
        INNER JOIN skills ON skills.id = user_skills.skill_id
        WHERE user_skills.user_id = $1
        ORDER BY user_skills.position ASC
      `,
      [userId],
    );

    return rows.map((row: UserSkillRow) => ({
      id: row.id,
      name: row.name,
    }));
  }
}
