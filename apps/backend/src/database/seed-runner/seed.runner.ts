import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { Client } from 'pg';
import {
  DatabaseConfig,
  loadDatabaseConfig,
} from '@freelance-platform/shared-config';
import { AppliedSeed, SeedFile } from './seed.types';
import { CREATE_SCHEMA_SEEDS_TABLE_SQL } from './schema-seeds.table';

const SEEDS_TABLE = 'schema_seeds';
const DATABASE_NOT_FOUND_CODE = '3D000';
const SCHEMA_SEEDS_REQUIRED_MESSAGE =
  'Table "schema_seeds" does not exist. Run "yarn seed:init" first to create the base seeds table.';

export class SeedRunner {
  private readonly seedsDir: string;

  constructor(seedsDir: string) {
    this.seedsDir = seedsDir;
  }

  async init(): Promise<void> {
    const config = loadDatabaseConfig();
    const client = await this.connect(config);

    try {
      const tableExists = await this.schemaSeedsTableExists(client);

      if (tableExists) {
        console.log('Seeds table already initialized.');
        return;
      }

      await client.query(CREATE_SCHEMA_SEEDS_TABLE_SQL);
      console.log('Table "schema_seeds" created successfully.');
    } finally {
      await client.end();
    }
  }

  async seed(): Promise<void> {
    const config = loadDatabaseConfig();
    const client = await this.connect(config);

    try {
      await this.ensureSchemaSeedsTableExists(client);

      const seedFiles = await this.loadSeedFiles();
      const appliedSeeds = await this.getAppliedSeeds(client);

      this.verifyAppliedSeeds(seedFiles, appliedSeeds);

      const pendingSeeds = seedFiles.filter(
        (file) =>
          !appliedSeeds.some((applied) => applied.filename === file.filename),
      );

      if (pendingSeeds.length === 0) {
        console.log('No pending seeds.');
        return;
      }

      for (const file of pendingSeeds) {
        await this.runSeed(client, file);
        console.log(`Applied seed ${file.seed.name} (${file.filename})`);
      }

      console.log(`Successfully applied ${pendingSeeds.length} seed(s).`);
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

  private async loadSeedFiles(): Promise<SeedFile[]> {
    const filenames = readdirSync(this.seedsDir)
      .filter((name) => name.endsWith('.ts'))
      .sort();

    const files: SeedFile[] = [];

    for (const filename of filenames) {
      const modulePath = join(this.seedsDir, filename);
      const module = await import(pathToFileURL(modulePath).href);

      if (!module.seed) {
        throw new Error(
          `Seed file "${filename}" must export a "seed" object.`,
        );
      }

      files.push({ filename, seed: module.seed });
    }

    return files;
  }

  private async ensureSchemaSeedsTableExists(client: Client): Promise<void> {
    const tableExists = await this.schemaSeedsTableExists(client);

    if (!tableExists) {
      throw new Error(SCHEMA_SEEDS_REQUIRED_MESSAGE);
    }
  }

  private async getAppliedSeeds(client: Client): Promise<AppliedSeed[]> {
    const result = await client.query<AppliedSeed>(
      `SELECT filename, checksum FROM ${SEEDS_TABLE} ORDER BY filename ASC`,
    );

    return result.rows;
  }

  private async schemaSeedsTableExists(client: Client): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists`,
      [SEEDS_TABLE],
    );

    const [row] = result.rows;

    return row?.exists ?? false;
  }

  private verifyAppliedSeeds(
    seedFiles: SeedFile[],
    appliedSeeds: AppliedSeed[],
  ): void {
    for (const applied of appliedSeeds) {
      const file = seedFiles.find((item) => item.filename === applied.filename);

      if (!file) {
        throw new Error(
          `Applied seed "${applied.filename}" is missing from seeds directory.`,
        );
      }

      if (file.seed.checksum !== applied.checksum) {
        throw new Error(
          `Checksum mismatch for seed "${applied.filename}". ` +
            `Expected "${applied.checksum}", got "${file.seed.checksum}". ` +
            'Applied seeds must not be modified.',
        );
      }
    }
  }

  private async runSeed(client: Client, file: SeedFile): Promise<void> {
    await client.query('BEGIN');

    try {
      await file.seed.run(client);
      await client.query(
        `INSERT INTO ${SEEDS_TABLE} (filename, checksum, name)
         VALUES ($1, $2, $3)`,
        [file.filename, file.seed.checksum, file.seed.name],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
}
