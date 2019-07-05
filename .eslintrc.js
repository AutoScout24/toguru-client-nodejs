module.exports = {
  "extends": ['eslint:recommended', 'plugin:prettier/recommended'],
  "env": {
    "es6": true,
    "jest": true,
    "node": true,
  },
  "parserOptions": {
    'ecmaVersion': 2018,
  },
  "rules": {
    'no-var': 'error',
    'prefer-const': 'error',
    'prettier/prettier': 'error',
    'sort-imports': 'error',
  }
}