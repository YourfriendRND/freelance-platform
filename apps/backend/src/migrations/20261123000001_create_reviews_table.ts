const UP_SQL = `
  CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mark integer NOT NULL CHECK (mark BETWEEN 1 AND 5),
    review text NOT NULL,
    author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CHECK (author_id <> target_id)
  );

  ALTER TABLE reviews ADD CONSTRAINT unique_review_author_target UNIQUE (author_id, target_id);
  CREATE INDEX reviews_target_id_idx ON reviews (target_id);
  CREATE INDEX reviews_author_id_idx ON reviews (author_id);
`;

const DOWN_SQL = `
  DROP INDEX IF EXISTS reviews_author_id_idx;
  DROP INDEX IF EXISTS reviews_target_id_idx;
  ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_author_target;
  DROP TABLE IF EXISTS reviews;
`;

export const migration = {
  version: '20261123000001',
  checksum: 'c3a91e7b4d2f48a0b6e5c1d8f7043a92',
  description: 'Create reviews table',
  up: UP_SQL,
  down: DOWN_SQL,
};
