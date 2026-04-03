import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      $api: '/src/api',
      $core: '/src/core',
      $stores: '/src/stores',
      $types: '/src/types',
      $utils: '/src/utils',
      $components: '/src/components',
      $animations: '/src/animations',
      $styles: '/src/styles',
      $actions: '/src/actions',
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
