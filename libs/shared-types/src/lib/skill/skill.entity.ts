import { Entity } from '../abstract';
import { ISkill } from './skill';
import { SkillDbRow } from './skill.db-row';

export class SkillEntity extends Entity<ISkill> {
  name!: string;

  constructor(props?: Partial<ISkill>) {
    super(props);
  }

  static fromDb(row: Partial<SkillDbRow>): SkillEntity {
    return new SkillEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.name !== undefined && { name: row.name }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });
  }

  toDb(): Partial<SkillDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.name !== undefined && { name: this.name }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): ISkill {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
    };
  }
}
