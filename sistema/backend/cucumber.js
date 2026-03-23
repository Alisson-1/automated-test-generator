module.exports = {
  default: {
    require: ['src/features/support/env.ts', 'src/features/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    paths: ['src/features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
  },
};
