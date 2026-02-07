import { ApiError } from "@/lib/api/generated/core/ApiError";

type ApiErrorDetail = {
  error?: { code?: string; message?: string; details?: unknown };
  detail?: { error?: { code?: string; message?: string }; message?: string } | string;
};

export type NormalizedApiError = {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  raw?: unknown;
};

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  raw?: unknown;

  constructor(message: string, options?: Omit<NormalizedApiError, "message">) {
    super(message);
    this.name = "ApiClientError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
    this.raw = options?.raw;
  }
}

const extractMessageFromString = (message: string): string | null => {
  const bodyIndex = message.indexOf("body:");
  const bodySlice = bodyIndex >= 0 ? message.slice(bodyIndex + 5).trim() : null;
  const braceIndex = message.indexOf("{");
  const braceSlice = braceIndex >= 0 ? message.slice(braceIndex).trim() : null;
  const candidates = [bodySlice, braceSlice, message].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = candidate.replace(/\\\"/g, "\"").replace(/\\'/g, "'");
    try {
      const parsed = JSON.parse(normalized);
      const parsedMessage = extractMessageFromBody(parsed);
      if (parsedMessage) return parsedMessage;
    } catch {
      const match =
        /['"]message['"]:\s*'([^']+)'/.exec(normalized) ||
        /['"]message['"]:\s*"([^"]+)"/.exec(normalized);
      if (match) return match[1];
    }
  }

  return null;
};

const extractMessageFromBody = (body: unknown): string | null => {
  if (!body) return null;
  if (typeof body === "string") return extractMessageFromString(body);
  if (typeof body === "object") {
    const record = body as ApiErrorDetail;
    const nestedMessage =
      record.error?.message ||
      record.detail?.error?.message ||
      (typeof record.detail === "string" ? record.detail : record.detail?.message) ||
      null;
    if (nestedMessage) {
      return extractMessageFromString(nestedMessage) || nestedMessage;
    }
    return null;
  }
  return null;
};

export function normalizeApiError(error: unknown, fallback: string): NormalizedApiError {
  if (error instanceof ApiError) {
    const bodyMessage = extractMessageFromBody(error.body);
    const message =
      bodyMessage ||
      extractMessageFromString(error.message) ||
      error.statusText ||
      fallback;
    const code =
      typeof error.body === "object" && error.body
        ? (error.body as ApiErrorDetail).error?.code
        : undefined;
    const details =
      typeof error.body === "object" && error.body
        ? (error.body as ApiErrorDetail).error?.details
        : undefined;
    return { message, code, status: error.status, details, raw: error };
  }

  if (error instanceof Error && error.message) {
    const message = extractMessageFromString(error.message) || error.message;
    return { message, raw: error };
  }

  return { message: fallback, raw: error };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return normalizeApiError(error, fallback).message;
}
