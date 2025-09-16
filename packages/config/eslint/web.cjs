module.exports = {
  extends: [require.resolve('./base.cjs'), 'next/core-web-vitals'],
  env: {
    browser: true,
    es2022: true,
    node: true
  }
};
