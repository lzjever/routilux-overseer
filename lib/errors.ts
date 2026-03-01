/**
 * API error parsing and user-facing messages.
 * Maps structured error codes from Routilux API to readable messages.
 * Backward compatible: if response has no "code", falls back to message or generic text.
 */

export interface StructuredErrorBody {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

const CODE_MESSAGES: Record<string, string> = {
  FLOW_NOT_FOUND: "Flow not found.",
  FLOW_ALREADY_EXISTS: "A flow with this ID already exists.",
  FLOW_VALIDATION_FAILED: "Flow validation failed.",
  WORKER_NOT_FOUND: "Worker not found.",
  WORKER_NOT_RUNNING: "Worker is not running.",
  JOB_NOT_FOUND: "Job not found.",
  JOB_ALREADY_COMPLETED: "Job is already completed.",
  VALIDATION_ERROR: "Invalid request.",
  UNAUTHORIZED: "Authentication required.",
  CONFLICT: "Conflict with current state.",
  INTERNAL_ERROR: "Server error. Please try again.",
  RUNTIME_SHUTDOWN: "Server is shutting down.",
};

/**
 * Get a user-facing error message from an API error response body.
 * Prefers structured code/message; falls back to message string or generic text.
 */
export function getApiErrorMessage(
  body: StructuredErrorBody | null | undefined,
  fallback = "Something went wrong."
): string {
  if (!body) return fallback;
  const code = body.code ?? body.error?.code;
  const message = body.message ?? body.error?.message;
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

/**
 * Try to extract structured error body from a failed fetch/API response.
 * Use with catch (e) and optional response.json().
 */
export function parseApiErrorBody(data: unknown): StructuredErrorBody | null {
  if (data && typeof data === "object" && "code" in data) return data as StructuredErrorBody;
  if (data && typeof data === "object" && "error" in data) return data as StructuredErrorBody;
  return null;
}

/**
 * Heuristic: true if the error looks like a network failure (fetch failed, timeout, etc.).
 * Used to show "connection lost" banner when API calls fail due to network.
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    typeof error === "string" ? error : error instanceof Error ? error.message : String(error);
  const s = msg.toLowerCase();
  return (
    s.includes("failed to fetch") ||
    s.includes("network error") ||
    s.includes("networkrequestfailed") ||
    s.includes("load failed") ||
    s.includes("connection refused") ||
    s.includes("timeout") ||
    s.includes("econnrefused") ||
    s.includes("econnreset")
  );
}

/** Re-export for stores and call sites that use the shared error handler. */
export { handleError } from "./errors/error-handler";
