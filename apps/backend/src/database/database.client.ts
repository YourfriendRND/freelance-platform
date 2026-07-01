import { QueryResult, QueryResultRow } from 'pg';

export abstract class DatabaseClient {
  abstract query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<R>>;

  abstract disconnect(): Promise<void>;
}
