export const CREATE_SCHEMA_SEEDS_TABLE_SQL = `
  CREATE TABLE schema_seeds (
    id serial PRIMARY KEY,
    filename varchar UNIQUE NOT NULL,
    checksum varchar NOT NULL,
    name varchar NOT NULL,
    executed_at timestamp NOT NULL DEFAULT now()
  );
`;
