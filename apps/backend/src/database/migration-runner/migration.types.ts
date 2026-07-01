export interface Migration {
  version: string;
  checksum: string;
  description: string;
  up: string;
  down?: string;
}

export interface MigrationFile {
  filename: string;
  migration: Migration;
}

export interface AppliedMigration {
  version: string;
  filename: string;
  checksum: string;
}
