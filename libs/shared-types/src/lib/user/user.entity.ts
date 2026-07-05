import { Entity } from '../abstract';
import { UserDbRow } from './user.db-row';
import { IUser } from './user';
import { UserRole } from './user-role';

export class UserEntity extends Entity<IUser> {
  firstName!: string;
  lastName?: string;
  password!: string;
  email!: string;
  role!: UserRole;
  bio?: string;
  birthday?: Date;

  constructor(props?: Partial<IUser>) {
    super(props);
  }

  static fromDb(row: Partial<UserDbRow>): UserEntity {
    return new UserEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.email !== undefined && { email: row.email }),
      ...(row.first_name !== undefined && { firstName: row.first_name }),
      ...(row.last_name !== undefined && { lastName: row.last_name ?? undefined }),
      ...(row.password_hash !== undefined && { password: row.password_hash }),
      ...(row.role !== undefined && { role: row.role as UserRole }),
      ...(row.bio !== undefined && { bio: row.bio ?? undefined }),
      ...(row.birthday !== undefined && { birthday: row.birthday ?? undefined }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
      ...(row.deleted_at !== undefined && { deletedAt: row.deleted_at }),
    });
  }

  toDb(): Partial<UserDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.email !== undefined && { email: this.email }),
      ...(this.firstName !== undefined && { first_name: this.firstName }),
      ...(this.lastName !== undefined && { last_name: this.lastName ?? null }),
      ...(this.password !== undefined && { password_hash: this.password }),
      ...(this.role !== undefined && { role: this.role }),
      ...(this.bio !== undefined && { bio: this.bio ?? null }),
      ...(this.birthday !== undefined && { birthday: this.birthday ?? null }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
      ...(this.deletedAt !== undefined && { deleted_at: this.deletedAt ?? null }),
    };
  }

  toObject(): IUser {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      email: this.email,
      role: this.role,
      bio: this.bio,
      birthday: this.birthday,
    };
  }
}
