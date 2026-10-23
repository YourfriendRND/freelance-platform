const UP_SQL = `
  ALTER TABLE users
    ADD COLUMN rate integer NULL;
`;

const DOWN_SQL = `
  ALTER TABLE users
    DROP COLUMN IF EXISTS rate;
`;

export const migration = {
  version: '20261023000001',
  checksum: 'a91c6e4d2b8f47c0e5d3a7b1f608c2e4',
  description: 'Add rate column to users',
  up: UP_SQL,
  down: DOWN_SQL,
};
