import { Client } from 'pg';

export type Seed = {
  name: string;
  checksum: string;
  run: (client: Client) => Promise<void>;
};

export type SeedFile = {
  filename: string;
  seed: Seed;
};

export type AppliedSeed = {
  filename: string;
  checksum: string;
};
