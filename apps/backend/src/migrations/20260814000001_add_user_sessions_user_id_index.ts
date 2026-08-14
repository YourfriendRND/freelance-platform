const UP_SQL = `
  CREATE INDEX user_sessions_user_id_idx ON user_sessions (user_id);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS user_sessions_user_id_idx;
`;

export const migration = {
  version: '20260814000001',
  checksum: 'c4a8e2f1b7d93a5c6e0f8b2d4a1c7e90',
  description: 'Add index on user_sessions.user_id',
  up: UP_SQL,
  down: DOWN_SQL,
};
