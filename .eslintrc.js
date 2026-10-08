module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'xwalk/max-cells': ['error', {
      '*': 4,
      // page properties and key-value blocks (one row per field) are not cell-limited
      'page-metadata': 6,
      'calculator-emi': 13,
      'dealer-finder': 5,
      // 4 content rows + the "classes" option (intro variant), which is not a cell
      'article-header': 5,
    }],
  },
};
