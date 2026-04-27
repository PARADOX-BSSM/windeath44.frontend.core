import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['verbose', ['json', { outputFile: 'logs/test-results.log' }]],
  },
});
