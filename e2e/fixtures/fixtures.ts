/**
 * Playwright Test Fixtures
 *
 * Extends Playwright's test with custom fixtures for E2E testing.
 */

import { test as base, Page } from "@playwright/test";
import { RoutluxServer, findAvailablePort } from "./server-manager";
import * as path from "path";
import * as http from "http";

/**
 * Check if a server is already running on the given port
 */
async function isServerRunning(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: host,
        port: port,
        path: "/api/v1/health/live",
        method: "GET",
        timeout: 2000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Mock server object for an already-running server
 */
class ExistingServer {
  constructor(
    private host: string,
    private port: number
  ) {}
  getServerUrl() {
    return `http://${this.host}:${this.port}`;
  }
  async stop() {
    /* Don't stop external server */
  }
  getApiClient() {
    const axios = require("axios");
    return axios.create({ baseURL: this.getServerUrl() });
  }
}

/**
 * Custom test fixtures
 */
export const test = base.extend<{
  server: RoutluxServer | ExistingServer;
  serverPort: number;
}>({
  // Allocate a unique port for each test
  serverPort: async ({}, use) => {
    // Check if server is already running on default port
    const defaultPort = 20555;
    const isRunning = await isServerRunning("127.0.0.1", defaultPort);
    if (isRunning) {
      await use(defaultPort);
    } else {
      const port = await findAvailablePort(defaultPort);
      await use(port);
    }
  },

  // Server fixture - uses existing or starts new
  server: async ({ serverPort }, use) => {
    let isRunning = await isServerRunning("127.0.0.1", serverPort);
    // Re-verify after a short delay to avoid reusing a server that is shutting down from a previous test
    if (isRunning) {
      await new Promise((r) => setTimeout(r, 150));
      isRunning = await isServerRunning("127.0.0.1", serverPort);
    }

    if (isRunning) {
      console.log(`📡 Using existing server on 127.0.0.1:${serverPort}`);
      await use(new ExistingServer("127.0.0.1", serverPort));
    } else {
      const routinesDir = path.resolve(__dirname, "test-routines");
      const server = new RoutluxServer({
        port: serverPort,
        routinesDir: routinesDir,
        logLevel: "error",
      });

      try {
        await server.start();
        await use(server);
      } finally {
        await server.stop();
      }
    }
  },
});

/**
 * Re-export Page and expect for convenience
 */
export type { Page } from "@playwright/test";
export const expect = test.expect;
