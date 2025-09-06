module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Use CommonJS compilation via ts-jest to match tsconfig.module
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  // Fix key name and mapping for path imports ending with .js in TS source
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};