module.exports = {
  collectCoverageFrom: [
    '{components,lib,pages,stores}/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/{node_modules,coverage}/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js', 'jest-canvas-mock'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/setup', '/helpers', '/__tests__/__mocks__'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules'],
  globals: {
    __TESTCHAIN__: true
  }
};
