import { defineConfig, devices } from '@playwright/test';

// For local development, run services manually:
// Backend: cd backend && npm run dev (port 4000)
// Frontend: cd frontend && npm run dev (port 3000, falls back to 3020/3021)
// Then run tests: npx playwright test

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
