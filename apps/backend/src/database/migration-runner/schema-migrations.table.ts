export const CREATE_SCHEMA_MIGRATIONS_TABLE_SQL = `
  CREATE TABLE schema_migrations (
    id serial PRIMARY KEY,
    version varchar UNIQUE NOT NULL,
    filename varchar NOT NULL,
    checksum varchar NOT NULL,
    description text,
    executed_at timestamp NOT NULL DEFAULT now()
  );
`;

export const DROP_SCHEMA_MIGRATIONS_TABLE_SQL = `
  DROP TABLE IF EXISTS schema_migrations;
`;
