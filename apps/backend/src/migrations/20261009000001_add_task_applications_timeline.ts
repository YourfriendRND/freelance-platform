const UP_SQL = `
  ALTER TABLE task_applications
    ADD COLUMN timeline varchar(100) NULL;
`;

const DOWN_SQL = `
  ALTER TABLE task_applications
    DROP COLUMN timeline;
`;

export const migration = {
  version: '20261009000001',
  checksum: 'c4e8a1f09b2d47e6a3c5d8f1b7e0a294',
  description: 'Add timeline column to task_applications',
  up: UP_SQL,
  down: DOWN_SQL,
};
