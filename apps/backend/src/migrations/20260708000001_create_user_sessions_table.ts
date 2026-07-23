const UP_SQL = `
  CREATE TABLE user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token varchar(128) NOT NULL UNIQUE,
    refresh_after timestamp NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );
`;

const DOWN_SQL = `
  DROP TABLE IF EXISTS user_sessions;
`;

export const migration = {
  version: '20260710000001',
  checksum: 'b0e3a1d4c9f24b0a8d6f2c7b5a1e3f90',
  description: 'Create user sessions table',
  up: UP_SQL,
  down: DOWN_SQL,
};

