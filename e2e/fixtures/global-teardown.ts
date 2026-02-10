import { FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests.
 *
 * This runs once after all tests complete.
 */
async function globalTeardown(config: FullConfig) {
  console.log('✅ E2E Test Suite Complete');
}

export default globalTeardown;
