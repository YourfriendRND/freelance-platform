import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { Client } from 'pg';
import {
  DatabaseConfig,
  loadDatabaseConfig,
} from '@freelance-platform/shared-config';
import {
  AppliedMigration,
  MigrationFile,
} from './migration.types';
import { CREATE_SCHEMA_MIGRATIONS_TABLE_SQL } from './schema-migrations.table';

const MIGRATIONS_TABLE = 'schema_migrations';
const DATABASE_NOT_FOUND_CODE = '3D000';
const SCHEMA_MIGRATIONS_REQUIRED_MESSAGE =
  'Table "schema_migrations" does not exist. Run "yarn migrate:init" first to create the base migrations table.';

export class MigrationRunner {
  private readonly migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
  }

  async init(): Promise<void> {
    const config = loadDatabaseConfig();
    const client = await this.connect(config);

    try {
      const tableExists = await this.schemaMigrationsTableExists(client);

      if (tableExists) {
        console.log('Migrations table already initialized.');
        return;
      }

      await client.query(CREATE_SCHEMA_MIGRATIONS_TABLE_SQL);
      console.log('Table "schema_migrations" created successfully.');
    } finally {
      await client.end();
    }
  }

  async migrate(): Promise<void> {
    const config = loadDatabaseConfig();
    const client = await this.connect(config);

    try {
      await this.ensureSchemaMigrationsTableExists(client);

      const migrationFiles = await this.loadMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations(client);

      this.verifyAppliedMigrations(migrationFiles, appliedMigrations);

      const pendingMigrations = migrationFiles.filter(
        (file) =>
          !appliedMigrations.some(
            (applied) => applied.version === file.migration.version,
          ),
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations.');
        return;
      }

      for (const file of pendingMigrations) {
        await this.runMigrationUp(client, file);
        console.log(
          `Applied migration ${file.migration.version} (${file.filename})`,
        );
      }

      console.log(`Successfully applied ${pendingMigrations.length} migration(s).`);
    } finally {
      await client.end();
    }
  }

  async rollback(): Promise<void> {
    const config = loadDatabaseConfig();
    const client = await this.connect(config);

    try {
      await this.ensureSchemaMigrationsTableExists(client);

      const migrationFiles = await this.loadMigrationFiles();
      const lastApplied = await this.getLastAppliedMigration(client);

      if (!lastApplied) {
        console.log('No migrations to rollback.');
        return;
      }

      const file = migrationFiles.find(
        (item) => item.migration.version === lastApplied.version,
      );

      if (!file) {
        throw new Error(
          `Migration file for version "${lastApplied.version}" not found.`,
        );
      }

      if (!file.migration.down) {
        throw new Error(
          `Migration "${file.migration.version}" does not define a rollback (down).`,
        );
      }

      await this.runMigrationDown(client, file);
      console.log(
        `Rolled back migration ${file.migration.version} (${file.filename})`,
      );
    } finally {
      await client.end();
    }
  }

  private async connect(config: DatabaseConfig): Promise<Client> {
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    try {
      await client.connect();
      return client;
    } catch (error) {
      if (this.isDatabaseNotFoundError(error)) {
        throw new Error(
          `Database "${config.database}" does not exist. You need to create database at first.`,
        );
      }

      throw error;
    }
  }

  private isDatabaseNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === DATABASE_NOT_FOUND_CODE
    );
  }

  private async loadMigrationFiles(): Promise<MigrationFile[]> {
    const filenames = readdirSync(this.migrationsDir)
      .filter((name) => name.endsWith('.ts'))
      .sort();

    const files: MigrationFile[] = [];

    for (const filename of filenames) {
      const modulePath = join(this.migrationsDir, filename);
      const module = await import(pathToFileURL(modulePath).href);

      if (!module.migration) {
        throw new Error(
          `Migration file "${filename}" must export a "migration" object.`,
        );
      }

      files.push({ filename, migration: module.migration });
    }

    return files.sort((a, b) =>
      a.migration.version.localeCompare(b.migration.version),
    );
  }

  private async ensureSchemaMigrationsTableExists(client: Client): Promise<void> {
    const tableExists = await this.schemaMigrationsTableExists(client);

    if (!tableExists) {
      throw new Error(SCHEMA_MIGRATIONS_REQUIRED_MESSAGE);
    }
  }

  private async getAppliedMigrations(
    client: Client,
  ): Promise<AppliedMigration[]> {
    const result = await client.query<AppliedMigration>(
      `SELECT version, filename, checksum FROM ${MIGRATIONS_TABLE} ORDER BY version ASC`,
    );

    return result.rows;
  }

  private async getLastAppliedMigration(
    client: Client,
  ): Promise<AppliedMigration | null> {
    const result = await client.query<AppliedMigration>(
      `SELECT version, filename, checksum FROM ${MIGRATIONS_TABLE} ORDER BY version DESC LIMIT 1`,
    );

    return result.rows[0] ?? null;
  }

  private async schemaMigrationsTableExists(client: Client): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists`,
      [MIGRATIONS_TABLE],
    );

    return result.rows[0]?.exists ?? false;
  }

  private verifyAppliedMigrations(
    migrationFiles: MigrationFile[],
    appliedMigrations: AppliedMigration[],
  ): void {
    for (const applied of appliedMigrations) {
      const file = migrationFiles.find(
        (item) => item.migration.version === applied.version,
      );

      if (!file) {
        throw new Error(
          `Applied migration "${applied.version}" is missing from migrations directory.`,
        );
      }

      if (file.migration.checksum !== applied.checksum) {
        throw new Error(
          `Checksum mismatch for migration "${applied.version}". ` +
            `Expected "${applied.checksum}", got "${file.migration.checksum}". ` +
            'Applied migrations must not be modified.',
        );
      }
    }
  }

  private async runMigrationUp(
    client: Client,
    file: MigrationFile,
  ): Promise<void> {
    await client.query('BEGIN');

    try {
      await client.query(file.migration.up);
      await client.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (version, filename, checksum, description)
         VALUES ($1, $2, $3, $4)`,
        [
          file.migration.version,
          file.filename,
          file.migration.checksum,
          file.migration.description,
        ],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  private async runMigrationDown(
    client: Client,
    file: MigrationFile,
  ): Promise<void> {
    await client.query('BEGIN');

    try {
      await client.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`, [
        file.migration.version,
      ]);
      await client.query(file.migration.down!);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
}
