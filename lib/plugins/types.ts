// 插件类型定义

import { ReactNode, ComponentType } from "react";
import { EventBus } from "./event-bus";
import { StorageAPI } from "./storage-api";
import type { API } from "@/lib/api";

/**
 * 插件上下文
 * 提供给插件安装时使用的所有接口
 */
export interface PluginContext {
  /**
   * 事件总线
   * 用于订阅和发布事件
   */
  events: EventBus;

  /**
   * 存储接口
   * 提供统一的存储 API
   */
  storage: StorageAPI;

  /**
   * Routilux API 客户端（createAPI 的返回值）
   */
  api: Pick<API, "flows" | "jobs" | "debug" | "breakpoints">;

  /**
   * WebSocket 访问
   */
  websocket: {
    /**
     * 订阅 WebSocket 事件
     * @param event 事件名称
     * @param handler 处理函数
     * @returns 取消订阅的函数
     */
    on(event: string, handler: (data: any) => void): () => void;

    /**
     * 发送 WebSocket 消息（如果支持）
     * @param event 事件名称
     * @param data 数据
     */
    emit(event: string, data: any): void;
  };

  /**
   * UI 工具
   */
  ui: {
    /**
     * 显示提示消息
     * @param message 消息内容
     * @param type 消息类型
     */
    toast(message: string, type?: "info" | "success" | "error"): void;

    /**
     * 显示确认对话框
     * @param message 确认消息
     * @returns Promise<boolean> 用户选择
     */
    confirm(message: string): Promise<boolean>;
  };

  /**
   * 状态访问（只读）
   */
  state: {
    /**
     * 获取连接状态
     */
    getConnection(): {
      connected: boolean;
      serverUrl: string | null;
    };

    /**
     * 获取所有 Flows
     */
    getFlows(): Map<string, import("@/lib/types/api").FlowResponse>;

    /**
     * 获取所有 Jobs
     */
    getJobs(): Map<string, import("@/lib/types/api").JobResponse>;
  };
}

/**
 * UI 扩展定义
 */
export interface PluginUI {
  /**
   * 在导航栏添加按钮/图标
   */
  navbarItem?: ReactNode;

  /**
   * 在页面路由添加新页面
   */
  routes?: PluginRoute[];

  /**
   * 在 Job 详情页添加面板
   */
  jobDetailPanel?: PluginPanel;
}

/**
 * 插件路由定义
 */
export interface PluginRoute {
  /**
   * 路由路径
   */
  path: string;

  /**
   * 路由组件
   */
  component: ComponentType<any>;

  /**
   * 路由标题（可选）
   */
  title?: string;
}

/**
 * 插件面板定义
 */
export interface PluginPanel {
  /**
   * 面板唯一标识
   */
  id: string;

  /**
   * 面板标题
   */
  title: string;

  /**
   * 面板组件
   * 接收 props: { jobId: string }
   */
  component: ComponentType<{ jobId: string }>;

  /**
   * 显示顺序（数字越小越靠前）
   */
  order?: number;
}

/**
 * 存储配置
 */
export interface PluginStorage {
  /**
   * 存储键前缀
   * 避免不同插件之间的键名冲突
   */
  prefix: string;

  /**
   * 是否使用 IndexedDB（默认使用 LocalStorage）
   */
  useIndexedDB?: boolean;
}

/**
 * 插件接口定义
 */
export interface OverseerPlugin {
  /**
   * 插件唯一标识
   * 建议: "author-plugin-name"
   * 示例: "audit", "alert", "mycompany-custom"
   */
  id: string;

  /**
   * 插件显示名称
   */
  name: string;

  /**
   * 插件版本号
   * 遵循语义化版本: https://semver.org/
   * 示例: "1.0.0", "2.1.0-beta"
   */
  version: string;

  /**
   * 插件描述（可选）
   */
  description?: string;

  /**
   * 插件作者（可选）
   */
  author?: string;

  /**
   * 插件主页（可选）
   */
  homepage?: string;

  /**
   * 安装插件
   * 在插件注册时调用
   * @param context 插件上下文
   */
  install(context: PluginContext): void | Promise<void>;

  /**
   * 卸载插件
   * 在插件注销时调用
   * 清理资源、事件监听器等
   */
  uninstall(): void | Promise<void>;

  /**
   * 启用插件（可选）
   * 在插件被启用时调用
   */
  enable?(): void | Promise<void>;

  /**
   * 禁用插件（可选）
   * 在插件被禁用时调用
   */
  disable?(): void | Promise<void>;

  /**
   * UI 扩展（可选）
   */
  ui?: PluginUI;

  /**
   * 存储配置（可选）
   */
  storage?: PluginStorage;
}

/**
 * 插件状态
 */
export type PluginStatus = "installed" | "enabled" | "disabled";

/**
 * 插件信息（包含状态）
 */
export interface PluginInfo {
  /**
   * 插件定义
   */
  plugin: OverseerPlugin;

  /**
   * 插件状态
   */
  status: PluginStatus;

  /**
   * 安装时间
   */
  installedAt: string;

  /**
   * 是否为内置插件
   */
  builtin: boolean;
}
