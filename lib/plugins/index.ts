// 插件系统统一导出

export { EventBus, getEventBus } from "./event-bus";
export type { EventHandler, EventType } from "./event-bus";

export { StorageAPI, LocalStorageAPI, IndexedDBAPI, getStorageAPI } from "./storage-api";

export { PluginManager, getPluginManager } from "./plugin-manager";

export type {
  PluginContext,
  PluginUI,
  PluginRoute,
  PluginPanel,
  PluginStorage,
  OverseerPlugin,
  PluginStatus,
  PluginInfo,
} from "./types";
