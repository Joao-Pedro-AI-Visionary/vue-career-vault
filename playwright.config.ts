import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: 'chrome',
    headless: false,
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ['--remote-debugging-port=9222'],
      slowMo: 150
    }
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 15000
  }
})
