import { Injectable } from '@nestjs/common';
import { SKILL_SUGGESTION_LIMIT, UserSkill } from '@freelance-platform/shared-types';
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

  async findSuggestions(query: string): Promise<UserSkill[]> {
    const exact = await this.database.query<UserSkillRow>(
      `
        SELECT id, name
        FROM skills
        WHERE lower(name) = lower($1)
        LIMIT 1
      `,
      [query],
    );
    const [exactRow] = exact.rows;

    if (exactRow) {
      return [{ id: exactRow.id, name: exactRow.name }];
    }

    const { rows } = await this.database.query<UserSkillRow>(
      `
        SELECT id, name
        FROM skills
        WHERE lower(name) LIKE lower($1) || '%' ESCAPE '\\'
        ORDER BY lower(name) ASC, name ASC
        LIMIT $2
      `,
      [this.escapeLike(query), SKILL_SUGGESTION_LIMIT],
    );

    return rows.map((row: UserSkillRow) => ({
      id: row.id,
      name: row.name,
    }));
  }

  async replaceForUser(userId: string, names: string[]): Promise<UserSkill[]> {
    const { rows } = await this.database.query<UserSkillRow>(
      `
        WITH removed AS (
          -- Удаляем текущие связи пользователя
          DELETE FROM user_skills
          WHERE user_id = $1
          RETURNING user_id
        ),
        incoming AS (
          -- Нумерация названий задает позицию в наборе
          SELECT name, ordinality::integer AS position
          FROM unnest($2::text[]) WITH ORDINALITY AS item(name, ordinality)
        ),
        upserted AS (
          -- Новое название создаем, существующее не переписываем
          INSERT INTO skills (name, created_by)
          SELECT incoming.name, $1
          FROM incoming
          ON CONFLICT ((lower(name))) DO UPDATE
            SET updated_at = skills.updated_at
          RETURNING id, name
        ),
        linked AS (
          -- PostgreSQL выполняет DELETE из removed только если на него есть ссылка
          -- Условие всегда истинно и нужно, чтобы старые связи удалились до вставки:
          -- иначе повтор той же позиции упрется в уникальный ключ
          INSERT INTO user_skills (user_id, skill_id, position)
          SELECT $1, upserted.id, incoming.position
          FROM incoming
          INNER JOIN upserted ON lower(upserted.name) = lower(incoming.name)
          WHERE (SELECT count(*) FROM removed) >= 0
          RETURNING skill_id, position
        )
        -- Возвращаем сохраненные названия в исходном порядке
        SELECT upserted.id, upserted.name
        FROM linked
        INNER JOIN upserted ON upserted.id = linked.skill_id
        ORDER BY linked.position ASC
      `,
      [userId, names],
    );

    return rows.map((row: UserSkillRow) => ({
      id: row.id,
      name: row.name,
    }));
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
  }
}
