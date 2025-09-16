'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

let loaded = false;

function loadEnv(options = {}) {
  if (loaded) {
    return process.env;
  }

  const cwd = options.cwd || process.cwd();
  const envPath = options.path || path.join(cwd, '.env');

  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      throw result.error;
    }
  }

  loaded = true;
  return process.env;
}

module.exports = { loadEnv };
