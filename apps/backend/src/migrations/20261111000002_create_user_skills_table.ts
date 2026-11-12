const UP_SQL = `
  CREATE TABLE user_skills (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    position integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, skill_id)
  );

  ALTER TABLE user_skills ADD CONSTRAINT unique_user_skill_position UNIQUE (user_id, position);
  CREATE INDEX user_skills_skill_id_idx ON user_skills (skill_id);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS user_skills_skill_id_idx;
  ALTER TABLE user_skills DROP CONSTRAINT IF EXISTS unique_user_skill_position;
  DROP TABLE IF EXISTS user_skills;
`;

export const migration = {
  version: '20261111000002',
  checksum: 'e1c4a8d2b6f04e9c7a3d5b8f0c2e7149',
  description: 'Create user_skills table',
  up: UP_SQL,
  down: DOWN_SQL,
};
