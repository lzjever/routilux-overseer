/**
 * Playwright Test Fixtures
 *
 * Extends Playwright's test with custom fixtures for E2E testing.
 */

import { test as base, Page } from '@playwright/test';
import { RoutluxServer, findAvailablePort } from './server-manager';
import * as path from 'path';

/**
 * Custom test fixtures
 */
export const test = base.extend<{
  server: RoutluxServer;
  serverPort: number;
}>({
  // Allocate a unique port for each test
  serverPort: async ({}, use) => {
    const port = await findAvailablePort(20555);
    await use(port);
  },

  // Server fixture - starts before test, stops after
  server: async ({ serverPort }, use) => {
    const routinesDir = path.resolve(__dirname, 'test-routines');
    const server = new RoutluxServer({
      port: serverPort,
      routinesDir: routinesDir,
      logLevel: 'error', // Minimize log noise
    });

    try {
      await server.start();
      await use(server);
    } finally {
      await server.stop();
    }
  },
});

/**
 * Re-export Page and expect for convenience
 */
export { Page } from '@playwright/test';
export const expect = test.expect;
