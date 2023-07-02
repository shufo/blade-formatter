import type { Config } from '@jest/types';

const appRoot = require('app-root-path');

const config: Config.InitialOptions = {
  globals: {
    __basedir: appRoot.toString(),
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).([jt]s?(x)|cjs)'],
  transform: {
    '^.+\\.(js|jsx|cjs)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    'node_modules/variables/.+\\.(j|t)sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testTimeout: 10000,
  verbose: true,
  cache: false,
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  collectCoverage: true,
};

export default config;
