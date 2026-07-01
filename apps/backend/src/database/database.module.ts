import { Global, Module } from '@nestjs/common';
import { DatabaseClient } from './database.client';
import { PgDatabaseClient } from './pg-database.client';

@Global()
@Module({
  providers: [
    {
      provide: DatabaseClient,
      useClass: PgDatabaseClient,
    },
  ],
  exports: [DatabaseClient],
})
export class DatabaseModule {}
