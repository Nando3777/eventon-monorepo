module.exports = {
  root: true,
  extends: [require.resolve('@eventon/config/eslint/base')],
  ignorePatterns: ['**/dist/**', '**/.next/**', '**/node_modules/**']
};
