const UP_SQL = `
  CREATE TABLE task_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    performer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposed_price integer CHECK (proposed_price > 0),
    message text NOT NULL,
    status varchar NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accept', 'decline')),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );

  ALTER TABLE task_applications ADD CONSTRAINT unique_task_performer UNIQUE (task_id, performer_id);
  CREATE INDEX task_applications_task_id_idx ON task_applications (task_id);
  CREATE INDEX task_applications_performer_id_idx ON task_applications (performer_id);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS task_applications_performer_id_idx;
  DROP INDEX IF EXISTS task_applications_task_id_idx;
  ALTER TABLE task_applications DROP CONSTRAINT IF EXISTS unique_task_performer;
  DROP TABLE IF EXISTS task_applications;
`;

export const migration = {
  version: '20260911000001',
  checksum: 'ae2cbeacb49c6e46edfc58e78b0f9520',
  description: 'Create task_applications table',
  up: UP_SQL,
  down: DOWN_SQL,
};
