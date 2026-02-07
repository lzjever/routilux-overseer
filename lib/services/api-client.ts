import { OpenAPI } from '../api/generated';
import { createAPI, type API } from '../api/index';

// Re-export API type for use by other modules
export type { API };

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

      OpenAPI.BASE = serverUrl.replace(/\/$/, '');
      if (this.apiKey) {
        OpenAPI.HEADERS = { 'X-API-Key': this.apiKey };
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
      throw new Error('APIClient not configured. Call configure() first.');
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
    OpenAPI.BASE = '';
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
