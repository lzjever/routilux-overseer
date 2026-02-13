import { toast } from "sonner";
import { AppError, NetworkError, APIError, ValidationError, AuthenticationError } from "./types";

/**
 * 错误处理配置
 */
interface ErrorHandlerConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

/**
 * 默认配置
 */
const defaultConfig: ErrorHandlerConfig = {
  showToast: true,
  logToConsole: true,
};

/**
 * 统一错误处理函数
 */
export function handleError(error: unknown, config: ErrorHandlerConfig | string = {}): void {
  const options: ErrorHandlerConfig =
    typeof config === "string"
      ? { ...defaultConfig, context: config }
      : { ...defaultConfig, ...config };

  const appError = parseError(error, options.context);

  if (options.logToConsole) {
    console.error(
      `[${appError.code}] ${options.context ? options.context + ": " : ""}${appError.message}`,
      error
    );
  }

  if (options.showToast) {
    showErrorToast(appError);
  }
}

/**
 * 解析未知错误为 AppError
 */
function parseError(error: unknown, context?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new NetworkError(error.message);
    }
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return new AuthenticationError(error.message);
    }
    if (error.message.includes("400") || error.message.includes("validation")) {
      return new ValidationError(error.message);
    }
    return new APIError(error.message, 500);
  }

  if (typeof error === "string") {
    return new APIError(error);
  }

  return new APIError("An unknown error occurred");
}

/**
 * 显示错误 Toast
 */
function showErrorToast(error: AppError): void {
  const title = getErrorTitle(error.code);
  toast.error(title, {
    description: error.message,
    duration: 5000,
  });
}

/**
 * 获取错误标题
 */
function getErrorTitle(code: string): string {
  const titles: Record<string, string> = {
    NETWORK_ERROR: "Network Error",
    API_ERROR: "API Error",
    CONNECTION_ERROR: "Connection Error",
    VALIDATION_ERROR: "Validation Error",
    AUTH_ERROR: "Authentication Failed",
  };
  return titles[code] || "Error";
}

/**
 * 包装异步函数，自动处理错误
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: ErrorHandlerConfig | string = {}
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args).catch((error) => {
      handleError(error, config);
      throw error;
    });
    return result;
  }) as T;
}
