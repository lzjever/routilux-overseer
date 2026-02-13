import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger, logger, apiLogger, wsLogger, storeLogger } from "@/lib/utils/logger";

describe("Logger", () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic logging", () => {
    it("should log info messages", () => {
      const log = new Logger({ level: "info" });
      log.info("Test message");

      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it("should log warn messages", () => {
      const log = new Logger({ level: "info" });
      log.warn("Warning message");

      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it("should log error messages", () => {
      const log = new Logger({ level: "info" });
      log.error("Error message");

      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it("should not log debug when level is info", () => {
      const log = new Logger({ level: "info" });
      log.debug("Debug message");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it("should log debug when level is debug", () => {
      const log = new Logger({ level: "debug" });
      log.debug("Debug message");

      expect(consoleSpy.debug).toHaveBeenCalled();
    });
  });

  describe("Log levels", () => {
    it("should respect warn level", () => {
      const log = new Logger({ level: "warn" });

      log.debug("debug");
      log.info("info");
      log.warn("warn");
      log.error("error");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it("should respect error level", () => {
      const log = new Logger({ level: "error" });

      log.debug("debug");
      log.info("info");
      log.warn("warn");
      log.error("error");

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("Context and prefix", () => {
    it("should include prefix in log message", () => {
      const log = new Logger({ level: "info", prefix: "TEST" });
      log.info("Test message");

      const call = consoleSpy.info.mock.calls[0];
      const message = call.join(" ");
      expect(message).toContain("[TEST]");
    });

    it("should include context object", () => {
      const log = new Logger({ level: "info" });
      log.info("Test message", { key: "value" });

      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle Error objects", () => {
      const log = new Logger({ level: "error" });
      const error = new Error("Test error");
      log.error("Error occurred", error);

      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it("should handle non-Error objects", () => {
      const log = new Logger({ level: "error" });
      log.error("Error occurred", "string error");

      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("Child logger", () => {
    it("should create child logger with combined prefix", () => {
      const parent = new Logger({ level: "info", prefix: "PARENT" });
      const child = parent.child("CHILD");

      child.info("Test message");

      const call = consoleSpy.info.mock.calls[0];
      const message = call.join(" ");
      expect(message).toContain("[PARENT:CHILD]");
    });
  });

  describe("Dynamic configuration", () => {
    it("should allow changing log level", () => {
      const log = new Logger({ level: "error" });

      log.info("Should not log");
      expect(consoleSpy.info).not.toHaveBeenCalled();

      log.setLevel("info");
      log.info("Should log now");
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it("should allow changing prefix", () => {
      const log = new Logger({ level: "info" });

      log.setPrefix("NEW_PREFIX");
      log.info("Test message");

      const call = consoleSpy.info.mock.calls[0];
      const message = call.join(" ");
      expect(message).toContain("[NEW_PREFIX]");
    });
  });

  describe("Singleton instances", () => {
    it("should export default logger instance", () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it("should export apiLogger with correct prefix", () => {
      expect(apiLogger).toBeInstanceOf(Logger);
    });

    it("should export wsLogger with correct prefix", () => {
      expect(wsLogger).toBeInstanceOf(Logger);
    });

    it("should export storeLogger with correct prefix", () => {
      expect(storeLogger).toBeInstanceOf(Logger);
    });
  });
});
