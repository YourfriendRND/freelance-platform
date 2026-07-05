import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import { UserDbRow, UserEntity } from '@freelance-platform/shared-types';

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const { rows } = await this.database.query<UserDbRow>(
      `SELECT id, email, first_name, last_name, role, bio, birthday, created_at FROM users WHERE id = $1`,
      [id],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return UserEntity.fromDb(row);
  }
}
