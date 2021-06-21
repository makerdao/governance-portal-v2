module.exports = {
  collectCoverageFrom: [
    '{components,lib,pages,stores}/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/{node_modules,coverage}/**',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/setup', '/helpers', '/__tests__/__mocks__', '__tests__/lib/polling/poll-327.js', '__tests__/lib/polling/poll-431.js'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules'],
  globals: {
    __TESTCHAIN__: true
  },
  moduleNameMapper: {
    'lib(.*)$': '<rootDir>/lib/$1',
    'components(.*)$': '<rootDir>/components/$1',
    'stores(.*)$': '<rootDir>/stores/$1',
  },
};
