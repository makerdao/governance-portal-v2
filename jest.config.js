module.exports = {
  collectCoverageFrom: [
    '{modules,lib,pages}/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/{node_modules,coverage}/**'
  ],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.tsx', 'jest-canvas-mock'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/.next/',
    '/setup',
    '__tests__/helpers.tsx',
    '/__tests__/__mocks__',
    '/__tests__/__helpers__'
  ],
  transformIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules'],
  globals: {
    __TESTCHAIN__: true
  },
  moduleNameMapper: {
    '^lib(.*)$': '<rootDir>/lib$1',
    '^modules(.*)$': '<rootDir>/modules$1'
  },
  testTimeout: 7000
};
