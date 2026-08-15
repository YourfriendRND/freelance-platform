const UP_SQL = `
  CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar NOT NULL,
    description text NOT NULL,
    status varchar NOT NULL DEFAULT 'draft',
    budget_min integer NOT NULL CHECK (budget_min > 0),
    budget_max integer NOT NULL CHECK (budget_max > 0),
    execution_type varchar NOT NULL DEFAULT 'remote',
    deadline date NOT NULL,
    customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES task_categories(id) ON DELETE RESTRICT,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT tasks_budget_range_check CHECK (budget_min < budget_max)
  );

  CREATE INDEX tasks_customer_id_idx ON tasks (customer_id);
  CREATE INDEX tasks_category_id_idx ON tasks (category_id);
  CREATE INDEX tasks_status_idx ON tasks (status);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS tasks_status_idx;
  DROP INDEX IF EXISTS tasks_category_id_idx;
  DROP INDEX IF EXISTS tasks_customer_id_idx;
  DROP TABLE IF EXISTS tasks;
`;

export const migration = {
  version: '20260815000002',
  checksum: 'd3f8a1c6e2b94f0d7a5c8e1b3f6d2a90',
  description: 'Create tasks table',
  up: UP_SQL,
  down: DOWN_SQL,
};
