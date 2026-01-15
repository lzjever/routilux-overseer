"use client";

import { useEffect } from "react";
import { initPluginSystem } from "@/lib/plugins/init";
import { getPluginManager } from "@/lib/plugins";
import { getBuiltinPlugins } from "@/lib/plugins/registry";

/**
 * 插件系统提供者
 * 在应用根组件中使用，初始化插件系统
 */
export function PluginSystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化插件系统
    initPluginSystem();

    // 注册内置插件
    const registerBuiltinPlugins = async () => {
      const pluginManager = getPluginManager();
      const builtinPlugins = getBuiltinPlugins();

      for (const plugin of builtinPlugins) {
        try {
          // 检查插件是否已注册
          if (!pluginManager.hasPlugin(plugin.id)) {
            await pluginManager.register(plugin, true);
            console.log(`✅ Builtin plugin registered: ${plugin.name} (${plugin.id})`);
          }
        } catch (error) {
          console.error(`❌ Failed to register builtin plugin ${plugin.id}:`, error);
        }
      }
    };

    registerBuiltinPlugins();

    // 将插件系统暴露到 window（用于开发调试）
    if (typeof window !== "undefined") {
      (window as any).__OVERSEER_PLUGINS__ = {
        getManager: () => getPluginManager(),
        getStats: () => {
          const manager = getPluginManager();
          return {
            total: manager.getPlugins().length,
            enabled: manager.getEnabledPlugins().length,
            disabled: manager.getDisabledPlugins().length,
            builtin: manager.getBuiltinPlugins().length,
            user: manager.getUserPlugins().length,
          };
        },
      };
    }
  }, []);

  return <>{children}</>;
}
