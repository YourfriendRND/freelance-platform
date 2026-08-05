import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@freelance-platform/shared-config': resolve(
        __dirname,
        '../../libs/shared-config/src/index.ts',
      ),
      '@freelance-platform/shared-dto': resolve(
        __dirname,
        '../../libs/shared-dto/src/index.ts',
      ),
      '@freelance-platform/shared-rdo': resolve(
        __dirname,
        '../../libs/shared-rdo/src/index.ts',
      ),
      '@freelance-platform/shared-types': resolve(
        __dirname,
        '../../libs/shared-types/src/index.ts',
      ),
    },
  },
});
