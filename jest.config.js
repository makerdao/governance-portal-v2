module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/{node_modules,coverage}/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/setup'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'test/helpers'],
  globals: {
    __TESTCHAIN__: true
  }
};
