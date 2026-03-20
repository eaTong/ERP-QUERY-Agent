import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run dev',
    port: 3022,
    reuseExistingServer: true,
  },
});
