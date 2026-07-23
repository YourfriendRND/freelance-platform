import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import { SessionDbRow, SessionEntity } from '@freelance-platform/shared-types';

type CreateSession = {
  userId: string;
  expiresAt: Date;
  refreshAfter: Date;
  token: string;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly database: DatabaseClient) {}

  async createSession(dto: CreateSession) {
    const { userId, token, expiresAt, refreshAfter } = dto;
    const { rows } = await this.database.query<SessionDbRow>(
      `
        INSERT INTO user_sessions (user_id, token, refresh_after, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, token, user_id, refresh_after, expires_at, created_at, updated_at
      `,
      [userId, token, refreshAfter, expiresAt],
    );

    return SessionEntity.fromDb(rows[0]);
  }

  async findByIdAndToken(sessionId: string, token: string): Promise<SessionEntity | null> {
    const { rows } = await this.database.query<SessionDbRow>(
      `
        SELECT id, token, user_id, refresh_after, expires_at, created_at, updated_at
        FROM user_sessions
        WHERE id = $1 AND token = $2
      `,
      [sessionId, token],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return SessionEntity.fromDb(row);
  }

  async deleteByIdAndUserId(sessionId: string, userId: string): Promise<boolean> {
    const { rowCount } = await this.database.query(
      `
        DELETE FROM user_sessions
        WHERE id = $1 AND user_id = $2
      `,
      [sessionId, userId],
    );

    return (rowCount ?? 0) > 0;
  }
}
