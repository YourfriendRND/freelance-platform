const UP_SQL = `
  ALTER TABLE skills
    ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;

  CREATE INDEX skills_name_lower_prefix_idx ON skills (lower(name) text_pattern_ops);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS skills_name_lower_prefix_idx;
  ALTER TABLE skills DROP COLUMN IF EXISTS created_by;
`;

export const migration = {
  version: '20261116000001',
  checksum: 'b7e2c4a91d6f48e0a3c5b8d1f0e7a264',
  description: 'Add skills name prefix index and created_by',
  up: UP_SQL,
  down: DOWN_SQL,
};
