module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['lib/**/*.ts'],
  coverageReporters: ['text-summary', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 40,
      functions: 80,
      lines: 80,
    },
  },
};
