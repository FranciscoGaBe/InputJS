module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'max-len': ['warn', {
      code: 80,
    }],
  },
  settings: {},
};
