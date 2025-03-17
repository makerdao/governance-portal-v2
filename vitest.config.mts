import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 7000,
    setupFiles: ['./__tests__/setup.tsx'],
    // include: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    // include: [''],
    exclude: [
      ...configDefaults.exclude,
      'node_modules',
      'dist',
      'playwright',
      '.next',
      'setup',
      '__tests__/helpers.tsx',
      '__tests__/__mocks__',
      '__tests__/__helpers__'
    ]
    // pool: 'forks',
    // poolOptions: {
    //   forks: {
    //     singleFork: true
    //   }
    // }
  }
});
