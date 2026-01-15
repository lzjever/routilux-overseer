# Claude Code 项目追踪文档

## 项目概述

**项目名称**: Routilux Overseer
**定位**: 全方位的 Routilux 工作流审计、管理和调试平台
**版本**: v1.0.0
**开发状态**: Phase 1 完成，Phase 2 规划中

---

## 核心理念

### 产品定位升级

从 **Debugger** 到 **Overseer** 的升级：
- **Debugger**: 简单的调试工具，主要用于开发时调试
- **Overseer**: 企业级的全生命周期管理平台，覆盖审计、监控、告警、调试、优化

### 核心价值循环

```
Observe (观察) → Analyze (分析) → Act (行动) → Optimize (优化)
```

---

## 技术架构

### 技术栈

```
前端框架: Next.js 14 (App Router)
编程语言: TypeScript 5.0
状态管理: Zustand
UI框架: shadcn/ui + Radix UI
样式方案: TailwindCSS
可视化: ReactFlow (Flow图) + Dagre (布局)
实时通信: WebSocket
图标库: Lucide React
日期处理: date-fns
```

### 项目结构

```
routilux-overseer/
├── app/                           # Next.js App Router 页面
│   ├── page.tsx                  # Dashboard (主页)
│   ├── layout.tsx                # 根布局
│   ├── connect/                  # 连接页面
│   ├── flows/                    # Flow 管理
│   │   ├── page.tsx              # Flow 列表
│   │   └── [flowId]/            # Flow 详情页
│   └── jobs/                     # Job 管理
│       ├── page.tsx              # Job 列表
│       └── [jobId]/              # Job 详情 + 调试
│
├── components/                    # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── layout/                   # 布局组件
│   │   └── Navbar.tsx           # 全局导航栏
│   ├── flow/                     # Flow 相关组件
│   │   ├── FlowCanvas.tsx       # Flow 画布组件
│   │   ├── RoutineNode.tsx      # Routine 节点组件
│   │   └── ConnectionEdge.tsx    # 连接线组件
│   ├── monitoring/               # 监控组件
│   │   ├── MetricsPanel.tsx     # 性能指标面板
│   │   └── EventLog.tsx         # 事件日志组件
│   └── debug/                    # 调试组件
│       ├── BreakpointControls.tsx   # 断点管理
│       ├── VariableInspector.tsx    # 变量检查器
│       └── StepExecutionControls.tsx # 单步执行控制
│
├── lib/                          # 核心逻辑
│   ├── api/                      # API 客户端
│   │   ├── client.ts             # HTTP 客户端基类
│   │   ├── index.ts              # API 统一导出
│   │   ├── flows.ts              # Flow API
│   │   ├── jobs.ts               # Job API
│   │   ├── debug.ts              # Debug API
│   │   └── breakpoints.ts        # Breakpoint API
│   │
│   ├── stores/                   # Zustand 状态管理
│   │   ├── connectionStore.ts   # 连接状态（持久化）
│   │   ├── flowStore.ts         # Flow 状态
│   │   ├── jobStore.ts          # Job 状态
│   │   ├── jobEventsStore.ts     # Job 事件存储
│   │   └── breakpointStore.ts    # 断点状态
│   │
│   ├── websocket/                # WebSocket 客户端
│   │   ├── websocket-manager.ts # WebSocket 管理器
│   │   └── job-monitor.ts        # Job 监听器
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   ├── api.ts                # API 类型
│   │   └── flow.ts               # Flow 相关类型
│   │
│   └── utils/                    # 工具函数
│       └── flow-layout.ts        # Dagre 布局算法
│
├── public/                       # 静态资源
│   └── fonts/                    # 字体文件（如有）
│
├── styles/                       # 全局样式
│   └── globals.css               # 全局 CSS
│
├── OVERSEER_ARCHITECTURE.md     # 架构设计文档
├── IMPLEMENTATION_PLAN.md       # 详细实施计划
├── README.md                     # 项目说明
├── DEBUGGER_SETUP.md            # 调试设置
├── CLAUDE.md                     # 本文档
└── package.json                 # 项目配置
```

---

## API 集成

### Routilux API 端点

```typescript
// Flow API
GET    /api/flows              # 列出所有 Flows
GET    /api/flows/{flow_id}    # 获取 Flow 详情

// Job API
GET    /api/jobs               # 列出所有 Jobs
GET    /api/jobs/{job_id}      # 获取 Job 详情
POST   /api/jobs               # 启动新 Job
PATCH  /api/jobs/{job_id}/pause    # 暂停 Job
PATCH  /api/jobs/{job_id}/resume   # 恢复 Job
DELETE /api/jobs/{job_id}/cancel   # 取消 Job

// Debug API
GET    /api/jobs/{job_id}/debug/session     # 获取调试会话
POST   /api/jobs/{job_id}/debug/resume     # 恢复执行
POST   /api/jobs/{job_id}/debug/step-over   # 单步跳过
POST   /api/jobs/{job_id}/debug/step-into   # 单步进入
GET    /api/jobs/{job_id}/debug/variables  # 获取变量
PUT    /api/jobs/{job_id}/debug/variables/{name}  # 设置变量
GET    /api/jobs/{job_id}/debug/call-stack   # 获取调用栈

// Breakpoint API
GET    /api/jobs/{job_id}/breakpoints           # 列出断点
POST   /api/jobs/{job_id}/breakpoints           # 创建断点
PATCH  /api/jobs/{job_id}/breakpoints/{bp_id}  # 更新断点
DELETE /api/jobs/{job_id}/breakpoints/{bp_id}  # 删除断点

// WebSocket
WS     /ws                   # WebSocket 端点（实时事件）
```

---

## 数据流设计

### 1. WebSocket 事件流

```typescript
// Job 生命周期事件
{
  type: "job_started" | "job_completed" | "job_failed" | "job_paused" | "job_resumed" | "job_cancelled",
  job_id: string,
  timestamp: string,
  data: any
}

// Routine 事件
{
  type: "routine_started" | "routine_completed" | "routine_failed",
  job_id: string,
  timestamp: string,
  data: {
    routine_id: string,
    // ...
  }
}

// 操作事件
{
  type: "event_emitted" | "slot_called" | "breakpoint_hit" | "error",
  job_id: string,
  timestamp: string,
  data: {
    routine_id: string,
    event_name?: string,
    slot_name?: string,
    // ...
  }
}
```

### 2. 状态管理（Zustand）

**connectionStore**:
```typescript
{
  connected: boolean,        // 已连接
  serverUrl: string,         // 服务器地址
  connecting: boolean,       // 连接中
  error: string | null,      // 错误信息
  lastConnected: string | null  // 最后连接时间
}
```

**flowStore**:
```typescript
{
  flows: Map<string, Flow>,           // 所有 Flows
  selectedFlowId: string | null,      // 当前选中的 Flow
  nodes: Node[],                      // ReactFlow 节点
  edges: Edge[],                      // ReactFlow 边
  loading: boolean
}
```

**jobStore**:
```typescript
{
  jobs: Map<string, Job>,             // 所有 Jobs
  wsConnected: boolean,              // WebSocket 已连接
  loading: boolean
}
```

**jobEventsStore**:
```typescript
{
  events: Map<string, ExecutionRecord[]>,  // jobId -> events
  maxEventsPerJob: 100  // 每个 Job 最多保存 100 条事件
}
```

**breakpointStore**:
```typescript
{
  breakpoints: Map<string, Breakpoint[]>,  // jobId -> breakpoints
  loading: boolean
}
```

---

## 已实现功能（Phase 1）

### ✅ 1. Dashboard (仪表盘)
- 系统健康卡片（Flows/Jobs 统计）
- 实时活动流（最近事件）
- 快捷操作（启动常用 Flow）

### ✅ 2. Flow Studio (Flow 工作室)
- Flow 列表展示
- Flow 可视化（ReactFlow）
  - Routine 节点（三栏设计：Inputs - Content - Outputs）
  - 连接线（Event → Slot）
- 自动布局（Dagre）
- 节点可拖动
- 快速启动 Job

### ✅ 3. Job Manager (Job 管理器)
- Job 列表（实时更新）
- Job 详情页
  - Flow 可视化（执行状态）
  - Metrics Panel（性能指标）
  - Event Log（事件日志）
- Job 控制（Pause/Resume/Cancel）
- WebSocket 实时监控

### ✅ 4. Debug Studio (调试工作室)
- 断点管理
  - Routine / Slot / Event 断点
  - 启用/禁用/删除
- 变量检查器
- 单步执行控制（Resume/Step Over/Step Into）

### ✅ 5. 连接管理
- 服务器连接配置
- 连接状态持久化
- 全局导航栏
- 重新连接功能

---

## 规划中功能（Phase 2+）

### 🚧 Phase 2: 审计与告警

**Audit Center (审计中心)**:
- [ ] 操作审计日志
- [ ] 时间线视图
- [ ] 合规性报告
- [ ] 搜索与过滤
- [ ] 数据导出

**Alert Console (告警控制台)**:
- [ ] 告警规则配置
- [ ] 告警渠道集成（Email/Slack/Webhook）
- [ ] 告警历史
- [ ] 告警降噪

### ⏳ Phase 3: 高级分析

**Performance Analytics (性能分析)**:
- [ ] Flow 性能分析
- [ ] Job 性能洞察（P50/P95/P99）
- [ ] 资源使用分析
- [ ] 性能对比

**高级功能**:
- [ ] 自定义仪表盘
- [ ] 报表生成
- [ ] 数据导出

### ⏳ Phase 4: 企业功能

- [ ] 权限管理（RBAC）
- [ ] 多租户支持
- [ ] SSO 集成
- [ ] API Keys 管理

### ⏳ Phase 5: 高级特性

- [ ] 时间旅行调试
- [ ] AI 辅助调试
- [ ] 自动化测试
- [ ] CI/CD 集成

---

## 开发指南

### 添加新功能模块

**步骤**:
1. 在 `lib/stores/` 创建新的 Zustand store
2. 在 `lib/api/` 添加 API 客户端方法
3. 在 `components/` 创建 UI 组件
4. 在 `app/` 添加路由页面
5. 更新 Navbar 添加导航链接

**示例**:
```typescript
// 1. 创建 store
// lib/stores/alertStore.ts
import { create } from "zustand";

interface AlertState {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, alert]
  })),
}));

// 2. 创建 API
// lib/api/alerts.ts
export class AlertsAPI {
  constructor(private client: APIClient) {}
  async getAlerts() {
    return this.client.get("/api/alerts");
  }
}

// 3. 创建组件
// components/alerts/AlertList.tsx
export function AlertList() {
  const { alerts } = useAlertStore();
  return (
    <div>
      {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
    </div>
  );
}

// 4. 添加页面
// app/alerts/page.tsx
export default function AlertsPage() {
  return (
    <div>
      <Navbar />
      <AlertList />
    </div>
  );
}
```

### 添加新的 WebSocket 事件处理

**在 `lib/websocket/job-monitor.ts` 中**:
```typescript
// 添加新的事件类型
const unsubscribeCustomEvent = wsManager.on("custom_event", (message: WebSocketMessage) => {
  console.log("Custom event:", message);
  // 处理事件
  this.updateSomeState(message.data);
  this.addEventToStore("custom_event", message.data.routine_id, message.data);
});
this.unsubscribeCallbacks.push(unsubscribeCustomEvent);
```

---

## 调试技巧

### 查看状态

```javascript
// 在浏览器控制台
window.ZustandDebug?.stores // 查看所有 Zustand stores
```

### 常见问题排查

1. **节点不显示**: 检查 `nodes` 数据和 `nodeTypes` 稳定性
2. **连接状态丢失**: 检查 localStorage 中的 `routilux-connection-storage`
3. **WebSocket 未连接**: 检查后端服务器是否运行在 20555 端口
4. **布局错误**: 检查 Dagre 参数（nodesep, ranksep）

---

## 性能优化建议

### 当前优化
- ✅ Dagre 布局预计算（避免渲染时计算）
- ✅ WebSocket 连接复用（单例模式）
- ✅ 事件数量限制（每个 Job 最多 100 条）
- ✅ 组件级别懒加载

### 未来优化
- [ ] React.memo 优化组件渲染
- [ ] 虚拟滚动（长列表）
- [ ] Web Worker 处理大量数据
- [ ] IndexedDB 存储历史数据
- [ ] 服务端渲染（SSR）优化首屏

---

## 测试策略

### 单元测试
```bash
npm run test
```

### E2E 测试（Playwright）
```bash
npx playwright test
```

### 手动测试检查清单

**连接功能**:
- [ ] 连接到 Routilux 服务器
- [ ] 刷新后保持连接
- [ ] 断开并重新连接

**Flow 功能**:
- [ ] 查看 Flow 列表
- [ ] Flow 图显示正确
- [ ] 节点可拖动
- [ ] 启动 Job

**Job 功能**:
- [ ] 查看 Job 列表
- [ ] 实时状态更新
- [ ] 查看 Job 详情
- [ ] EventLog 显示
- [ ] MetricsPanel 显示

**调试功能**:
- [ ] 添加断点
- [ ] 查看变量
- [ ] 单步执行

---

## Git 提交历史

```bash
d0e7d9d fix: add missing Settings icon import in homepage
67ec545 feat: improve connection persistence and add navigation
0797283 feat: implement Phase 3 & 4 - Job monitoring and debugging features
d9f8fd4 feat: implement Routilux Debugger web application
```

---

## 下一步计划

### 短期（1-2周）
1. 修复当前 bug（如有）
2. 优化用户体验
3. 添加单元测试

### 中期（1-2月）
1. 实现 Phase 2: 审计与告警
2. 实现性能分析功能
3. 添加数据导出功能

### 长期（3-6月）
1. 实现 Phase 3: 高级分析
2. 实现 Phase 4: 企业功能
3. 实现 Phase 5: 高级特性

---

## 联系方式

- **项目所有者**: [Your Name]
- **技术栈**: Next.js 14 + TypeScript + Zustand + ReactFlow
- **后端 API**: Routilux
- **开发工具**: Claude Code

---

**最后更新**: 2025-01-15
**文档版本**: v1.0.0
**维护者**: Claude Code
