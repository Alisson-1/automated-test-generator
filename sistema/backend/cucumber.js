module.exports = {
  default: {
    require: ['src/features/**/*.ts'],
    requireModule: ['ts-node/register'],
    paths: ['src/features/**/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
  },
};
