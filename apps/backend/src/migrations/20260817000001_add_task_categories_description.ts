const UP_SQL = `
  ALTER TABLE task_categories
    ADD COLUMN description text NOT NULL DEFAULT '';
`;

const DOWN_SQL = `
  ALTER TABLE task_categories
    DROP COLUMN description;
`;

export const migration = {
  version: '20260817000001',
  checksum: 'b3d6a1c8e4f72b9d0a5c8e1f6b4d9a20',
  description: 'Add description column to task_categories',
  up: UP_SQL,
  down: DOWN_SQL,
};
