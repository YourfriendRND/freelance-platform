import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts'],
    setupFiles: ['src/support/test-setup.ts'],
    globalSetup: ['src/support/global-setup.ts'],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@freelance-platform/shared-dto': resolve(
        __dirname,
        '../../libs/shared-dto/src/index.ts',
      ),
      '@freelance-platform/shared-types': resolve(
        __dirname,
        '../../libs/shared-types/src/index.ts',
      ),
    },
  },
});
