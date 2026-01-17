# Routilux Overseer

> 🌿 **A Small, Beautiful, and Extensible Debugger for Routilux Workflows**

**Routilux Overseer** 是一个轻量级、可扩展的 Routilux 工作流可视化和调试工具。核心理念是"**小而美**" - 提供精简的核心功能和强大的插件系统，让用户可以根据需求自由扩展。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)]()
[![Design](https://img.shields.io/badge/design-small--beautiful-green)]()

---

## ✨ 设计理念

### 🎯 小而美 (Small & Beautiful)

| 原则 | 说明 |
|------|------|
| **Small (小)** | 核心功能精简，只做必须的事情，零外部依赖 |
| **Beautiful (美)** | 简洁优雅的 UI/UX，直观的交互设计 |
| **Extensible (可扩展)** | 提供简单但强大的插件系统 |

### 📦 核心功能

| 功能模块 | 说明 | 状态 |
|---------|------|------|
| **🔍 Flow 可视化** | 交互式 Flow 图，依赖关系可视化 | ✅ 已实现 |
| **🎮 Job 监控** | 实时状态监控，Job 控制 | ✅ 已实现 |
| **🐛 基础调试** | 断点、变量检查、单步执行 | ✅ 已实现 |
| **📡 实时事件** | WebSocket 实时更新 | ✅ 已实现 |
| **🔍 全局搜索** | 命令面板式搜索 (Cmd/Ctrl+K) | ✅ 已实现 |
| **🔄 Discovery 同步** | 从全局注册表同步 Flows 和 Jobs | ✅ 已实现 |
| **📊 批量操作** | Flows 和 Jobs 的批量选择和操作 | ✅ 已实现 |
| **📈 数据可视化** | 图表组件 (Line, Bar, Pie, Sparkline) | ✅ 已实现 |
| **🔌 插件系统** | 灵活的扩展机制 | 🚧 开发中 |

### 🔌 可选插件

通过插件系统扩展功能（用户可自选）：

| 插件 | 说明 | 状态 |
|------|------|------|
| **📋 Audit Logger** | 操作审计日志 | 📝 计划中 |
| **🔔 Alert Manager** | 智能告警 | 📝 计划中 |
| **📊 Metrics Collector** | 性能指标收集 | 📝 计划中 |

---

## 🎨 技术栈

### 前端技术栈

```
Core Framework:
- Next.js 14 (App Router)
- React 18
- TypeScript 5.0

UI & Styling:
- shadcn/ui + Radix UI
- TailwindCSS
- Lucide Icons

Visualization:
- ReactFlow (Flow 图可视化)
- Dagre (自动布局)

State Management:
- Zustand (全局状态 + 持久化)

Real-time Communication:
- WebSocket (实时事件流)
```

### 后端集成

```
API Client:
- REST API (Routilux HTTP API)
- WebSocket (实时事件)

Storage:
- LocalStorage (配置持久化)
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Routilux 服务器运行在 `http://localhost:20555` (默认)

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/routilux-overseer.git
cd routilux-overseer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将运行在 http://localhost:3000

### 连接到 Routilux 服务器

1. 打开浏览器访问 http://localhost:3000
2. 点击 "Connect to Server"
3. 输入 Routilux API 地址（默认：`http://localhost:20555`）
4. 点击 "Connect"

---

## 📖 功能指南

### 1. Dashboard (仪表盘)

**全局总览页面 - 了解系统整体状况**

- 📊 **系统健康卡片**: 显示关键指标
  - 总 Flows / Jobs 数量
  - 运行状态统计
  - 失败率趋势

- 🔴 **实时活动流**: 最近的事件（WebSocket 实时更新）

- ⚡ **快捷操作**: 快速启动常用 Flow

**访问**: http://localhost:3000

---

### 2. Flows (Flow 管理)

**Flow 工作室 - 可视化管理所有工作流**

**功能**:
- 📋 Flow 列表：查看所有已注册的 Flows
- 🔍 Flow 详情：
  - 交互式 Flow 图（ReactFlow）
  - Routine 依赖关系可视化
  - 实时执行状态显示
- ▶️ 快速启动 Job

**导航**:
- Flow 列表: http://localhost:3000/flows
- Flow 详情: http://localhost:3000/flows/{flow_id}

---

### 3. Jobs (Job 管理)

**Job 管理器 - 全方位的 Job 生命周期管理**

**功能**:
- 📊 Job 列表：所有 Job 的状态
- 🔄 实时状态更新（WebSocket）
- ⏸️ Job 控制：
  - Pause / Resume / Cancel
  - 查看执行详情
- 📈 **实时监控**:
  - Event Log（事件日志）
  - Metrics Panel（性能指标）
  - Flow Visualization（可视化执行过程）

**导航**: http://localhost:3000/jobs

---

### 4. Debug Studio (调试工作室)

**强大的调试工具集**

**功能模块**:

#### 4.1 Breakpoints (断点管理)
- 🎯 添加断点：
  - Routine 级别断点
  - Slot 断点（输入）
  - Event 断点（输出）
- 🔧 断点控制：
  - 启用/禁用
  - 删除断点
  - 查看命中次数

#### 4.2 Variables (变量检查)
- 🔍 实时查看 Routine 变量
- 📊 变量类型识别
- 🔄 手动刷新

#### 4.3 Step Execution (单步执行)
- ⏯️ Resume（继续执行）
- ⏭️ Step Over（单步跳过）
- 🔽 Step Into（单步进入）

**访问**: 在 Job 详情页点击 "Show Debug Panel"

---

## 🏗️ 项目结构

```
routilux-overseer/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx             # Dashboard (主页)
│   ├── connect/             # 连接页面
│   ├── flows/               # Flow 管理
│   │   ├── page.tsx         # Flow 列表
│   │   └── [flowId]/        # Flow 详情
│   └── jobs/                # Job 管理
│       ├── page.tsx         # Job 列表
│       └── [jobId]/         # Job 详情 + 调试
│
├── components/               # React 组件
│   ├── layout/              # 布局组件
│   │   └── Navbar.tsx      # 导航栏
│   ├── flow/               # Flow 相关组件
│   │   ├── FlowCanvas.tsx   # Flow 画布
│   │   ├── RoutineNode.tsx  # Routine 节点
│   │   └── ConnectionEdge.tsx # 连接线
│   ├── monitoring/          # 监控组件
│   │   ├── MetricsPanel.tsx
│   │   └── EventLog.tsx
│   └── debug/               # 调试组件
│       ├── BreakpointControls.tsx
│       ├── VariableInspector.tsx
│       └── StepExecutionControls.tsx
│
├── lib/                     # 核心逻辑
│   ├── api/                 # API 客户端
│   │   ├── client.ts        # HTTP 客户端
│   │   ├── flows.ts         # Flow API
│   │   ├── jobs.ts          # Job API
│   │   ├── debug.ts         # Debug API
│   │   └── breakpoints.ts   # Breakpoint API
│   │
│   ├── stores/              # Zustand 状态管理
│   │   ├── connectionStore.ts    # 连接状态
│   │   ├── flowStore.ts          # Flow 状态
│   │   ├── jobStore.ts           # Job 状态
│   │   ├── jobEventsStore.ts     # Job 事件
│   │   └── breakpointStore.ts    # 断点状态
│   │
│   ├── websocket/           # WebSocket 客户端
│   │   ├── websocket-manager.ts
│   │   └── job-monitor.ts
│   │
│   └── utils/               # 工具函数
│       └── flow-layout.ts   # Dagre 布局
│
└── public/                  # 静态资源
```

---

## 🎯 核心设计理念

### 从 Debugger 到 Overseer

**定位升级**:

| 维度 | Debugger | Overseer |
|------|----------|----------|
| 核心定位 | 调试工具 | 审计、管理和监控平台 |
| 目标用户 | 开发者 | 开发者 + 运维 + SRE |
| 使用场景 | 开发时调试 | 生产环境全生命周期 |
| 功能范围 | Flow 可视化、断点 | 审计、监控、告警、调试、优化 |

**核心价值**:

1. **Observe (观察)**: 实时监控系统状态
2. **Analyze (分析)**: 深入分析性能与问题
3. **Act (行动)**: 快速响应和调试
4. **Optimize (优化)**: 持续改进和优化

---

## 🔧 开发指南

### 添加新功能

```typescript
// 1. 在 lib/stores/ 添加新的 Zustand store
import { create } from "zustand";

export const useMyStore = create((set) => ({
  data: [],
  fetchData: async () => {
    // 实现
  },
}));

// 2. 在 components/ 创建组件
export function MyComponent() {
  const { data } = useMyStore();
  return <div>{/* UI */}</div>;
}

// 3. 在 app/ 添加页面
export default function MyPage() {
  return (
    <div>
      <Navbar />
      <MyComponent />
    </div>
  );
}
```

### 添加 API 端点

```typescript
// lib/api/myapi.ts
export class MyAPI {
  constructor(private client: APIClient) {}

  async getData() {
    return this.client.get("/api/my-endpoint");
  }
}

// lib/api/index.ts
export function createAPI(baseURL: string) {
  return {
    // ...existing APIs
    myapi: new MyAPI(client),
  };
}
```

---

## 📊 开发路线图

### Phase 1: 核心功能 ✅ (已完成)
- ✅ Flow 可视化
- ✅ Job 监控
- ✅ 基础调试
- ✅ 实时事件流
- ✅ 连接管理

### Phase 2: 插件系统 🚧 (开发中)
- [ ] EventBus 事件总线
- [ ] Storage API 存储接口
- [ ] PluginManager 插件管理器
- [ ] 插件管理 UI

### Phase 3: 内置插件 📝 (计划中)
- [ ] Audit Logger（审计日志）
- [ ] Alert Manager（告警管理）
- [ ] Metrics Collector（指标收集）

### Phase 4: 生态建设 ⏳ (未来)
- [ ] 插件开发文档
- [ ] 插件示例集合
- [ ] 社区插件市场（可选）

---

## 📚 文档

### 核心文档

- **[OVERSEER_MINIMAL_DESIGN.md](OVERSEER_MINIMAL_DESIGN.md)** - 小而美设计文档
  - 设计理念
  - 插件系统架构
  - 扩展机制详解

- **[ROUTILUX_API_ANALYSIS.md](ROUTILUX_API_ANALYSIS.md)** - Routilux API 分析
  - API 完整性评估
  - 改进建议
  - 实现策略

### 历史文档（参考）

- **[OVERSEER_ARCHITECTURE.md](OVERSEER_ARCHITECTURE.md)** - 早期的企业级设计（已废弃）
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - 详细的实施计划（部分过时）

---

## 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系我们

- **问题反馈**: [GitHub Issues](https://github.com/your-org/routilux-overseer/issues)
- **功能建议**: [GitHub Discussions](https://github.com/your-org/routilux-overseer/discussions)

---

## 🙏 致谢

- [Routilux](https://github.com/lzjever/routilux) - 优秀的工作流编排框架，提供了完善且易用的 API
- [Next.js](https://nextjs.org/) - React 框架
- [ReactFlow](https://reactflow.dev/) - Flow 图可视化
- [shadcn/ui](https://ui.shadcn.com/) - 优美的 UI 组件库

---

## 🌟 核心价值

> **Small is Beautiful. Less is More.**

Routilux Overseer 遵循"小而美"的设计哲学：
- **专注核心**：只做最需要的功能，保持简洁
- **易于扩展**：强大的插件系统，按需扩展
- **零依赖**：不依赖外部服务，开箱即用
- **高性能**：轻量级设计，快速响应

---

**Built with ❤️ using Claude Code**

*Small, Beautiful, Extensible - A Debugger for Routilux Workflows*

