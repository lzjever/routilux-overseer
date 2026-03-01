// PluginManager - 插件管理器
// 负责插件的注册、注销、启用、禁用

import { EventBus } from "./event-bus";
import { StorageAPI } from "./storage-api";
import { OverseerPlugin, PluginContext, PluginInfo, PluginStatus } from "./types";
import { getAPI } from "@/lib/services/api-client";
import { getConfirm } from "@/lib/confirm-bridge";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";

class PluginManager {
  private plugins: Map<string, PluginInfo> = new Map();
  private context: PluginContext | null = null;
  private eventBus: EventBus;
  private storage: StorageAPI;

  constructor(eventBus: EventBus, storage: StorageAPI) {
    this.eventBus = eventBus;
    this.storage = storage;
  }

  /**
   * 初始化插件上下文
   */
  private initContext(): PluginContext {
    if (this.context) return this.context;

    const api = getAPI();

    this.context = {
      events: this.eventBus,
      storage: this.storage,
      api: {
        flows: api.flows,
        jobs: api.jobs,
        breakpoints: api.breakpoints,
      },
      websocket: {
        on: (event: string, handler: (data: any) => void) => {
          return this.eventBus.on(event, handler);
        },
        emit: (event: string, data: any) => {
          this.eventBus.emit(event, data);
        },
      },
      ui: {
        toast: (message: string, type: "info" | "success" | "error" = "info") => {
          // TODO: 实现 toast 通知
          console.log(`[${type.toUpperCase()}] ${message}`);
        },
        confirm: (message: string) => getConfirm()(message),
      },
      state: {
        getConnection: () => ({
          connected: useConnectionStore.getState().connected,
          serverUrl: useConnectionStore.getState().serverUrl,
        }),
        getFlows: () => useFlowStore.getState().flows,
        getJobs: () => useJobStore.getState().jobs,
      },
    };

    return this.context;
  }

  /**
   * 注册插件
   * @param plugin 插件定义
   * @param builtin 是否为内置插件
   */
  async register(plugin: OverseerPlugin, builtin: boolean = false): Promise<void> {
    // 验证插件
    if (!plugin.id || !plugin.name || !plugin.version) {
      throw new Error(`Invalid plugin: ${JSON.stringify(plugin)}`);
    }

    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // 检查插件是否之前被卸载过（保留禁用状态）
    const savedStatus = this.loadPluginStatus(plugin.id);
    const status: PluginStatus = savedStatus || "installed";

    // 创建插件信息
    const pluginInfo: PluginInfo = {
      plugin,
      status,
      installedAt: new Date().toISOString(),
      builtin,
    };

    // 安装插件
    const context = this.initContext();
    try {
      await plugin.install(context);
      console.log(`Plugin "${plugin.id}" registered successfully`);
    } catch (error) {
      console.error(`Failed to install plugin "${plugin.id}":`, error);
      throw error;
    }

    // 保存到管理器
    this.plugins.set(plugin.id, pluginInfo);

    // 保存到存储
    this.savePluginInfo(pluginInfo);

    // 如果插件之前是禁用状态，禁用它
    if (status === "disabled") {
      await this.disable(plugin.id);
    }

    // 发布事件
    this.eventBus.emit("plugin:registered", {
      pluginId: plugin.id,
      pluginName: plugin.name,
      builtin,
    });
  }

  /**
   * 注销插件
   * @param pluginId 插件 ID
   */
  async unregister(pluginId: string): Promise<void> {
    const pluginInfo = this.plugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const { plugin } = pluginInfo;

    // 先禁用插件
    if (pluginInfo.status === "enabled") {
      await this.disable(pluginId);
    }

    // 卸载插件
    try {
      await plugin.uninstall();
      console.log(`Plugin "${pluginId}" unregistered successfully`);
    } catch (error) {
      console.error(`Failed to uninstall plugin "${pluginId}":`, error);
    }

    // 从管理器中移除
    this.plugins.delete(pluginId);

    // 从存储中移除
    this.removePluginInfo(pluginId);

    // 发布事件
    this.eventBus.emit("plugin:unregistered", {
      pluginId,
      pluginName: plugin.name,
    });
  }

  /**
   * 启用插件
   * @param pluginId 插件 ID
   */
  async enable(pluginId: string): Promise<void> {
    const pluginInfo = this.plugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (pluginInfo.status === "enabled") {
      console.warn(`Plugin "${pluginId}" is already enabled`);
      return;
    }

    const { plugin } = pluginInfo;

    // 调用插件的 enable 方法（如果有）
    if (plugin.enable) {
      try {
        await plugin.enable();
        console.log(`Plugin "${pluginId}" enabled`);
      } catch (error) {
        console.error(`Failed to enable plugin "${pluginId}":`, error);
        throw error;
      }
    }

    // 更新状态
    pluginInfo.status = "enabled";
    this.savePluginInfo(pluginInfo);

    // 发布事件
    this.eventBus.emit("plugin:enabled", {
      pluginId,
      pluginName: plugin.name,
    });
  }

  /**
   * 禁用插件
   * @param pluginId 插件 ID
   */
  async disable(pluginId: string): Promise<void> {
    const pluginInfo = this.plugins.get(pluginId);
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (pluginInfo.status === "disabled") {
      console.warn(`Plugin "${pluginId}" is already disabled`);
      return;
    }

    const { plugin } = pluginInfo;

    // 调用插件的 disable 方法（如果有）
    if (plugin.disable) {
      try {
        await plugin.disable();
        console.log(`Plugin "${pluginId}" disabled`);
      } catch (error) {
        console.error(`Failed to disable plugin "${pluginId}":`, error);
        throw error;
      }
    }

    // 更新状态
    pluginInfo.status = "disabled";
    this.savePluginInfo(pluginInfo);

    // 发布事件
    this.eventBus.emit("plugin:disabled", {
      pluginId,
      pluginName: plugin.name,
    });
  }

  /**
   * 获取所有插件
   */
  getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): PluginInfo[] {
    return this.getPlugins().filter((p) => p.status === "enabled");
  }

  /**
   * 获取已禁用的插件
   */
  getDisabledPlugins(): PluginInfo[] {
    return this.getPlugins().filter((p) => p.status === "disabled");
  }

  /**
   * 获取内置插件
   */
  getBuiltinPlugins(): PluginInfo[] {
    return this.getPlugins().filter((p) => p.builtin);
  }

  /**
   * 获取用户插件
   */
  getUserPlugins(): PluginInfo[] {
    return this.getPlugins().filter((p) => !p.builtin);
  }

  /**
   * 根据 ID 获取插件
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 检查插件是否已注册
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * 检查插件是否已启用
   */
  isEnabled(pluginId: string): boolean {
    const pluginInfo = this.plugins.get(pluginId);
    return pluginInfo?.status === "enabled";
  }

  /**
   * 保存插件信息到存储
   */
  private savePluginInfo(pluginInfo: PluginInfo): void {
    const { plugin, status, installedAt, builtin } = pluginInfo;

    // 保存插件状态
    this.storage.set(`plugin:${plugin.id}:status`, status);
    this.storage.set(`plugin:${plugin.id}:installed_at`, installedAt);
    this.storage.set(`plugin:${plugin.id}:builtin`, builtin);

    // 保存插件元数据（用于重启后恢复）
    this.storage.set(`plugin:${plugin.id}:metadata`, {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      homepage: plugin.homepage,
    });
  }

  /**
   * 从存储加载插件状态
   */
  private loadPluginStatus(pluginId: string): PluginStatus | null {
    return this.storage.get<PluginStatus>(`plugin:${pluginId}:status`);
  }

  /**
   * 从存储移除插件信息
   */
  private removePluginInfo(pluginId: string): void {
    this.storage.remove(`plugin:${pluginId}:status`);
    this.storage.remove(`plugin:${pluginId}:installed_at`);
    this.storage.remove(`plugin:${pluginId}:builtin`);
    this.storage.remove(`plugin:${pluginId}:metadata`);
  }

  /**
   * 从存储恢复所有插件（应用重启时调用）
   */
  async restorePlugins(pluginRegistry: OverseerPlugin[]): Promise<void> {
    const restoredPlugins: string[] = [];

    for (const plugin of pluginRegistry) {
      const metadata = this.storage.get(`plugin:${plugin.id}:metadata`);

      // 只有之前注册过的插件才恢复
      if (metadata) {
        try {
          await this.register(plugin, plugin.id.startsWith("builtin:"));
          restoredPlugins.push(plugin.id);
        } catch (error) {
          console.error(`Failed to restore plugin "${plugin.id}":`, error);
        }
      }
    }

    if (restoredPlugins.length > 0) {
      console.log(`Restored ${restoredPlugins.length} plugin(s):`, restoredPlugins);
    }
  }

  /**
   * 清空所有插件（主要用于测试）
   */
  async clear(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys());

    for (const pluginId of pluginIds) {
      try {
        await this.unregister(pluginId);
      } catch (error) {
        console.error(`Failed to unregister plugin "${pluginId}" during clear:`, error);
      }
    }

    this.plugins.clear();
  }
}

// 创建全局单例
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    const eventBus = window.__OVERSEER_EVENT_BUS__;
    const storage = window.__OVERSEER_STORAGE__;

    if (!eventBus || !storage) {
      throw new Error("EventBus and Storage must be initialized before PluginManager");
    }

    globalPluginManager = new PluginManager(eventBus, storage);
  }
  return globalPluginManager;
}

export { PluginManager };

// 声明全局类型
declare global {
  interface Window {
    __OVERSEER_EVENT_BUS__?: EventBus;
    __OVERSEER_STORAGE__?: StorageAPI;
  }
}
