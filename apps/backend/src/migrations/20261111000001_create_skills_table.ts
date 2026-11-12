const UP_SQL = `
  CREATE TABLE skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );

  ALTER TABLE skills ADD CONSTRAINT unique_skills_name UNIQUE (name);
`;

const DOWN_SQL = `
  ALTER TABLE skills DROP CONSTRAINT IF EXISTS unique_skills_name;
  DROP TABLE IF EXISTS skills;
`;

export const migration = {
  version: '20261111000001',
  checksum: 'd8b3f6c9e2a14d7b0f4c8e3a9b2d6157',
  description: 'Create skills table',
  up: UP_SQL,
  down: DOWN_SQL,
};
