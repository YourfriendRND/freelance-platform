import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client, Pool, QueryResult, QueryResultRow } from 'pg';
import { databaseConfig } from '@freelance-platform/shared-config';
import { DatabaseClient } from './database.client';

const MAINTENANCE_DATABASE = 'postgres';

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

@Injectable()
export class PgDatabaseClient
  extends DatabaseClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PgDatabaseClient.name);
  private pool!: Pool;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.ensureDatabaseExists();

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });

    await this.pool.query('SELECT 1');
    this.logger.log('PostgreSQL connection established');
  }

  private async ensureDatabaseExists(): Promise<void> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: MAINTENANCE_DATABASE,
    });

    await client.connect();

    try {
      const { rowCount } = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.config.database],
      );

      if (rowCount === 0) {
        await client.query(
          `CREATE DATABASE ${quoteIdentifier(this.config.database)} OWNER ${quoteIdentifier(
            this.config.user,
          )} ENCODING 'UTF8'`,
        );
        this.logger.log(`Database "${this.config.database}" created`);
      }
    } finally {
      await client.end();
    }
  }

  query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(sql, params);
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
    this.logger.log('PostgreSQL connection closed');
  }
}
