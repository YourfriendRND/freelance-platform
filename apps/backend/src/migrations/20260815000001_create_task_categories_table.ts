const UP_SQL = `
  CREATE TABLE task_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar NOT NULL UNIQUE,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );
`;

const DOWN_SQL = `
  DROP TABLE IF EXISTS task_categories;
`;

export const migration = {
  version: '20260815000001',
  checksum: 'a7c2e9f4b1d83e5a6c0f2b8d4e1a9c70',
  description: 'Create task_categories table',
  up: UP_SQL,
  down: DOWN_SQL,
};
