import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import {
  CreateUserRecord,
  UpdateUserRecord,
  UserAuthCredentials,
  UserDbRow,
  UserEntity,
} from '@freelance-platform/shared-types';

const USER_UPDATE_COLUMNS = {
  firstName: 'first_name',
  lastName: 'last_name',
  bio: 'bio',
  birthday: 'birthday',
  rate: 'rate',
} as const;

type UserUpdateField = keyof typeof USER_UPDATE_COLUMNS;

const USER_RETURNING_COLUMNS = `
  id,
  email,
  first_name,
  last_name,
  role,
  bio,
  birthday,
  rate,
  created_at
`;

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const { rows } = await this.database.query<UserDbRow>(
      `
        SELECT ${USER_RETURNING_COLUMNS}
        FROM users
        WHERE id = $1
      `,
      [id],
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return UserEntity.fromDb(row);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { rows } = await this.database.query<UserDbRow>(
      `
        SELECT ${USER_RETURNING_COLUMNS}
        FROM users
        WHERE email = $1
      `,
      [email],
    );

    const [row] = rows;

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
      `
        INSERT INTO users (email, first_name, last_name, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${USER_RETURNING_COLUMNS}
      `,
      [email, firstName, lastName ?? null, passwordHash, role],
    );

    const [row] = rows;

    return UserEntity.fromDb(row);
  }

  async update(id: string, patch: UpdateUserRecord): Promise<UserEntity | null> {
    const assignments: string[] = [];
    const values: unknown[] = [];

    for (const [field, column] of Object.entries(USER_UPDATE_COLUMNS)) {
      const value = patch[field as UserUpdateField];

      if (value === undefined) {
        continue;
      }

      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }

    if (assignments.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const { rows } = await this.database.query<UserDbRow>(
      `
        UPDATE users
        SET ${assignments.join(', ')}, updated_at = now()
        WHERE id = $${values.length}
        RETURNING ${USER_RETURNING_COLUMNS}
      `,
      values,
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return UserEntity.fromDb(row);
  }

}
