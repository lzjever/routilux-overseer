import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleError, withErrorHandling } from "@/lib/errors/error-handler";
import { NetworkError, APIError, ValidationError, AuthenticationError } from "@/lib/errors/types";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("ErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("should handle AppError", () => {
      const error = new NetworkError("Test network error");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      handleError(error, "TestContext");

      expect(consoleSpy).toHaveBeenCalledWith(
        "[NETWORK_ERROR] TestContext: Test network error",
        error
      );
      consoleSpy.mockRestore();
    });

    it("should handle Error instance", () => {
      const error = new Error("fetch failed");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      handleError(error);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle string error", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      handleError("test error");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("withErrorHandling", () => {
    it("should wrap async function and handle errors", async () => {
      const fn = async () => {
        throw new Error("Test error");
      };

      const wrapped = withErrorHandling(fn);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(wrapped()).rejects.toThrow("Test error");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return result when no error", async () => {
      const fn = async () => "success";
      const wrapped = withErrorHandling(fn);

      const result = await wrapped();
      expect(result).toBe("success");
    });
  });
});
