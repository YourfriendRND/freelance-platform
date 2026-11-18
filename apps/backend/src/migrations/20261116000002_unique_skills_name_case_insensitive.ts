const UP_SQL = `
  ALTER TABLE skills DROP CONSTRAINT unique_skills_name;
  CREATE UNIQUE INDEX unique_skills_name_lower ON skills (lower(name));
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS unique_skills_name_lower;
  ALTER TABLE skills ADD CONSTRAINT unique_skills_name UNIQUE (name);
`;

export const migration = {
  version: '20261116000002',
  checksum: 'f4b8c2e71a6d49c0b3e5a8d1c7046f90',
  description: 'Match skill names case-insensitively',
  up: UP_SQL,
  down: DOWN_SQL,
};
