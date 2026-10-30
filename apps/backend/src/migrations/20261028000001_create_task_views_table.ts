const UP_SQL = `
  CREATE TABLE task_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );

  ALTER TABLE task_views ADD CONSTRAINT unique_user_task UNIQUE (user_id, task_id);
  CREATE INDEX task_views_user_id_idx ON task_views (user_id);
  CREATE INDEX task_views_task_id_idx ON task_views (task_id);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS task_views_task_id_idx;
  DROP INDEX IF EXISTS task_views_user_id_idx;
  ALTER TABLE task_views DROP CONSTRAINT IF EXISTS unique_user_task;
  DROP TABLE IF EXISTS task_views;
`;

export const migration = {
  version: '20261028000001',
  checksum: '7c1e9a4b6d2f48e0a5c3b8d1f7e6a094',
  description: 'Create task_views table',
  up: UP_SQL,
  down: DOWN_SQL,
};
