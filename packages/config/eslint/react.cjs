module.exports = {
  extends: [require.resolve('./base.cjs'), 'plugin:react-hooks/recommended'],
  env: {
    browser: true,
    es2022: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
