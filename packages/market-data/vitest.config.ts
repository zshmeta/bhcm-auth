import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests from the tests directory
    include: ['tests/**/*.test.ts'],

    // Exclude integration tests by default (require running service)
    exclude: [
      'tests/routes.test.ts',           // Requires running HTTP server
      'tests/binance.collector.test.ts', // Requires network connection to Binance
      'tests/api/**/*.test.ts',          // API integration tests
    ],

    // Environment
    environment: 'node',

    // Globals (describe, it, expect without imports)
    globals: true,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/types/**'],
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
