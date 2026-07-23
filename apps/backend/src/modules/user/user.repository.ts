import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import { CreateUserRecord, UserAuthCredentials, UserDbRow, UserEntity } from '@freelance-platform/shared-types';

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

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { rows } = await this.database.query<UserDbRow>(
      `SELECT id, email, first_name, last_name, role, bio, birthday, created_at FROM users WHERE email = $1`,
      [email],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return UserEntity.fromDb(row);
  }

  async findAuthCredentialsById(id: string): Promise<UserAuthCredentials | null> {
    const { rows } = await this.database.query<UserAuthCredentials>(
      `SELECT id, email, password_hash FROM users WHERE id = $1`,
      [id],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
    };
  }

  async create(user: CreateUserRecord): Promise<UserEntity> {
    const { email, firstName, lastName, passwordHash, role } = user;

    const { rows } = await this.database.query<UserDbRow>(
      `INSERT INTO users (email, first_name, last_name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, bio, birthday, created_at`,
      [email, firstName, lastName ?? null, passwordHash, role],
    );

    return UserEntity.fromDb(rows[0]);
  }

}
