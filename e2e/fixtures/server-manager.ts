/**
 * Routlux Server Manager
 *
 * Manages the lifecycle of a routilux CLI server for E2E testing.
 * Handles starting, stopping, and health checking the server.
 */

import { ChildProcess, spawn } from "child_process";
import { pathToFileURL } from "url";
import * as path from "path";
import * as fs from "fs/promises";

export interface ServerConfig {
  /** Server port (default: random available port) */
  port: number;
  /** Host to bind to (default: 127.0.0.1) */
  host?: string;
  /** Path to test routines directory */
  routinesDir: string;
  /** Log level for server */
  logLevel?: "debug" | "info" | "warning" | "error";
  /** Enable auto-reload (development mode) */
  reload?: boolean;
}

export interface ServerStatus {
  running: boolean;
  pid?: number;
  port: number;
  uptime?: number;
}

/**
 * Manages a routilux CLI server instance.
 *
 * Usage:
 * ```ts
 * const server = new RoutluxServer({ port: 20555, routinesDir: './e2e-routines' });
 * await server.start();
 * // ... run tests
 * await server.stop();
 * ```
 */
export class RoutluxServer {
  private process: ChildProcess | null = null;
  private readonly config: Required<ServerConfig>;
  private startTime: number = 0;
  private stdout: string[] = [];
  private stderr: string[] = [];

  constructor(config: ServerConfig) {
    this.config = {
      port: config.port,
      host: config.host || "127.0.0.1",
      routinesDir: config.routinesDir,
      logLevel: config.logLevel || "warning", // Reduce noise in tests
      reload: config.reload || false,
    };
  }

  /**
   * Start the routilux server.
   * Waits for the server to be ready before returning.
   */
  async start(): Promise<void> {
    if (this.process) {
      throw new Error("Server is already running");
    }

    console.log(`🚀 Starting routilux server on ${this.config.host}:${this.config.port}`);

    // Resolve the routilux CLI path
    const cliPath = await this.findRoutiluxCli();

    // Spawn the server process
    this.process = spawn(
      "routilux",
      [
        "server",
        "start",
        "--host",
        this.config.host,
        "--port",
        this.config.port.toString(),
        "--routines-dir",
        this.config.routinesDir,
        "--log-level",
        this.config.logLevel,
      ],
      {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1", // Ensure unbuffered output
          ROUTILUX_DEV_DISABLE_SECURITY: "true", // Disable auth for testing
        },
      }
    );

    // Capture output for debugging
    this.process.stdout?.on("data", (data) => {
      const output = data.toString();
      this.stdout.push(output);
    });

    this.process.stderr?.on("data", (data) => {
      const output = data.toString();
      this.stderr.push(output);
    });

    // Handle unexpected exits
    this.process.on("exit", (code, signal) => {
      if (signal !== "SIGTERM" && signal !== "SIGINT") {
        console.error(`Server exited unexpectedly with code ${code}`);
      }
    });

    this.startTime = Date.now();

    // Wait for server to be ready
    await this.waitForReady();

    console.log(`✅ Routlux server ready (PID: ${this.process.pid})`);
  }

  /**
   * Stop the server gracefully.
   */
  async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    console.log(`🛑 Stopping routilux server (PID: ${this.process.pid})`);

    // Try graceful shutdown first
    this.process.kill("SIGTERM");

    // Wait up to 5 seconds for graceful shutdown
    await this.waitForExit(5000);

    // Force kill if still running
    if (this.process && !this.process.killed) {
      console.warn("⚠️  Force killing server");
      this.process.kill("SIGKILL");
      await this.waitForExit(2000);
    }

    this.process = null;
    console.log("✅ Routlux server stopped");
  }

  /**
   * Get the current server status.
   */
  getStatus(): ServerStatus {
    return {
      running: this.process !== null && !this.process.killed,
      pid: this.process?.pid,
      port: this.config.port,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : undefined,
    };
  }

  /**
   * Get the server URL for API calls.
   */
  getServerUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  /**
   * Get captured stdout for debugging.
   */
  getStdout(): string {
    return this.stdout.join("\n");
  }

  /**
   * Get captured stderr for debugging.
   */
  getStderr(): string {
    return this.stderr.join("\n");
  }

  /**
   * Get an API client for making requests to the server.
   */
  getApiClient() {
    const axios = require("axios");
    return axios.create({ baseURL: this.getServerUrl() });
  }

  /**
   * Wait for the server to be ready by polling the health endpoint.
   */
  private async waitForReady(timeout: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`${this.getServerUrl()}/api/v1/health/live`);
        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet, continue waiting
      }

      await this.sleep(200);
    }

    throw new Error(`Server failed to start within ${timeout}ms`);
  }

  /**
   * Wait for the process to exit.
   */
  private async waitForExit(timeout: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (!this.process || this.process.killed) {
        return;
      }
      await this.sleep(100);
    }
  }

  /**
   * Find the routilux CLI by checking common locations.
   */
  private async findRoutiluxCli(): Promise<string> {
    // Check if routilux CLI is available
    const { spawn } = require("child_process");

    return new Promise((resolve, reject) => {
      const proc = spawn("routilux", ["--version"]);
      let stdout = "";
      let stderr = "";

      proc.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("close", (code: number) => {
        if (code === 0) {
          resolve("routilux");
        } else {
          reject(
            new Error(
              "Routilux CLI not found. Ensure routilux is installed:\n" +
                "  pip install routilux\n" +
                `  Error: ${stderr}`
            )
          );
        }
      });

      proc.on("error", (err: Error) => {
        reject(
          new Error(
            "Routilux CLI not found. Ensure routilux is installed:\n" +
              "  pip install routilux\n" +
              `  Error: ${err.message}`
          )
        );
      });
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Find an available port for the server.
 */
export async function findAvailablePort(startPort: number = 20555): Promise<number> {
  const net = require("net");

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      const port = server.address()?.port;
      server.close(() => {
        resolve(port || startPort);
      });
    });

    server.on("error", () => {
      // Port is in use, try next
      resolve(findAvailablePort(startPort + 1));
    });
  });
}
