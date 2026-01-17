# Runtime和UI改进实施计划

**日期**: 2025-01-15  
**状态**: 待实施  
**优先级**: 高

---

## 概述

本计划详细说明了8项需求的实施步骤，包括Runtime集成、Breakpoint简化、Flow锁定机制、Job界面改进等。

---

## 需求1: Runtime集成到Job创建流程

### 目标
用户使用runtime名字和flow名字创建job，在创建job时可以选择runtime。

### 实施步骤

#### 1.1 更新API Wrapper
- ✅ 已完成：已在`lib/api/index.ts`中添加`runtimes` API方法
- 方法包括：`list()`, `get()`, `create()`

#### 1.2 创建Runtime Store
**文件**: `lib/stores/runtimeStore.ts` (新建)

```typescript
import { create } from 'zustand';
import { createAPI } from '@/lib/api';
import type { RuntimeListResponse, RuntimeInfo } from '@/lib/api';

interface RuntimeStore {
  runtimes: Map<string, RuntimeInfo>;
  defaultRuntimeId: string | null;
  loading: boolean;
  error: Error | null;
  
  loadRuntimes: (serverUrl: string) => Promise<void>;
  getRuntime: (runtimeId: string) => RuntimeInfo | undefined;
  getDefaultRuntime: () => RuntimeInfo | undefined;
}

export const useRuntimeStore = create<RuntimeStore>((set, get) => ({
  runtimes: new Map(),
  defaultRuntimeId: null,
  loading: false,
  error: null,
  
  loadRuntimes: async (serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const api = createAPI(serverUrl);
      const response: RuntimeListResponse = await api.runtimes.list();
      
      const runtimesMap = new Map<string, RuntimeInfo>();
      response.runtimes.forEach(runtime => {
        runtimesMap.set(runtime.runtime_id, runtime);
      });
      
      set({
        runtimes: runtimesMap,
        defaultRuntimeId: response.default_runtime_id || null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Failed to load runtimes'),
        loading: false,
      });
    }
  },
  
  getRuntime: (runtimeId: string) => {
    return get().runtimes.get(runtimeId);
  },
  
  getDefaultRuntime: () => {
    const { defaultRuntimeId, runtimes } = get();
    if (!defaultRuntimeId) return undefined;
    return runtimes.get(defaultRuntimeId);
  },
}));
```

#### 1.3 更新Job创建对话框
**文件**: `components/job/StartJobDialog.tsx` (新建或修改)

**功能**:
- 显示Flow选择（已有）
- 添加Runtime选择下拉框
- 显示默认runtime标识
- 可选：显示runtime的active_job_count和thread_pool_size

**UI设计**:
```
┌─────────────────────────────────────┐
│ Start New Job                       │
│ ─────────────────────────────────── │
│                                      │
│ Flow: [data_processing_flow ▼]      │
│                                      │
│ Runtime: [production ▼]             │
│   • Default runtime                  │
│   • Active jobs: 3                  │
│   • Thread pool: 20                 │
│                                      │
│ Timeout (optional): [3600] seconds   │
│                                      │
│ [Cancel] [Start Job]                 │
└─────────────────────────────────────┘
```

#### 1.4 更新JobStartRequest类型
**文件**: `lib/stores/jobStore.ts`

**修改**:
- `startJob`方法接受`runtime_id`参数
- 更新`JobStartRequest`类型定义

```typescript
startJob: async (
  request: { 
    flow_id: string; 
    runtime_id?: string | null;
    timeout?: number | null;
  },
  serverUrl: string
) => {
  const api = createAPI(serverUrl);
  const response = await api.jobs.start(request);
  // ... 更新store
}
```

#### 1.5 在Flow详情页集成
**文件**: `app/flows/[flowId]/page.tsx`

**修改**:
- `handleStartJob`函数添加runtime选择逻辑
- 可以添加一个简单的runtime选择器，或者使用对话框

---

## 需求2: 简化Breakpoint - 只支持Routine级别

### 目标
用户只能在routine上创建和删除breakpoint，去掉界面上其他无效的选项。

### 实施步骤

#### 2.1 更新BreakpointControls组件
**文件**: `components/debug/BreakpointControls.tsx`

**修改内容**:
1. 移除breakpoint类型选择（slot, event, connection）
2. 只保留routine选择
3. 简化UI，只显示：
   - Routine选择下拉框
   - 可选的condition输入
   - 添加断点按钮
   - 断点列表（显示routine_id, enabled状态, hit_count）
   - 删除/启用/禁用按钮

**新UI设计**:
```
┌─────────────────────────────────────┐
│ Breakpoints                          │
│ ─────────────────────────────────── │
│                                      │
│ Add Breakpoint:                      │
│ Routine: [data_source ▼]            │
│ Condition (optional): [data > 10]   │
│ [Add Breakpoint]                     │
│                                      │
│ Active Breakpoints:                  │
│ ┌─────────────────────────────────┐ │
│ │ data_source                      │ │
│ │ Condition: data > 10            │ │
│ │ Hits: 5  [Disable] [Delete]     │ │
│ └─────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
```

#### 2.2 更新BreakpointStore
**文件**: `lib/stores/breakpointStore.ts`

**修改**:
- `addBreakpoint`方法强制`type: 'routine'`
- 验证`routine_id`必须提供
- 移除其他类型的处理逻辑

```typescript
addBreakpoint: async (
  jobId: string,
  request: { routine_id: string; condition?: string; enabled?: boolean },
  serverUrl: string
) => {
  const api = createAPI(serverUrl);
  const breakpointRequest: BreakpointCreateRequest = {
    type: BreakpointCreateRequest.type.ROUTINE,
    routine_id: request.routine_id,
    condition: request.condition || null,
    enabled: request.enabled !== false,
  };
  await api.breakpoints.create(jobId, breakpointRequest);
  // ... 更新store
}
```

#### 2.3 更新DebugSidebar
**文件**: `components/debug/DebugSidebar.tsx`

**修改**:
- 移除StepExecutionControls（step over, step into等）
- 移除VariableInspector
- 移除ExpressionEvaluator
- 移除CallStackViewer
- 只保留BreakpointControls
- 简化标签页，可能只需要一个"Breakpoints"标签

---

## 需求3: Job信息显示Runtime

### 目标
Job创建后，在基本信息里显示其属于哪个runtime。

### 实施步骤

#### 3.1 检查JobResponse类型
**文件**: `lib/api/generated/models/JobResponse.ts`

**注意**: 当前`JobResponse`可能不包含`runtime_id`字段。需要：
1. 检查后端API是否返回runtime_id
2. 如果不返回，需要修改后端或使用其他方式获取

#### 3.2 更新Job详情页显示
**文件**: `app/jobs/[jobId]/page.tsx`

**修改位置**: Header部分，在Flow信息旁边添加Runtime显示

```typescript
<div className="flex items-center gap-2 mt-1">
  <p className="text-muted-foreground">
    Flow: {job.flow_id}
  </p>
  <span className="text-muted-foreground">•</span>
  <p className="text-muted-foreground">
    Runtime: {job.runtime_id || 'default'}
  </p>
  <span className="text-muted-foreground">•</span>
  {/* ... 其他信息 */}
</div>
```

#### 3.3 更新Job列表页
**文件**: `app/jobs/page.tsx`

**修改**: 在Job卡片中添加Runtime信息显示（可选，根据需求）

---

## 需求4: Runtime不作为大类展示

### 目标
Runtime不要作为大类展示，只在创建job时选择使用。

### 实施步骤

#### 4.1 确认无Runtime独立页面
- ✅ 不需要创建`/runtimes`页面
- ✅ 不需要在导航栏添加Runtime链接
- ✅ Runtime只在创建Job时出现

#### 4.2 可选：Runtime管理（如果需要）
如果未来需要管理runtime，可以在Settings页面添加一个"Runtime Management"部分，但当前不需要。

---

## 需求5: Flow锁定机制

### 目标
Flow上的节点默认不能操作，有一把小锁锁住。用户可以解锁，系统提示如果编辑会影响运行中的job。

### 实施步骤

#### 5.1 创建Flow锁定状态管理
**文件**: `lib/stores/flowStore.ts`

**添加状态**:
```typescript
interface FlowStore {
  // ... 现有状态
  lockedFlows: Set<string>; // 锁定的flow IDs
  unlockedFlows: Set<string>; // 用户解锁的flow IDs
  
  isFlowLocked: (flowId: string) => boolean;
  isFlowUnlocked: (flowId: string) => boolean;
  unlockFlow: (flowId: string, confirmCallback: () => void) => Promise<void>;
  lockFlow: (flowId: string) => void;
}
```

#### 5.2 创建解锁确认对话框
**文件**: `components/flow/UnlockFlowDialog.tsx` (新建)

**功能**:
- 显示警告信息
- 列出该flow下正在运行的jobs
- 确认/取消按钮

**UI设计**:
```
┌─────────────────────────────────────┐
│ ⚠️ Unlock Flow for Editing            │
│ ─────────────────────────────────── │
│                                      │
│ Warning: Editing this flow will     │
│ affect all running jobs.             │
│                                      │
│ Running Jobs (3):                    │
│ • job_abc123 (running)               │
│ • job_xyz789 (running)               │
│ • job_def456 (running)               │
│                                      │
│ Changes to this flow will            │
│ immediately affect these jobs.       │
│                                      │
│ [Cancel] [Unlock & Continue]         │
└─────────────────────────────────────┘
```

#### 5.3 在Flow详情页添加锁图标
**文件**: `app/flows/[flowId]/page.tsx` 和 `components/flow/FlowInfoSidebar.tsx`

**位置**: 左侧边栏顶部，Flow ID旁边

**UI设计**:
```
┌─────────────────────────────────────┐
│ 🔒 data_processing_flow              │
│    [Unlock]                          │
│                                      │
│ Routines: 3                          │
│ Connections: 2                       │
└─────────────────────────────────────┘
```

**解锁后**:
```
┌─────────────────────────────────────┐
│ 🔓 data_processing_flow              │
│    [Lock]                            │
│                                      │
│ ⚠️ Flow is unlocked for editing     │
└─────────────────────────────────────┘
```

#### 5.4 更新FlowCanvas组件
**文件**: `components/flow/FlowCanvas.tsx`

**修改**:
- 根据锁定状态控制`editable`属性
- 锁定状态：`editable={false}`
- 解锁状态：`editable={true}`
- 禁用节点上的暂停按钮（如果存在）

#### 5.5 检查运行中的Jobs
**文件**: `components/flow/UnlockFlowDialog.tsx`

**逻辑**:
```typescript
const checkRunningJobs = async (flowId: string, serverUrl: string) => {
  const api = createAPI(serverUrl);
  const jobsResponse = await api.jobs.list(flowId, 'running');
  return jobsResponse.jobs.filter(job => job.status === 'running');
};
```

---

## 需求6: Flow解锁后的编辑功能

### 目标
Flow解锁后，可以做任意操作：删除节点、删除连线。

### 实施步骤

#### 6.1 确保FlowCanvas支持编辑
**文件**: `components/flow/FlowCanvas.tsx`

**检查项**:
- ✅ 节点删除功能
- ✅ 连线删除功能
- ✅ 节点拖拽
- ✅ 连线创建

#### 6.2 更新FlowDetailsSidebar
**文件**: `components/flow/FlowDetailsSidebar.tsx`

**修改**:
- 在锁定状态下，禁用删除按钮
- 在解锁状态下，启用删除按钮
- 添加视觉提示（按钮变灰/变亮）

#### 6.3 添加删除确认
**文件**: `components/flow/FlowCanvas.tsx` 和相关组件

**功能**:
- 删除节点前确认
- 删除连线前确认（可选，因为连线删除影响较小）

---

## 需求7: Job界面导航条恢复

### 目标
Job界面的上部导航条没了，参考flow页面恢复，要求风格和动画、行为都一致。

### 实施步骤

#### 7.1 分析Flow页面导航条
**文件**: `components/flow/FlowDetailHeader.tsx`

**特点**:
- 高度: `h-14` (56px)
- 背景: `bg-background/95 backdrop-blur`
- 边框: `border-b`
- 左侧: Back按钮 + Flow ID + 状态Badge + Jobs链接
- 右侧: 更多操作菜单 + 主要操作按钮

#### 7.2 创建Job详情页Header组件
**文件**: `components/job/JobDetailHeader.tsx` (新建)

**设计**:
```typescript
interface JobDetailHeaderProps {
  job: JobResponse;
  serverUrl?: string;
  onRefresh: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export function JobDetailHeader({ ... }: JobDetailHeaderProps) {
  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4">
      {/* 左侧：Back + Job ID + Flow + Runtime + Status + Live Indicator */}
      {/* 右侧：Refresh + Debug Toggle + Pause/Resume + Cancel */}
    </div>
  );
}
```

#### 7.3 更新Job详情页
**文件**: `app/jobs/[jobId]/page.tsx`

**修改**:
- 移除现有的Header div
- 使用新的`JobDetailHeader`组件
- 保持相同的样式和动画效果

**布局对比**:

**Flow页面**:
```
[Back] [Flow ID] [Valid Badge] [Jobs Link] ... [More] [Start Job]
```

**Job页面** (新):
```
[Back] [Job ID] [Flow] [Runtime] [Status] [Live] ... [Refresh] [Debug] [Pause/Resume] [Cancel]
```

---

## 需求8: Job Debugger简化和热度显示

### 目标
Job的debugger只保留下断点和取消断点。Job界面显示各个node的热度、各个边的热度，右边栏显示详细数据。

### 实施步骤

#### 8.1 简化DebugSidebar
**文件**: `components/debug/DebugSidebar.tsx`

**修改**:
- 移除所有调试功能，只保留BreakpointControls
- 简化标签页结构
- 可以重命名为`BreakpointSidebar`或保持`DebugSidebar`但只显示断点

#### 8.2 创建Node热度可视化
**文件**: `components/job/NodeHeatmap.tsx` (新建，或集成到FlowCanvas)

**功能**:
- 在FlowCanvas上显示每个节点的热度
- 热度基于：执行次数、错误次数、平均执行时间等
- 使用颜色渐变表示热度（冷色=低热度，暖色=高热度）

**数据来源**:
- `GET /api/jobs/{job_id}/metrics` - 获取routine metrics
- `GET /api/jobs/{job_id}/routines/status` - 获取routine状态

**实现方式**:
1. 在FlowCanvas的节点上叠加热度指示器
2. 或修改节点样式，根据热度改变颜色/大小

#### 8.3 创建Edge热度可视化
**文件**: `components/job/EdgeHeatmap.tsx` (新建，或集成到FlowCanvas)

**功能**:
- 在FlowCanvas的连线上显示热度
- 热度基于：通过该连接的数据量、队列使用率等
- 使用线条粗细和颜色表示热度

**数据来源**:
- `GET /api/jobs/{job_id}/queues/status` - 获取队列状态
- `GET /api/jobs/{job_id}/routines/{routine_id}/queue-status` - 获取特定routine的队列状态

#### 8.4 创建右侧详细数据面板
**文件**: `components/job/JobDetailsSidebar.tsx` (新建)

**功能**:
- 显示选中节点的详细信息
- 显示选中边的详细信息
- 显示整体job统计

**标签页结构**:
```
┌─────────────────────────────────────┐
│ Job Details                         │
│ ─────────────────────────────────── │
│ [Overview] [Node] [Edge] [Metrics]  │
│                                      │
│ Overview Tab:                        │
│ • Job Status                         │
│ • Runtime Info                       │
│ • Total Execution Time               │
│ • Total Events                       │
│ • Error Count                         │
│                                      │
│ Node Tab (选中节点时):                │
│ • Routine ID                         │
│ • Execution Count                    │
│ • Average Duration                   │
│ • Error Count                         │
│ • Queue Status                        │
│ • Last Execution Time                │
│                                      │
│ Edge Tab (选中边时):                  │
│ • Source Routine                     │
│ • Target Routine                     │
│ • Data Flow Count                    │
│ • Queue Usage                        │
│ • Pressure Level                     │
│                                      │
│ Metrics Tab:                         │
│ • Charts (执行时间趋势等)             │
│ • Performance Metrics                │
└─────────────────────────────────────┘
```

#### 8.5 更新FlowCanvas支持选择
**文件**: `components/flow/FlowCanvas.tsx`

**修改**:
- 添加节点点击事件，触发右侧面板显示节点详情
- 添加边点击事件，触发右侧面板显示边详情
- 高亮选中的节点/边

#### 8.6 集成热度数据获取
**文件**: `lib/stores/jobStore.ts` 或新建 `lib/stores/jobMetricsStore.ts`

**功能**:
- 定期获取job metrics
- 计算节点和边的热度
- 提供热度数据给组件

**数据获取逻辑**:
```typescript
const loadJobHeatmapData = async (jobId: string, serverUrl: string) => {
  const api = createAPI(serverUrl);
  
  // 获取routine metrics
  const metrics = await api.monitor.getJobMetrics(jobId);
  
  // 获取routine状态
  const routinesStatus = await api.monitor.getRoutinesStatus(jobId);
  
  // 获取队列状态
  const queuesStatus = await api.monitor.getJobQueuesStatus(jobId);
  
  // 计算热度
  const nodeHeatmap = calculateNodeHeatmap(metrics, routinesStatus);
  const edgeHeatmap = calculateEdgeHeatmap(queuesStatus);
  
  return { nodeHeatmap, edgeHeatmap };
};
```

#### 8.7 更新Job详情页布局
**文件**: `app/jobs/[jobId]/page.tsx`

**新布局**:
```
┌─────────────────────────────────────────────────────────┐
│ JobDetailHeader (新)                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │                      │  │                         │ │
│  │   FlowCanvas         │  │  JobDetailsSidebar     │ │
│  │   (with heatmap)     │  │  (右侧详细数据)         │ │
│  │                      │  │                         │ │
│  │                      │  │                         │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│                                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │  BreakpointSidebar (右侧，可折叠)                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 实施优先级和时间估算

### Phase 1: 核心功能 (高优先级)
1. **需求1: Runtime集成** - 2-3小时
   - Runtime Store
   - Job创建对话框更新
   - API集成

2. **需求2: Breakpoint简化** - 1-2小时
   - 更新BreakpointControls
   - 简化DebugSidebar

3. **需求3: Job显示Runtime** - 0.5小时
   - 更新Job详情页显示

### Phase 2: Flow锁定机制 (中优先级)
4. **需求5: Flow锁定** - 3-4小时
   - Flow锁定状态管理
   - 解锁确认对话框
   - UI集成

5. **需求6: Flow编辑功能** - 1-2小时
   - 确保编辑功能正常工作
   - 添加删除确认

### Phase 3: UI改进 (中优先级)
6. **需求7: Job导航条** - 2-3小时
   - 创建JobDetailHeader组件
   - 样式和动画对齐

7. **需求8: 热度显示和简化Debugger** - 4-6小时
   - 热度可视化
   - 右侧详细数据面板
   - 数据获取和计算

### Phase 4: 清理和优化 (低优先级)
8. **需求4: Runtime不展示** - 已确认，无需实施

**总估算时间**: 13-21小时

---

## 技术注意事项

### 1. API兼容性
- 确认后端API返回`runtime_id`在JobResponse中
- 如果不返回，需要修改后端或使用其他方式获取

### 2. 热度计算算法
需要定义热度计算公式，例如：
```typescript
function calculateNodeHeat(metrics: RoutineMetricsResponse): number {
  // 基于执行次数、错误率、平均时间等
  const executionScore = metrics.execution_count * 0.3;
  const errorPenalty = metrics.error_count * 0.5;
  const timeScore = metrics.avg_duration * 0.2;
  return executionScore - errorPenalty + timeScore;
}
```

### 3. 实时更新
- 使用WebSocket获取实时热度数据
- 或使用轮询（每2-5秒）

### 4. 性能优化
- 热度计算使用Web Worker（如果数据量大）
- 使用React.memo优化组件渲染
- 虚拟化长列表（如果节点很多）

---

## 测试计划

### 单元测试
- Runtime Store功能
- Breakpoint创建/删除（只支持routine）
- Flow锁定/解锁逻辑
- 热度计算函数

### 集成测试
- Job创建流程（包含runtime选择）
- Flow编辑流程（锁定/解锁）
- Job详情页显示（热度、详细数据）

### UI测试
- 导航条样式一致性
- 热度可视化效果
- 响应式布局

---

## 后续优化建议

1. **热度可视化增强**
   - 添加时间轴，显示热度变化历史
   - 支持筛选特定时间范围

2. **Flow锁定增强**
   - 支持部分锁定（只锁定某些节点）
   - 锁定历史记录

3. **Runtime管理**
   - 如果需要，添加Runtime管理界面
   - Runtime使用统计

4. **性能监控**
   - 添加性能瓶颈检测
   - 自动建议优化点

---

## 总结

本计划涵盖了8项需求的所有实施细节。建议按优先级分阶段实施，先完成核心功能（Runtime集成、Breakpoint简化），再完成UI改进（Flow锁定、Job界面优化），最后完成高级功能（热度显示）。

每个需求都有明确的实施步骤、文件位置和UI设计，可以直接按照计划进行开发。
