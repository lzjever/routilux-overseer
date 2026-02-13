/**
 * 应用错误基类
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(message: string = "Network error occurred") {
    super(message, "NETWORK_ERROR", 0);
  }
}

/**
 * API 错误
 */
export class APIError extends AppError {
  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message, "API_ERROR", statusCode, details);
  }
}

/**
 * 连接错误
 */
export class ConnectionError extends AppError {
  constructor(message: string = "Failed to connect to server") {
    super(message, "CONNECTION_ERROR", 0);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
  }
}
