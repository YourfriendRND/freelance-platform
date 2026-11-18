const UP_SQL = `
  ALTER TABLE skills
    ADD CONSTRAINT skills_name_length_check
    CHECK (char_length(btrim(name)) BETWEEN 1 AND 50);
`;

const DOWN_SQL = `
  ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_name_length_check;
`;

export const migration = {
  version: '20261116000003',
  checksum: 'a6d1e8c34b7f42a09c5e1b8d4f7036e2',
  description: 'Check skill name length after trim',
  up: UP_SQL,
  down: DOWN_SQL,
};
