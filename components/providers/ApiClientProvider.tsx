"use client";

import { useEffect } from "react";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { configureAPI } from "@/lib/services/api-client";

/**
 * API 客户端提供者
 *
 * 在应用启动时，如果存在已保存的连接信息，自动配置 API 客户端
 * 这样页面刷新后不需要重新连接
 */
export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { serverUrl, connected, hydrated } = useConnectionStore();

  useEffect(() => {
    // Wait for hydration to complete and check if we have a saved connection
    if (hydrated && serverUrl && connected) {
      // Configure the API client with the saved server URL
      // Note: apiKey is not persisted for security, so user may need to re-enter it
      try {
        configureAPI(serverUrl);
        console.log("[ApiClientProvider] Restored API client configuration for:", serverUrl);
      } catch (error) {
        console.error("[ApiClientProvider] Failed to configure API client:", error);
      }
    }
  }, [hydrated, serverUrl, connected]);

  return <>{children}</>;
}
