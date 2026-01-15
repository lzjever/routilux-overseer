// 插件注册表
// 用于注册所有内置插件

import type { OverseerPlugin } from "./types";
import helloWorldPlugin from "./examples/hello-world-plugin";

/**
 * 内置插件列表
 */
export const builtinPlugins: OverseerPlugin[] = [
  // 添加内置插件到这里
  helloWorldPlugin,
  // TODO: 后续添加
  // auditPlugin,
  // alertPlugin,
  // metricsPlugin,
];

/**
 * 获取所有内置插件
 */
export function getBuiltinPlugins(): OverseerPlugin[] {
  return builtinPlugins;
}

/**
 * 根据 ID 获取内置插件
 */
export function getBuiltinPlugin(id: string): OverseerPlugin | undefined {
  return builtinPlugins.find((p) => p.id === id);
}
