const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['json', 'text', 'cobertura'],
  testPathIgnorePatterns: ['/node_modules/', 'match-media-mock.spec.ts'],
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
};
