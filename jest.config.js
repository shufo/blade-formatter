const appRoot = require('app-root-path');

module.exports = {
  globals: {
    __basedir: appRoot.toString(),
  },
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
  testTimeout: 10000,
  verbose: true,
  cache: false,
};
