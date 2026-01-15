# Routilux Overseer - 小而美设计文档

> 核心理念：最小化依赖，最大化可扩展性

**Version**: 2.0.0
**Last Updated**: 2025-01-15
**Design Philosophy**: Small, Beautiful, Extensible

---

## 🎯 设计理念

### 核心原则

1. **小 (Small)**
   - 核心功能精简，只做必须的事情
   - 零外部服务依赖
   - 轻量级部署

2. **美 (Beautiful)**
   - 简洁优雅的 UI/UX
   - 直观的交互设计
   - 高性能和流畅体验

3. **可扩展 (Extensible)**
   - 提供简单但强大的扩展机制
   - 用户可以轻松添加功能
   - 插件之间解耦

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                 Routilux Overseer (Core)                │
├─────────────────────────────────────────────────────────┤
│  核心功能层 (Core Features - Built-in)                   │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐            │
│  │Flow Visual│  │Job Monitor│  │Basic Debug│            │
│  │   -izer   │  │           │  │           │            │
│  └───────────┘  └──────────┘  └───────────┘            │
├─────────────────────────────────────────────────────────┤
│  扩展层 (Extension Layer - Plugins)                     │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Audit Plugin │  │Alert Plugin │  │Metrics Plugin │  │
│  │  (Optional)  │  │ (Optional)  │  │  (Optional)   │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
│  ┌──────────────┐  ┌─────────────┐                     │
│  │Custom Plugin │  │  Your Plugin│  ← 用户自定义       │
│  └──────────────┘  └─────────────┘                     │
├─────────────────────────────────────────────────────────┤
│  插件系统 (Plugin System - Infrastructure)              │
│  - Event Bus (事件总线)                                  │
│  - Storage API (存储接口)                                │
│  - UI Extension Points (UI 扩展点)                       │
│  - Lifecycle Hooks (生命周期钩子)                        │
├─────────────────────────────────────────────────────────┤
│  数据层 (Data Layer)                                    │
│  - LocalStorage (配置)                                   │
│  - IndexedDB (历史数据)                                  │
│  - Memory (运行时状态)                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 核心功能 (Core Features)

### 1. Flow 可视化 (必须保留)

**功能：**
- ✅ Flow 列表和详情查看
- ✅ 交互式 Flow 图（ReactFlow）
- ✅ Routine 依赖关系可视化
- ✅ 实时执行状态显示

**保留原因：** 这是理解和调试 Routilux 工作流的基础

### 2. Job 监控 (必须保留)

**功能：**
- ✅ Job 列表和详情
- ✅ 实时状态更新（WebSocket）
- ✅ Job 控制（Pause/Resume/Cancel）
- ✅ Event Log 显示

**保留原因：** 监控是运维的核心需求

### 3. 基础调试 (必须保留)

**功能：**
- ✅ 断点管理（设置/删除断点）
- ✅ 变量检查
- ✅ 单步执行（Resume/Step Over/Step Into）
- ✅ 调用栈查看

**保留原因：** 调试是开发者的核心需求

### 4. 连接管理 (必须保留)

**功能：**
- ✅ 服务器连接配置
- ✅ 连接状态显示
- ✅ 多服务器切换（LocalStorage 保存）

**保留原因：** 基础设施功能

---

## 🔌 插件系统 (Plugin System)

### 设计目标

- **简单**: 插件只需实现一个简单的接口
- **解耦**: 插件之间通过事件总线通信
- **轻量**: 插件按需加载，不影响核心性能

### 插件 API

```typescript
// 插件接口
interface OverseerPlugin {
  // 插件元数据
  id: string;                    // 唯一标识: "audit", "alert", "metrics"
  name: string;                  // 显示名称: "Audit Logger"
  version: string;               // 版本号: "1.0.0"
  description?: string;          // 描述
  author?: string;               // 作者

  // 生命周期钩子
  install(context: PluginContext): void | Promise<void>;
  uninstall(): void | Promise<void>;
  enable?(): void | Promise<void>;
  disable?(): void | Promise<void>;

  // 可选：UI 扩展
  ui?: {
    // 在 Navbar 添加按钮/图标
    navbarItem?: React.ReactNode;

    // 在页面路由添加新页面
    routes?: {
      path: string;
      component: React.ComponentType;
    }[];

    // 在 Job 详情页添加面板
    jobDetailPanel?: {
      id: string;
      title: string;
      component: React.ComponentType<{ jobId: string }>;
      order?: number;
    };
  };

  // 可选：存储配置
  storage?: {
    prefix: string;              // 存储键前缀，如 "audit:"
    useIndexedDB?: boolean;      // 是否使用 IndexedDB（默认 localStorage）
  };
}

// 插件上下文
interface PluginContext {
  // 事件总线
  events: EventBus;

  // 存储接口
  storage: StorageAPI;

  // Routilux API 客户端
  api: {
    flows: FlowsAPI;
    jobs: JobsAPI;
    debug: DebugAPI;
    breakpoints: BreakpointsAPI;
  };

  // WebSocket 访问
  websocket: {
    on(event: string, handler: Function): () => void;
    emit(event: string, data: any): void;
  };

  // UI 工具
  ui: {
    toast(message: string, type?: 'info' | 'success' | 'error'): void;
    confirm(message: string): Promise<boolean>;
  };

  // 状态访问（只读）
  state: {
    getConnection(): ConnectionState;
    getFlows(): Map<string, FlowResponse>;
    getJobs(): Map<string, JobResponse>;
  };
}
```

### 事件总线 (Event Bus)

```typescript
// 全局事件总线
class EventBus {
  // 订阅事件
  on(event: string, handler: Function): () => void;

  // 一次性订阅
  once(event: string, handler: Function): () => void;

  // 发布事件
  emit(event: string, data: any): void;

  // 取消订阅
  off(event: string, handler?: Function): void;
}

// 标准事件类型
type OverseerEvent =
  // 连接事件
  | "connection:connected"
  | "connection:disconnected"
  | "connection:error"

  // Job 事件
  | "job:started"
  | "job:completed"
  | "job:failed"
  | "job:paused"
  | "job:resumed"
  | "job:cancelled"

  // Routine 事件
  | "routine:started"
  | "routine:completed"
  | "routine:failed"

  // Debug 事件
  | "debug:breakpoint:hit"
  | "debug:step:completed"
  | "debug:variable:changed"

  // UI 事件
  | "ui:navigation"
  | "ui:job:selected"
  | "ui:flow:selected"

  // 插件事件（自定义）
  | `plugin:${string}:${string}`;
```

### 存储接口 (Storage API)

```typescript
interface StorageAPI {
  // 简单键值存储（LocalStorage）
  get<T>(key: string): T | null;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;

  // 大容量存储（IndexedDB）
  indexedDB: {
    get<T>(storeName: string, key: string): Promise<T | null>;
    set(storeName: string, key: string, value: any): Promise<void>;
    remove(storeName: string, key: string): Promise<void>;
    getAll(storeName: string): Promise<any[]>;
    clear(storeName: string): Promise<void>;
  };
}
```

### 插件示例

```typescript
// 示例：审计日志插件
const auditPlugin: OverseerPlugin = {
  id: "audit",
  name: "Audit Logger",
  version: "1.0.0",
  description: "记录所有操作历史",

  storage: {
    prefix: "audit:",
    useIndexedDB: true,
  },

  install(context) {
    // 订阅所有事件
    context.events.on("*", (event, data) => {
      this.logEvent(event, data);
    });
  },

  logEvent(event: string, data: any) {
    const record = {
      timestamp: new Date().toISOString(),
      event,
      data,
    };

    // 保存到 IndexedDB
    context.storage.indexedDB.set("audit_events", Date.now(), record);
  },

  ui: {
    routes: [
      {
        path: "/audit",
        component: AuditLogPage,
      },
    ],
    navbarItem: (
      <Link href="/audit">
        <FileText className="h-4 w-4" />
        <span>Audit</span>
      </Link>
    ),
  },
};

// 示例：告警插件
const alertPlugin: OverseerPlugin = {
  id: "alert",
  name: "Alert Manager",
  version: "1.0.0",

  install(context) {
    // 监听 Job 失败事件
    context.events.on("job:failed", (data) => {
      context.ui.toast(`Job ${data.job_id} failed!`, "error");
      // 可以添加发送邮件/Slack 通知的逻辑
    });
  },
};

// 示例：性能指标插件
const metricsPlugin: OverseerPlugin = {
  id: "metrics",
  name: "Performance Metrics",
  version: "1.0.0",

  install(context) {
    // 收集 Job 完成时间
    context.events.on("job:completed", async (data) => {
      const job = await context.api.jobs.get(data.job_id);
      const duration = calculateDuration(job);

      // 保存指标数据
      context.storage.indexedDB.set("metrics", data.job_id, {
        job_id: data.job_id,
        flow_id: job.flow_id,
        duration,
        timestamp: new Date().toISOString(),
      });
    });
  },

  ui: {
    jobDetailPanel: {
      id: "metrics",
      title: "Performance",
      component: MetricsPanel,
      order: 3,
    },
  },
};
```

### 插件管理器

```typescript
// lib/plugins/plugin-manager.ts
class PluginManager {
  private plugins: Map<string, OverseerPlugin> = new Map();
  private context: PluginContext;

  // 注册插件
  register(plugin: OverseerPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`);
    }
    this.plugins.set(plugin.id, plugin);
    plugin.install(this.context);
  }

  // 注销插件
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.uninstall();
      this.plugins.delete(pluginId);
    }
  }

  // 启用/禁用插件
  enable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    plugin?.enable?.();
  }

  disable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    plugin?.disable?.();
  }

  // 获取所有插件
  getPlugins(): OverseerPlugin[] {
    return Array.from(this.plugins.values());
  }

  // 获取启用的插件
  getEnabledPlugins(): OverseerPlugin[] {
    return this.getPlugins().filter((p) => this.isEnabled(p.id));
  }

  // 检查插件是否启用
  isEnabled(pluginId: string): boolean {
    return localStorage.getItem(`plugin:${pluginId}:enabled`) === "true";
  }
}
```

### 插件发现和加载

```typescript
// 1. 内置插件（从代码中加载）
import { auditPlugin } from "@/plugins/builtin/audit";
import { alertPlugin } from "@/plugins/builtin/alert";
import { metricsPlugin } from "@/plugins/builtin/metrics";

// 2. 用户自定义插件（从 LocalStorage 加载）
// 用户可以通过设置页面上传插件代码
const userPlugins = JSON.parse(localStorage.getItem("userPlugins") || "[]");

// 3. 插件管理页面（app/plugins/page.tsx）
// - 显示所有插件
// - 启用/禁用插件
// - 上传自定义插件
// - 查看插件详情
```

---

## 🏗️ 简化后的架构

### 技术栈（保持不变）

```
核心:
- Next.js 14
- React 18
- TypeScript 5

UI:
- shadcn/ui + Radix UI
- TailwindCSS
- Lucide Icons

可视化:
- ReactFlow

状态管理:
- Zustand (核心状态)
- EventBus (插件通信)

存储:
- LocalStorage (配置)
- IndexedDB (插件数据)
```

### 项目结构（简化）

```
routilux-overseer/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── flows/                    # Flow 管理
│   ├── jobs/                     # Job 管理
│   └── plugins/                  # 插件管理（新增）
│       └── page.tsx             # 插件管理页面
│
├── components/
│   ├── core/                     # 核心组件（保留）
│   │   ├── flow/
│   │   ├── jobs/
│   │   └── debug/
│   └── plugin/                   # 插件相关组件（新增）
│       ├── PluginManager.tsx
│       ├── PluginCard.tsx
│       └── PluginUpload.tsx
│
├── lib/
│   ├── plugins/                  # 插件系统（新增）
│   │   ├── plugin-manager.ts    # 插件管理器
│   │   ├── event-bus.ts         # 事件总线
│   │   ├── storage-api.ts       # 存储接口
│   │   └── types.ts             # 插件类型定义
│   │
│   └── plugins/
│       ├── builtin/             # 内置插件（新增）
│       │   ├── audit.ts        # 审计插件
│       │   ├── alert.ts        # 告警插件
│       │   └── metrics.ts      # 指标插件
│       └── user/               # 用户插件目录
│
├── plugins/                     # 插件示例（新增）
│   ├── README.md               # 插件开发指南
│   ├── examples/               # 示例插件
│   └── template.ts             # 插件模板
│
└── docs/
    ├── OVERSEER_MINIMAL_DESIGN.md   # 本文档
    ├── PLUGIN_API.md                # 插件 API 文档
    └── PLUGIN_DEVELOPMENT.md        # 插件开发教程
```

---

## 📋 实现计划

### Phase 1: 核心重构（当前）
- ✅ Flow 可视化
- ✅ Job 监控
- ✅ 基础调试
- ✅ 连接管理

### Phase 2: 插件系统（下一步）
**Week 1-2: 插件基础设施**
- [ ] EventBus 实现
- [ ] Storage API 实现
- [ ] PluginManager 实现
- [ ] 插件类型定义

**Week 3: 插件管理 UI**
- [ ] 插件管理页面
- [ ] 插件启用/禁用
- [ ] 插件上传功能

**Week 4: 内置插件**
- [ ] Audit Logger 插件
- [ ] Alert Manager 插件
- [ ] Metrics 插件

### Phase 3: 文档和示例
- [ ] 插件 API 文档
- [ ] 插件开发教程
- [ ] 示例插件集合

---

## 🎯 核心功能边界

### 包含在核心中

✅ **Flow 可视化** - 理解工作流的基础
✅ **Job 监控** - 实时状态和控制
✅ **基础调试** - 断点、变量、步进
✅ **事件流** - WebSocket 实时更新
✅ **连接管理** - 多服务器支持
✅ **插件系统** - 扩展基础设施

### 移到插件

❌ ~~审计日志~~ → Audit Plugin
❌ ~~告警系统~~ → Alert Plugin
❌ ~~性能分析~~ → Metrics Plugin
❌ ~~高级调试~~ → Advanced Debug Plugin
❌ ~~报表生成~~ → Report Plugin
❌ ~~权限管理~~ → Auth Plugin（如果有后端支持）

---

## 🔧 插件开发指南

### 创建一个简单的插件

```typescript
// 1. 定义插件
const myPlugin: OverseerPlugin = {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",

  install(context) {
    // 监听事件
    context.events.on("job:completed", (data) => {
      console.log("Job completed:", data);
    });

    // 使用存储
    context.storage.set("my-plugin:config", { foo: "bar" });
  },

  uninstall() {
    // 清理资源
  },
};

// 2. 注册插件
pluginManager.register(myPlugin);
```

### 创建带 UI 的插件

```typescript
const uiPlugin: OverseerPlugin = {
  id: "ui-plugin",
  name: "UI Plugin",
  version: "1.0.0",

  ui: {
    // 添加导航栏项
    navbarItem: (
      <Link href="/my-page">
        <Icon />
        <span>My Page</span>
      </Link>
    ),

    // 添加新路由
    routes: [
      {
        path: "/my-page",
        component: MyPageComponent,
      },
    ],

    // 在 Job 详情页添加面板
    jobDetailPanel: {
      id: "my-panel",
      title: "My Panel",
      component: MyPanelComponent,
    },
  },

  install(context) {
    // 初始化逻辑
  },
};
```

---

## 📊 对比：大而全 vs 小而美

| 方面 | 大而全（之前的设计） | 小而美（新设计） |
|------|---------------------|-----------------|
| **核心代码量** | ~10,000+ 行 | ~5,000 行 |
| **依赖数量** | 15+ | 10 |
| **学习曲线** | 陡峭 | 平缓 |
| **启动时间** | 较慢 | 快速 |
| **可扩展性** | 需要修改核心代码 | 通过插件扩展 |
| **维护成本** | 高 | 低 |
| **用户群体** | 企业用户 | 个人开发者 + 小团队 |
| **部署复杂度** | 中等 | 简单 |

---

## 🎓 设计理念总结

### 小而美的优势

1. **更易维护**
   - 核心代码少，bug 少
   - 清晰的边界，职责分明

2. **更易扩展**
   - 插件系统提供统一的扩展点
   - 用户不需要修改核心代码

3. **更易学习**
   - 核心概念少
   - 渐进式功能发现

4. **更高性能**
   - 只加载需要的功能
   - 插件按需启用

5. **更强灵活性**
   - 用户选择需要的功能
   - 自定义插件满足特殊需求

---

## 📝 总结

**Routilux Overseer 的定位：**

> 一个轻量级、可扩展的 Routilux 工作流可视化和调试工具，提供核心功能和强大的插件系统，让用户可以根据需求自由扩展。

**核心价值：**

- **Small**: 核心功能精简，只做必须的事情
- **Beautiful**: 简洁优雅的 UI 和交互
- **Extensible**: 强大的插件系统，无限扩展可能

**目标用户：**

- 个人开发者
- 小团队
- 需要自定义功能的企业用户（通过插件）

---

**文档版本**: 2.0.0
**设计者**: Claude Code
**最后更新**: 2025-01-15
