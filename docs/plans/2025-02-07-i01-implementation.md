# Routilux-Overseer 改进实施计划 (I01)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 全面改进 Routilux-Overseer 项目，包括状态管理重构、API 客户端单例化、统一错误处理、WebSocket 优化、插件管理 UI 和测试覆盖补充。

**Architecture:** 引入 Service Layer (APIClient 单例 + QueryService) 封装 API 调用和缓存逻辑；统一错误处理使用 ErrorHandler + toast 通知；WebSocket 优化实现指数退避重连和心跳检测；插件管理 UI 提供完整的插件管理界面。

**Tech Stack:** Next.js 14, Zustand, TypeScript, Vitest, Playwright, MSW, sonner (toast)

---

## Phase 1: 基础设施层 (1-2 天)

### Task 1.1: 创建 Toast UI 组件

**Files:**

- Create: `components/ui/toast.tsx`
- Create: `components/ui/sonner.tsx`
- Create: `components/ui/use-toast.ts`
- Modify: `app/layout.tsx:1-50`

**Step 1: Create toast component**

Create file `components/ui/toast.tsx`:

```typescript
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/sonner"

export { useToast }

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```

**Step 2: Create sonner components**

Create file `components/ui/sonner.tsx`:

```typescript
"use client"

import { useSonner } from "sonner"
import { toast as sonnerToast } from "sonner"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export { sonnerToast as toast }

export function Toaster() {
  const { toasts } = useSonner()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
            t.type === "error" && "destructive border-destructive bg-destructive text-destructive-foreground",
            t.type === "success" && "border-green-500 bg-green-500 text-white"
          )}
        >
          <div className="grid gap-1">
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
          <button
            onClick={() => sonnerToast.dismiss(t.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Create useToast hook**

Create file `components/ui/use-toast.ts`:

```typescript
import { useState, useEffect } from "react";

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = {
  ADD_TOAST: ToasterToast;
  UPDATE_TOAST: Partial<ToasterToast> & { id: string };
  DISMISS_TOAST: ToasterToast["id"];
  REMOVE_TOAST: ToasterToast["id"];
};

let memoryState: { toasts: ToasterToast[] } = { toasts: [] };

const dispatch = (action: ActionType) => {
  memoryState = reducer(memoryState, action);
};

function reducer(state: typeof memoryState, action: ActionType): typeof memoryState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.payload, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }
    case "REMOVE_TOAST":
      if (action.payload.id === memoryState.toasts[0]?.id) {
        return {
          ...state,
          toasts: state.toasts.slice(1),
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
  }
}

function toast({ ...props }: ToastProps) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      payload: { id, ...props },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    payload: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = useState<typeof memoryState>(memoryState);

  useEffect(() => {
    const listener = () => {
      setState(memoryState);
    };
    window.addEventListener("toast-update", listener);
    return () => window.removeEventListener("toast-update", listener);
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
```

**Step 4: Add Toaster to root layout**

Modify `app/layout.tsx`, add Toaster near the end of body:

```typescript
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

**Step 5: Commit**

```bash
git add components/ui/toast.tsx components/ui/sonner.tsx components/ui/use-toast.ts app/layout.tsx
git commit -m "feat: add toast components with sonner"
```

---

### Task 1.2: 创建错误类型定义

**Files:**

- Create: `lib/errors/types.ts`

**Step 1: Write error types**

Create file `lib/errors/types.ts`:

```typescript
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
```

**Step 2: Write test for error types**

Create file `test/unit/errors/types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  AppError,
  NetworkError,
  APIError,
  ConnectionError,
  ValidationError,
  AuthenticationError,
} from "@/lib/errors/types";

describe("Error Types", () => {
  describe("AppError", () => {
    it("should create base error", () => {
      const error = new AppError("Test error", "TEST_CODE", 500);
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("AppError");
    });
  });

  describe("NetworkError", () => {
    it("should create network error with default message", () => {
      const error = new NetworkError();
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe("Network error occurred");
    });

    it("should create network error with custom message", () => {
      const error = new NetworkError("Custom network error");
      expect(error.message).toBe("Custom network error");
    });
  });

  describe("APIError", () => {
    it("should create API error with status code", () => {
      const error = new APIError("Not found", 404);
      expect(error.code).toBe("API_ERROR");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("ConnectionError", () => {
    it("should create connection error", () => {
      const error = new ConnectionError();
      expect(error.code).toBe("CONNECTION_ERROR");
    });
  });

  describe("ValidationError", () => {
    it("should create validation error", () => {
      const error = new ValidationError("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("AuthenticationError", () => {
    it("should create auth error", () => {
      const error = new AuthenticationError();
      expect(error.code).toBe("AUTH_ERROR");
      expect(error.statusCode).toBe(401);
    });
  });
});
```

**Step 3: Run test**

Run: `npm test test/unit/errors/types.test.ts`

Expected: All tests pass

**Step 4: Commit**

```bash
git add lib/errors/types.ts test/unit/errors/types.test.ts
git commit -m "feat: add error type definitions"
```

---

### Task 1.3: 创建错误处理器

**Files:**

- Create: `lib/errors/error-handler.ts`
- Create: `lib/errors/index.ts`

**Step 1: Write error handler**

Create file `lib/errors/error-handler.ts`:

```typescript
import { toast } from "sonner";
import type { AppError } from "./types";

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
  // Import dynamically to avoid circular dependency
  const {
    AppError: AppErrorClass,
    NetworkError,
    APIError,
    ValidationError,
    AuthenticationError,
  } = require("./types");

  if (error instanceof AppErrorClass) {
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
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, config);
      throw error;
    }
  }) as T;
}
```

**Step 2: Create barrel export**

Create file `lib/errors/index.ts`:

```typescript
export * from "./types";
export * from "./error-handler";
```

**Step 3: Write test for error handler**

Create file `test/unit/errors/error-handler.test.ts`:

```typescript
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
```

**Step 4: Run tests**

Run: `npm test test/unit/errors/`

Expected: All tests pass

**Step 5: Commit**

```bash
git add lib/errors/error-handler.ts lib/errors/index.ts test/unit/errors/error-handler.test.ts
git commit -m "feat: add error handler"
```

---

### Task 1.4: 创建 APIClient 单例

**Files:**

- Create: `lib/services/api-client.ts`

**Step 1: Write APIClient**

Create file `lib/services/api-client.ts`:

```typescript
import { OpenAPI } from "../api/generated";
import { createAPI, type API } from "../api/index";

/**
 * API 客户端单例
 *
 * 职责：
 * - 单例管理
 * - 自动注入 API Key
 * - 连接状态管理
 */
class APIClientManager {
  private static instance: APIClientManager | null = null;
  private api: API | null = null;
  private baseURL: string | null = null;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): APIClientManager {
    if (!APIClientManager.instance) {
      APIClientManager.instance = new APIClientManager();
    }
    return APIClientManager.instance;
  }

  /**
   * 配置并获取 API 客户端
   */
  configure(serverUrl: string, apiKey?: string): API {
    const needsReinit = !this.api || this.baseURL !== serverUrl || this.apiKey !== (apiKey || null);

    if (needsReinit) {
      this.baseURL = serverUrl;
      this.apiKey = apiKey || null;

      OpenAPI.BASE = serverUrl.replace(/\/$/, "");
      if (this.apiKey) {
        OpenAPI.HEADERS = { "X-API-Key": this.apiKey };
      } else {
        OpenAPI.HEADERS = undefined;
      }

      this.api = createAPI(serverUrl, this.apiKey);
    }

    return this.api!;
  }

  /**
   * 获取当前 API 客户端（必须先配置）
   */
  getAPI(): API {
    if (!this.api) {
      throw new Error("APIClient not configured. Call configure() first.");
    }
    return this.api;
  }

  /**
   * 重置（断开连接时调用）
   */
  reset(): void {
    this.api = null;
    this.baseURL = null;
    this.apiKey = null;
    OpenAPI.BASE = "";
    OpenAPI.HEADERS = undefined;
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo(): { serverUrl: string | null; apiKey: string | null } {
    return { serverUrl: this.baseURL, apiKey: this.apiKey };
  }
}

export const apiClient = APIClientManager.getInstance();

// 便捷函数
export function configureAPI(serverUrl: string, apiKey?: string): API {
  return apiClient.configure(serverUrl, apiKey);
}

export function getAPI(): API {
  return apiClient.getAPI();
}

export function resetAPI(): void {
  apiClient.reset();
}
```

**Step 2: Write test for APIClient**

Create file `test/unit/services/api-client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureAPI, resetAPI, apiClient } from "@/lib/services/api-client";
import { OpenAPI } from "@/lib/api/generated";

// Mock the OpenAPI services
vi.mock("@/lib/api/generated", () => ({
  OpenAPI: {
    BASE: "",
    HEADERS: undefined,
  },
}));

// Mock createAPI function
vi.mock("@/lib/api/index", () => ({
  createAPI: (url: string) => ({
    flows: { list: async () => ({ flows: [] }) },
    jobs: { list: async () => ({ jobs: [] }) },
    health: { readiness: async () => ({ status: "ok" }) },
  }),
}));

describe("APIClient", () => {
  beforeEach(() => {
    resetAPI();
  });

  afterEach(() => {
    resetAPI();
  });

  describe("configure", () => {
    it("should configure API with server URL", () => {
      const api = configureAPI("http://localhost:8000", "test-key");

      expect(api).toBeDefined();
      expect(OpenAPI.BASE).toBe("http://localhost:8000");
    });

    it("should reuse existing API if configuration unchanged", () => {
      const api1 = configureAPI("http://localhost:8000", "key1");
      const api2 = configureAPI("http://localhost:8000", "key1");

      expect(api1).toBe(api2);
    });

    it("should create new API if server URL changes", () => {
      const api1 = configureAPI("http://localhost:8000", "key1");
      const api2 = configureAPI("http://localhost:8001", "key1");

      expect(api1).not.toBe(api2);
    });

    it("should set API key header", () => {
      configureAPI("http://localhost:8000", "secret-key");

      expect(OpenAPI.HEADERS).toEqual({ "X-API-Key": "secret-key" });
    });
  });

  describe("getAPI", () => {
    it("should return API instance after configuration", () => {
      configureAPI("http://localhost:8000");
      const api = apiClient.getAPI();

      expect(api).toBeDefined();
    });

    it("should throw error if not configured", () => {
      resetAPI();

      expect(() => apiClient.getAPI()).toThrow("APIClient not configured");
    });
  });

  describe("reset", () => {
    it("should clear API instance", () => {
      configureAPI("http://localhost:8000");
      resetAPI();

      expect(() => apiClient.getAPI()).toThrow("APIClient not configured");
    });

    it("should clear OpenAPI configuration", () => {
      configureAPI("http://localhost:8000", "key");
      resetAPI();

      expect(OpenAPI.BASE).toBe("");
      expect(OpenAPI.HEADERS).toBeUndefined();
    });
  });

  describe("getConnectionInfo", () => {
    it("should return connection info", () => {
      configureAPI("http://localhost:8000", "key");
      const info = apiClient.getConnectionInfo();

      expect(info).toEqual({
        serverUrl: "http://localhost:8000",
        apiKey: "key",
      });
    });

    it("should return null when not configured", () => {
      resetAPI();
      const info = apiClient.getConnectionInfo();

      expect(info).toEqual({
        serverUrl: null,
        apiKey: null,
      });
    });
  });
});
```

**Step 3: Run test**

Run: `npm test test/unit/services/api-client.test.ts`

Expected: All tests pass

**Step 4: Commit**

```bash
git add lib/services/api-client.ts test/unit/services/api-client.test.ts
git commit -m "feat: add APIClient singleton"
```

---

### Task 1.5: 创建 QueryService

**Files:**

- Create: `lib/services/query-service.ts`
- Create: `lib/services/index.ts`

**Step 1: Write QueryService**

Create file `lib/services/query-service.ts`:

```typescript
import { getAPI } from "./api-client";
import { handleError } from "../errors/error-handler";

/**
 * 请求缓存项
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * QueryService 配置
 */
interface QueryServiceConfig {
  cacheTTL?: number;
  enabled?: boolean;
}

/**
 * QueryService - 查询服务
 *
 * 职责：
 * - 封装常用查询逻辑
 * - 请求缓存
 * - 统一错误处理
 */
class QueryService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private config: Required<QueryServiceConfig>;

  constructor(config: QueryServiceConfig = {}) {
    this.config = {
      cacheTTL: config.cacheTTL ?? 30000,
      enabled: config.enabled ?? true,
    };
  }

  /**
   * 通用查询方法
   */
  async query<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { cache?: boolean; ttl?: number } = {}
  ): Promise<T> {
    const { cache = this.config.enabled, ttl = this.config.cacheTTL } = options;

    // 检查缓存
    if (cache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
    }

    // 检查是否有正在进行的请求（去重）
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // 发起请求
    const promise = fetchFn()
      .then((data) => {
        // 缓存结果
        if (cache) {
          this.cache.set(key, { data, timestamp: Date.now() });
        }
        return data;
      })
      .catch((error) => {
        handleError(error, `Query: ${key}`);
        throw error;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * 使缓存失效
   */
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Flows 查询
   */
  flows = {
    list: () =>
      this.query("flows:list", () =>
        getAPI()
          .flows.list()
          .then((r) => r.flows || [])
      ),
    get: (flowId: string) => this.query(`flows:get:${flowId}`, () => getAPI().flows.get(flowId)),
    getMetrics: (flowId: string) =>
      this.query(`flows:metrics:${flowId}`, () => getAPI().flows.getMetrics(flowId), {
        cache: false,
      }),
  };

  /**
   * Jobs 查询
   */
  jobs = {
    list: (filters?: { workerId?: string; flowId?: string; status?: string }) =>
      this.query(`jobs:list:${JSON.stringify(filters)}`, () =>
        getAPI()
          .jobs.list(filters?.workerId, filters?.flowId, filters?.status, 100)
          .then((r) => r.jobs || [])
      ),
    get: (jobId: string) => this.query(`jobs:get:${jobId}`, () => getAPI().jobs.get(jobId)),
    getMonitoringData: (jobId: string) =>
      this.query(`jobs:monitoring:${jobId}`, () => getAPI().jobs.getMonitoringData(jobId), {
        cache: false,
      }),
  };

  /**
   * Workers 查询
   */
  workers = {
    list: (filters?: { flowId?: string; status?: string }) =>
      this.query(`workers:list:${JSON.stringify(filters)}`, () =>
        getAPI()
          .workers.list(filters?.flowId, filters?.status, 100)
          .then((r) => r.workers || [])
      ),
    get: (workerId: string) =>
      this.query(`workers:get:${workerId}`, () => getAPI().workers.get(workerId)),
  };

  /**
   * Runtimes 查询
   */
  runtimes = {
    list: () =>
      this.query("runtimes:list", () =>
        getAPI()
          .runtimes.list()
          .then((r) => r.runtimes || [])
      ),
    get: (runtimeId: string) =>
      this.query(`runtimes:get:${runtimeId}`, () => getAPI().runtimes.get(runtimeId)),
  };

  /**
   * Discovery 查询
   */
  discovery = {
    syncFlows: () =>
      this.query(
        "discovery:syncFlows",
        () =>
          getAPI()
            .discovery.syncFlows()
            .then((r) => r.flows || []),
        { cache: false }
      ),
    syncJobs: () =>
      this.query(
        "discovery:syncJobs",
        () =>
          getAPI()
            .discovery.syncJobs()
            .then((r) => r.jobs || []),
        { cache: false }
      ),
  };
}

// 创建全局实例
export const queryService = new QueryService();
```

**Step 2: Create barrel export**

Create file `lib/services/index.ts`:

```typescript
export * from "./api-client";
export * from "./query-service";
```

**Step 3: Write test for QueryService**

Create file `test/unit/services/query-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { queryService } from "@/lib/services/query-service";
import { configureAPI, resetAPI } from "@/lib/services/api-client";

// Mock getAPI
vi.mock("@/lib/services/api-client", () => ({
  configureAPI: vi.fn(),
  resetAPI: vi.fn(),
  getAPI: vi.fn(() => ({
    flows: {
      list: async () => ({ flows: [{ flow_id: "1", name: "Test" }] }),
      get: async (id: string) => ({ flow_id: id, name: "Test" }),
    },
  })),
}));

describe("QueryService", () => {
  beforeEach(() => {
    queryService.invalidate();
  });

  describe("query", () => {
    it("should cache results by default", async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: "test" });

      await queryService.query("test-key", fetchFn);
      await queryService.query("test-key", fetchFn);

      // Should only call once due to cache
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("should not cache when disabled", async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: "test" });

      await queryService.query("test-key", fetchFn, { cache: false });
      await queryService.query("test-key", fetchFn, { cache: false });

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("should invalidate cache", async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: "test" });

      await queryService.query("test-key", fetchFn);
      queryService.invalidate("test-key");
      await queryService.query("test-key", fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("invalidate", () => {
    it("should clear all cache when no key provided", async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: "test" });

      await queryService.query("key1", fetchFn);
      await queryService.query("key2", fetchFn);
      queryService.invalidate();
      await queryService.query("key1", fetchFn);
      await queryService.query("key2", fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(4);
    });
  });
});
```

**Step 4: Run test**

Run: `npm test test/unit/services/query-service.test.ts`

Expected: All tests pass

**Step 5: Commit**

```bash
git add lib/services/query-service.ts lib/services/index.ts test/unit/services/query-service.test.ts
git commit -m "feat: add QueryService with caching"
```

---

## Phase 2: Store 迁移 (2-3 天)

### Task 2.1: 迁移 flowStore

**Files:**

- Modify: `lib/stores/flowStore.ts`

**Step 1: Update imports and use QueryService**

Modify `lib/stores/flowStore.ts`, update the file to use QueryService:

```typescript
import { create } from "zustand";
import {
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "reactflow";
import type { Slot, Event, FlowResponse, ConnectionInfo } from "@/lib/types/flow";
import type { RoutineInfo } from "@/lib/types/api";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";
import { layoutNodes } from "@/lib/utils/flow-layout";

// ... rest of the file, replace createAPI calls with queryService

export const useFlowStore = create<FlowState>((set, get) => ({
  // ... initial state

  loadFlows: async () => {
    const { serverUrl } = get();
    if (!serverUrl) return set({ error: "Not connected to server" });

    set({ loading: true, error: null });
    try {
      const flows = await queryService.flows.list();
      const flowMap = new Map(flows.map((f) => [f.flow_id, f]));
      console.log(`Loaded ${flowMap.size} flows from server`);
      set({ flows: flowMap, loading: false, serverUrl });
    } catch (error) {
      handleError(error, "Failed to load flows");
      set({
        error: error instanceof Error ? error.message : "Failed to load flows",
        loading: false,
      });
    }
  },

  selectFlow: async (flowId, serverUrl) => {
    set({ loading: true, error: null, selectedFlowId: flowId, serverUrl });
    try {
      const flow = await queryService.flows.get(flowId);

      if (!flow) {
        throw new Error("Flow not found");
      }

      const isEditable = !get().isFlowLocked(flowId);
      const nodes = convertFlowToNodes(flow, isEditable);
      const edges = convertFlowToEdges(flow, isEditable);
      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutNodes(nodes, edges, "TB");

      set((state) => ({
        flows: new Map(state.flows).set(flowId, flow),
        selectedFlowId: flowId,
        nodes: layoutedNodes,
        edges: layoutedEdges,
        loading: false,
        serverUrl,
      }));
    } catch (error) {
      handleError(error, `Failed to load flow ${flowId}`);
      set({
        error: error instanceof Error ? error.message : "Failed to load flow",
        loading: false,
        nodes: [],
        edges: [],
      });
    }
  },

  // ... keep other methods the same
}));
```

**Step 2: Update test for flowStore**

Modify existing `test/unit/stores/flowStore.test.ts` or create it:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFlowStore } from "@/lib/stores/flowStore";
import { configureAPI, resetAPI } from "@/lib/services/api-client";
import { queryService } from "@/lib/services/query-service";

// Mock queryService
vi.mock("@/lib/services/query-service", () => ({
  queryService: {
    flows: {
      list: vi.fn(() =>
        Promise.resolve([{ flow_id: "1", name: "Flow 1", routines: {}, connections: [] }])
      ),
      get: vi.fn((id: string) =>
        Promise.resolve({
          flow_id: id,
          name: `Flow ${id}`,
          routines: {},
          connections: [],
        })
      ),
    },
  },
}));

describe("useFlowStore", () => {
  beforeEach(() => {
    resetAPI();
    configureAPI("http://localhost:8000");
  });

  describe("loadFlows", () => {
    it("should load flows successfully", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.loadFlows();
      });

      expect(result.current.flows.size).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
```

**Step 3: Run test**

Run: `npm test test/unit/stores/flowStore.test.ts`

Expected: All tests pass

**Step 4: Commit**

```bash
git add lib/stores/flowStore.ts test/unit/stores/flowStore.test.ts
git commit -m "refactor: migrate flowStore to use QueryService"
```

---

### Task 2.2: 迁移 jobStore

**Files:**

- Modify: `lib/stores/jobStore.ts`

**Step 1: Update jobStore to use QueryService**

Similar to flowStore, update `lib/stores/jobStore.ts`:

```typescript
import { create } from "zustand";
import type { JobResponse, JobSubmitRequest } from "@/lib/api/generated";
import type { JobMonitoringData, ExecutionMetricsResponse } from "@/lib/api/generated";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";
import {
  getWebSocketManager,
  disposeWebSocketManager,
  WebSocketMessage,
} from "@/lib/websocket/websocket-manager";

export const useJobStore = create<JobState>((set, get) => ({
  // ... initial state

  loadJobs: async (serverUrl: string, workerId?: string | null) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const jobs = await queryService.jobs.list({ workerId });
      const jobMap = new Map(jobs.map((j) => [j.job_id, j]));
      set({ jobs: jobMap, loading: false, serverUrl });
    } catch (error) {
      handleError(error, "Failed to load jobs");
      set({
        error: error instanceof Error ? error.message : "Failed to load jobs",
        loading: false,
      });
    }
  },

  loadJob: async (jobId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const job = await queryService.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
        loading: false,
      }));
      return job;
    } catch (error) {
      handleError(error, `Failed to load job ${jobId}`);
      set({
        error: error instanceof Error ? error.message : "Failed to load job",
        loading: false,
      });
      throw error;
    }
  },

  // ... update other methods similarly
}));
```

**Step 2: Update/Create test**

Create/update `test/unit/stores/jobStore.test.ts` similar to flowStore test.

**Step 3: Run test**

Run: `npm test test/unit/stores/jobStore.test.ts`

**Step 4: Commit**

```bash
git add lib/stores/jobStore.ts test/unit/stores/jobStore.test.ts
git commit -m "refactor: migrate jobStore to use QueryService"
```

---

### Task 2.3: 迁移 workersStore

**Files:**

- Modify: `lib/stores/workersStore.ts`

**Step 1-4:** Similar to flowStore migration, replace `createAPI` with `queryService`.

**Commit:**

```bash
git add lib/stores/workersStore.ts
git commit -m "refactor: migrate workersStore to use QueryService"
```

---

### Task 2.4: 迁移其他 stores

Migrate remaining stores in order: runtimeStore, breakpointStore.

---

## Phase 3: WebSocket 优化 (1 天)

### Task 3.1: 优化 WebSocketManager

**Files:**

- Modify: `lib/websocket/websocket-manager.ts`

**Step 1: Add heartbeat and reconnection config**

Add configuration interface and update the class with heartbeat logic.

**Step 2: Write tests**

Create `test/unit/websocket/websocket-manager.test.ts`

**Step 3: Commit**

```bash
git add lib/websocket/websocket-manager.ts test/unit/websocket/
git commit -m "feat: enhance WebSocket with heartbeat and exponential backoff"
```

---

### Task 3.2: 创建 websocket-store

**Files:**

- Create: `lib/stores/websocket-store.ts`

**Step 1: Create WebSocket state store**

```typescript
import { create } from "zustand";

interface WebSocketState {
  connected: boolean;
  reconnectAttempts: number;
  isReconnecting: boolean;

  setConnected: (connected: boolean) => void;
  setReconnectState: (attempts: number, isReconnecting: boolean) => void;
  reset: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  reconnectAttempts: 0,
  isReconnecting: false,

  setConnected: (connected) => set({ connected }),

  setReconnectState: (attempts, isReconnecting) =>
    set({ reconnectAttempts: attempts, isReconnecting }),

  reset: () => set({ connected: false, reconnectAttempts: 0, isReconnecting: false }),
}));
```

**Step 2: Commit**

```bash
git add lib/stores/websocket-store.ts
git commit -m "feat: add WebSocket state store"
```

---

### Task 3.3: 添加离线检测

**Files:**

- Modify: `app/layout.tsx`

**Step 1: Add network detection initialization**

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add network online/offline detection for WebSocket"
```

---

## Phase 4: 插件 UI (1-2 天)

### Task 4.1: 添加 Switch UI 组件

**Files:**

- Create: `components/ui/switch.tsx`

**Step 1: Create switch component (shadcn/ui)**

**Step 2: Commit**

```bash
git add components/ui/switch.tsx
git commit -m "feat: add Switch UI component"
```

---

### Task 4.2: 创建插件组件

**Files:**

- Create: `components/plugins/plugin-card.tsx`
- Create: `components/plugins/plugin-header.tsx`
- Create: `components/plugins/plugin-filters.tsx`
- Create: `components/plugins/index.ts`

**Step 1-3:** Create each component file.

**Step 4: Commit**

```bash
git add components/plugins/
git commit -m "feat: add plugin management components"
```

---

### Task 4.3: 创建插件页面

**Files:**

- Create: `app/plugins/page.tsx`
- Create: `app/plugins/layout.tsx`
- Create: `app/plugins/[pluginId]/page.tsx`

**Step 1-3:** Create each page file.

**Step 4: Commit**

```bash
git add app/plugins/
git commit -m "feat: add plugin management pages"
```

---

### Task 4.4: 更新导航

**Files:**

- Modify: `components/layout/navbar.tsx`

**Step 1: Add plugins link to navigation**

**Step 2: Commit**

```bash
git add components/layout/navbar.tsx
git commit -m "feat: add plugins link to navigation"
```

---

## Phase 5: 测试 (2-3 天)

### Task 5.1: 设置 MSW Mock 服务器

**Files:**

- Create: `test/mocks/server.ts`

**Step 1: Create MSW handlers**

**Step 2: Update test setup**

**Step 3: Commit**

```bash
git add test/mocks/ test/setup.ts
git commit -m "test: add MSW mock server"
```

---

### Task 5.2: 添加集成测试

**Files:**

- Create: `test/integration/api/flows-api.test.ts`
- Create: `test/integration/plugins/plugin-manager.test.ts`

**Step 1-2:** Create integration tests.

**Step 3: Commit**

```bash
git add test/integration/
git commit -m "test: add integration tests"
```

---

### Task 5.3: 添加 E2E 测试

**Files:**

- Create: `test/e2e/flows.spec.ts`
- Create: `test/e2e/jobs.spec.ts`
- Create: `test/e2e/plugins.spec.ts`

**Step 1-3:** Create E2E tests.

**Step 4: Commit**

```bash
git add test/e2e/
git commit -m "test: add E2E tests"
```

---

### Task 5.4: 更新覆盖率配置

**Files:**

- Modify: `vitest.config.ts`

**Step 1: Add coverage thresholds**

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  include: ["lib/**", "components/**"],
  exclude: ["node_modules/", "test/", "lib/api/generated/"],
  thresholds: {
    statements: 60,
    branches: 50,
    functions: 60,
    lines: 60,
  },
}
```

**Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "test: configure coverage thresholds"
```

---

## Phase 6: 清理与优化 (1 天)

### Task 6.1: 清理未使用的代码

**Files:**

- Multiple files to clean up

**Step 1: Run linter and fix issues**

Run: `npm run lint`

**Step 2: Remove unused imports**

**Step 3: Remove console.log statements**

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: cleanup unused code and imports"
```

---

### Task 6.2: 更新文档

**Files:**

- Modify: `README.md`
- Create: `CHANGELOG.md`

**Step 1-2:** Update documentation.

**Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: update documentation for I01 improvements"
```

---

### Task 6.3: 性能验证

**Step 1: Run build**

Run: `npm run build`

Expected: Build succeeds without errors

**Step 2: Run tests**

Run: `npm test:run`

Expected: All tests pass, coverage >= 60%

**Step 3: Run E2E tests**

Run: `npx playwright test`

Expected: All E2E tests pass

**Step 4: Tag completion**

```bash
git tag -a v1.1.0 -m "Release v1.1.0 - I01 Improvements"
git push origin v1.1.0
```

---

## 实施总结

完成以上所有任务后，项目将实现：

1. ✅ APIClient 单例模式
2. ✅ QueryService 缓存和去重
3. ✅ 统一错误处理
4. ✅ WebSocket 指数退避重连和心跳检测
5. ✅ 插件管理 UI
6. ✅ 60%+ 测试覆盖率

总预计时间: 8-12 天
