const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/a11y',
  timeout: 30000,
  use: {
    baseURL: process.env.WAITLINE_BASE_URL || 'http://localhost:4000',
  },
});
