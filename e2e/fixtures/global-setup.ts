import { FullConfig } from "@playwright/test";

/**
 * Global setup for E2E tests.
 *
 * This runs once before all tests. Currently minimal setup is needed
 * as the RoutluxServer fixture handles per-test server management.
 */
async function globalSetup(config: FullConfig) {
  console.log("🔧 E2E Test Suite Starting");
  console.log(`📡 Overseer URL: ${process.env.OVERSEER_BASE_URL || "http://localhost:3000"}`);

  // Validate environment
  if (!process.env.OVERSEER_BASE_URL) {
    console.warn("⚠️  OVERSEER_BASE_URL not set, using default http://localhost:3000");
    console.warn("   Ensure overseer dev server is running on port 3000");
  }
}

export default globalSetup;
