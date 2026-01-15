// 插件系统初始化
// 在应用启动时调用，初始化 EventBus 和 StorageAPI

import { getEventBus, getStorageAPI, getPluginManager } from "./index";

/**
 * 初始化插件系统
 * 在应用启动时调用一次
 */
export function initPluginSystem(): void {
  // 初始化 EventBus
  if (!window.__OVERSEER_EVENT_BUS__) {
    window.__OVERSEER_EVENT_BUS__ = getEventBus();
    console.log("✅ Plugin System: EventBus initialized");
  }

  // 初始化 StorageAPI
  if (!window.__OVERSEER_STORAGE__) {
    window.__OVERSEER_STORAGE__ = getStorageAPI();
    console.log("✅ Plugin System: StorageAPI initialized");
  }

  // PluginManager 会在第一次调用 getPluginManager() 时初始化
  console.log("✅ Plugin System: Ready");
}

/**
 * 获取插件系统的统计信息
 */
export function getPluginSystemStats() {
  const pluginManager = getPluginManager();

  return {
    totalPlugins: pluginManager.getPlugins().length,
    enabledPlugins: pluginManager.getEnabledPlugins().length,
    disabledPlugins: pluginManager.getDisabledPlugins().length,
    builtinPlugins: pluginManager.getBuiltinPlugins().length,
    userPlugins: pluginManager.getUserPlugins().length,
  };
}
