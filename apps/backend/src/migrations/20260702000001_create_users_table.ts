const UP_SQL = `
  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar NOT NULL UNIQUE,
    first_name varchar NOT NULL,
    last_name varchar,
    password_hash varchar NOT NULL,
    role varchar NOT NULL,
    bio text,
    birthday date,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    deleted_at timestamp
  );
`;

const DOWN_SQL = `
  DROP TABLE IF EXISTS users;
`;

export const migration = {
  version: '20260702000001',
  checksum: '8f3c1a9e2b7d4f6c0a5e8b1d3c7f9a2',
  description: 'Create users table',
  up: UP_SQL,
  down: DOWN_SQL,
};
