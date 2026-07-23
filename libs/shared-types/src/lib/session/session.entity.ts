import { Entity } from '../abstract';
import { SessionDbRow } from './session.db-row';
import { ISession } from './session';

export class SessionEntity extends Entity<ISession> {
  userId!: string;
  token!: string;
  refreshAfter!: Date;
  expiresAt!: Date;

  constructor(props?: Partial<ISession>) {
    super(props);
  }

  static fromDb(row: Partial<SessionDbRow>): SessionEntity {
    return new SessionEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.user_id !== undefined && { userId: row.user_id }),
      ...(row.token !== undefined && { token: row.token }),
      ...(row.refresh_after !== undefined && { refreshAfter: row.refresh_after }),
      ...(row.expires_at !== undefined && { expiresAt: row.expires_at }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });
  }

  toDb(): Partial<SessionDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.userId !== undefined && { user_id: this.userId }),
      ...(this.token !== undefined && { token: this.token }),
      ...(this.refreshAfter !== undefined && { refresh_after: this.refreshAfter }),
      ...(this.expiresAt !== undefined && { expires_at: this.expiresAt }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): ISession {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      userId: this.userId,
      token: this.token,
      refreshAfter: this.refreshAfter,
      expiresAt: this.expiresAt,
    };
  }
}
