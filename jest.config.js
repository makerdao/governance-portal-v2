module.exports = {
  collectCoverageFrom: [
    '{components,lib,pages,stores}/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/{node_modules,coverage}/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/setup', '/helpers', '/__tests__/__mocks__', '__tests__/lib/polling/poll-327.js', '__tests__/lib/polling/poll-431.js'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules'],
  globals: {
    __TESTCHAIN__: true
  },
  moduleNameMapper: {
    '^components(.*)$': '<rootDir>/components$1',
    '^lib(.*)$': '<rootDir>/lib$1',
    '^stores(.*)$': '<rootDir>/stores$1',
    '^modules(.*)$': '<rootDir>/modules$1',
  }
};
