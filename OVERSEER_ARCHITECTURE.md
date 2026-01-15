# Routilux Overseer - 架构设计文档

## 🎯 产品定位升级

**从 Debugger 到 Overseer**

| 维度 | Debugger (旧) | Overseer (新) |
|------|--------------|--------------|
| **核心定位** | 调试工具 | 全方位审计、管理和监控平台 |
| **目标用户** | 开发者 | 开发者 + 运维 + SRE + 管理员 |
| **使用场景** | 开发时调试 | 生产环境全生命周期管理 |
| **功能范围** | Flow可视化、断点、变量 | 审计、监控、告警、管理、调试、优化 |
| **时间维度** | 实时调试 | 历史审计 + 实时监控 + 趋势预测 |

---

## 🏗️ 系统架构

### 核心理念

```
Observe (观察) → Analyze (分析) → Act (行动) → Optimize (优化)
```

### 功能层次架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Routilux Overseer                        │
├─────────────────────────────────────────────────────────────┤
│  展示层 (Presentation Layer)                                │
│  - Dashboard (仪表盘)                                       │
│  - Flow Studio (Flow 工作室)                               │
│  - Job Manager (Job 管理器)                                │
│  - Audit Center (审计中心)                                 │
│  - Alert Console (告警控制台)                              │
│  - Performance Analytics (性能分析)                        │
├─────────────────────────────────────────────────────────────┤
│  业务逻辑层 (Business Logic Layer)                          │
│  - 审计引擎 (Audit Engine)                                 │
│  - 监控引擎 (Monitor Engine)                               │
│  - 告警引擎 (Alert Engine)                                 │
│  - 调试引擎 (Debug Engine)                                 │
│  - 优化引擎 (Optimize Engine)                              │
├─────────────────────────────────────────────────────────────┤
│  数据层 (Data Layer)                                        │
│  - 时序数据 (Time-series Data)                            │
│  - 事件日志 (Event Logs)                                   │
│  - 审计追踪 (Audit Trails)                                 │
│  - 性能指标 (Performance Metrics)                         │
│  - 配置管理 (Configuration)                                │
├─────────────────────────────────────────────────────────────┤
│  集成层 (Integration Layer)                                 │
│  - Routilux API Client                                     │
│  - WebSocket Real-time Stream                             │
│  - 外部告警集成 (PagerDuty, Slack, Email)                  │
│  - 日志聚合 (ELK, Splunk)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 完整功能规划

### 1. 🎛️ Dashboard (仪表盘) - 全局总览

**目标**：一眼看懂整个系统的健康状况

#### 功能模块

**1.1 系统健康卡片**
```
- 总 Flows 数量
- 总 Jobs 数量（今日/本周/本月）
- 运行中 Jobs
- 失败率（趋势图）
- 平均执行时长
- 系统负载指数
```

**1.2 实时活动流**
```
- 最近10条 Job 事件
- 实时更新（WebSocket）
- 可点击查看详情
```

**1.3 性能趋势图**
```
- Job 吞吐量（TPS）
- 平均响应时间
- 错误率趋势
- 资源使用率
- 时间范围选择：1h/6h/24h/7d/30d
```

**1.4 快捷操作**
```
- Start Job（快速启动常用 Flow）
- View Alerts
- System Status
```

---

### 2. 📊 Audit Center (审计中心) - 审计追溯

**目标**：完整的操作历史和合规性审计

#### 功能模块

**2.1 操作审计**
```
- 谁 (Who): 用户/服务标识
- 何时 (When): 精确时间戳
- 做了什么 (What): 操作类型
- 对谁做的 (Whom): 目标资源
- 结果如何 (Result): 成功/失败/错误
- 审计 ID: 唯一追踪标识
```

**审计事件类型：**
- Job 生命周期（start/complete/fail/pause/resume/cancel）
- Flow 修改（create/update/delete）
- 断点操作（set/remove/hit）
- 配置变更
- 系统事件（连接/断开/错误）

**2.2 时间线视图**
```
- 时间轴展示所有事件
- 可筛选：事件类型、时间范围、用户
- 可导出：CSV/JSON/PDF
```

**2.3 合规性报告**
```
- 按时间范围生成合规报告
- 操作汇总统计
- 异常事件标记
- 数字签名（防篡改）
```

**2.4 搜索与过滤**
```
- 全文搜索审计日志
- 高级过滤条件
- 保存常用查询
```

---

### 3. 🔔 Alert Console (告警控制台) - 智能告警

**目标**：主动发现问题并及时通知

#### 功能模块

**3.1 告警规则配置**
```
规则类型：
- Job 失败告警
- Job 超时告警
- Flow 执行异常告警
- 性能阈值告警（响应时间、错误率）
- 自定义表达式告警

告警级别：
- Critical（紧急）: 立即通知
- Warning（警告）: 汇总通知
- Info（信息）: 仅记录
```

**3.2 告警渠道**
```
实时通知：
- Browser Push Notification
- Email
- Slack / Webhook
- PagerDuty / OpsGenie
- SMS（紧急）
```

**3.3 告警历史**
```
- 告警列表（时间线）
- 告警详情（触发条件、上下文）
- 告警处理状态（新建/已确认/已解决）
- 关联 Job/Flow
```

**3.4 告警降噪**
```
- 相似告警聚合
- 静音规则（维护窗口）
- 自动升级规则
```

---

### 4. ⚡ Performance Analytics (性能分析) - 性能优化

**目标**：发现性能瓶颈并优化

#### 功能模块

**4.1 Flow 性能分析**
```
- 每个 Routine 的平均执行时间
- 瓶颈识别（最慢的 Routine）
- 并发效率分析
- 资源消耗（CPU/内存/IO）
```

**4.2 Job 性能洞察**
```
- P50/P95/P99 延迟分布
- 失败率趋势
- 重试次数统计
- 队列等待时间
```

**4.3 资源使用分析**
```
- 时间序列图表
- 峰值识别
- 容量规划建议
- 成本估算（云资源）
```

**4.4 性能对比**
```
- 不同版本的 Flow 性能对比
- A/B 测试支持
- 性能回归检测
```

---

### 5. 🔍 Flow Studio (Flow 工作室) - Flow 管理

**目标**：可视化的 Flow 设计和管理

#### 功能模块

**5.1 Flow 版本管理**
```
- 版本历史
- 版本对比（Diff）
- 回滚到历史版本
- 版本标签（release/canary/dev）
```

**5.2 Flow 测试**
```
- 单元测试支持
- 集成测试
- Dry-run 模式
- 测试报告
```

**5.3 Flow 部署**
```
- 部署到不同环境（dev/staging/prod）
- 灰度发布
- 回滚机制
- 部署历史
```

**5.4 Flow 依赖图谱**
```
- Flow 之间的依赖关系
- 影响分析（修改会影响哪些下游）
- 级联失败分析
```

---

### 6. 🎮 Job Manager (Job 管理器) - Job 管理中心

**目标**：全方位的 Job 生命周期管理

#### 功能模块

**6.1 Job 队列管理**
```
- 待处理队列
- 运行中队列
- 失败队列（重试队列）
- 死信队列（DLQ）
- 手动重新入队
```

**6.2 Job 批量操作**
```
- 批量取消
- 批量重试
- 批量修改优先级
- 批量导出
```

**6.3 Job 调度**
```
- Cron 调度配置
- 定时任务管理
- 调度历史
- 调度执行日志
```

**6.4 Job 模板**
```
- 常用 Job 参数模板
- 快速启动
- 参数预设
```

---

### 7. 🐛 Debug Studio (调试工作室) - 调试增强

**目标**：强大的调试工具集

#### 功能模块

**7.1 智能断点**
```
- 条件断点（仅当满足条件时停止）
- 临时断点（命中后自动删除）
- 日志断点（记录日志但不停止）
- 断点组（批量管理）
```

**7.2 调用栈追踪**
```
- 完整调用链路
- 参数传递追踪
- 变量作用域分析
- 热栈更新（实时）
```

**7.3 数据检查器**
```
- 变量监视（Watch）
- 表达式求值
- 内存快照
- 数据类型推断
```

**7.4 时间旅行调试**
```
- 录制 Job 执行过程
- 回放执行历史
- 跳转到任意时间点
- 状态对比
```

---

### 8. 📈 Metrics & Analytics (指标与分析) - 高级分析

**目标**：数据驱动的决策支持

#### 功能模块

**8.1 自定义仪表盘**
```
- 拖拽式布局
- 自定义图表类型
- 保存/分享仪表盘
- 实时数据刷新
```

**8.2 业务指标**
```
- 业务成功率
- 业务量趋势
- 异常检测
- 预测分析（ML）
```

**8.3 报表生成**
```
- 日报/周报/月报
- 自动发送邮件
- 自定义报表模板
- 报表订阅
```

**8.4 数据导出**
```
- 导出为 CSV/JSON/Excel
- API 导出（第三方集成）
- 定期导出任务
```

---

### 9. 🔐 Security & Compliance (安全与合规) - 安全保障

**目标**：企业级安全与合规

#### 功能模块

**9.1 权限管理**
```
- RBAC（基于角色的访问控制）
- API Key 管理
- 审计日志（谁访问了什么）
- 会话管理
```

**9.2 敏感数据保护**
```
- 数据脱敏（PII）
- 审计日志加密
- 数据保留策略
- 数据导出审批
```

**9.3 合规性检查**
```
- GDPR 合规
- SOC2 报告支持
- 审计追踪完整性
```

---

### 10. ⚙️ Settings & Configuration (配置管理) - 系统配置

**目标**：灵活的系统配置

#### 功能模块

**10.1 连接配置**
```
- 多服务器配置
- 连接池设置
- 超时配置
- 重试策略
```

**10.2 监控配置**
```
- 采样率配置
- 数据保留策略
- 存储配额管理
```

**10.3 告警配置**
```
- 告警路由规则
- 通知时段设置
- 告警升级策略
```

**10.4 UI 配置**
```
- 主题切换（暗/亮）
- 布局定制
- 时区设置
- 语言设置
```

---

## 🗺️ 导航结构重构

```
Routilux Overseer
├── Dashboard (仪表盘)
│   ├── Overview (总览)
│   ├── Performance (性能)
│   └── Alerts (告警)
├── Flows (Flow 管理)
│   ├── All Flows (所有 Flows)
│   ├── Flow Studio (Flow 工作室)
│   │   ├── Visual Editor (可视化编辑)
│   │   ├── Version History (版本历史)
│   │   └── Analytics (分析)
│   └── Deployments (部署)
├── Jobs (Job 管理)
│   ├── All Jobs (所有 Jobs)
│   ├── Queue (队列)
│   ├── Schedules (调度)
│   └── Templates (模板)
├── Monitor (监控中心)
│   ├── Real-time (实时监控)
│   ├── History (历史数据)
│   └── Metrics (指标)
├── Audit (审计中心)
│   ├── Events (事件)
│   ├── Trails (审计追踪)
│   ├── Reports (报告)
│   └── Compliance (合规性)
├── Alerts (告警管理)
│   ├── Rules (规则)
│   ├── History (历史)
│   └── Channels (渠道)
├── Debug (调试工作室)
│   ├── Breakpoints (断点)
│   ├── Variables (变量)
│   ├── Call Stack (调用栈)
│   └── Time Travel (时间旅行)
└── Settings (设置)
    ├── Connections (连接)
    ├── Preferences (偏好)
    └── Security (安全)
```

---

## 🎨 设计系统升级

### 品牌视觉

**配色方案（企业级）**
```
Primary:   #0F172A (深蓝 - 专业稳重)
Secondary: #3B82F6 (亮蓝 - 科技创新)
Accent:    #10B981 (绿色 - 成功健康)
Warning:   #F59E0B (橙色 - 警告注意)
Error:     #EF4444 (红色 - 错误紧急)
Info:      #6366F1 (紫色 - 信息提示)
```

**图标系统**
- 使用 Lucide React 图标库
- 每个功能模块有独特图标
- 状态颜色编码

**字体排印**
```
标题: Inter/Roboto
代码: JetBrains Mono/Fira Code
正文: -apple-system, system-ui
```

---

## 📊 数据架构

### 时序数据库（InfluxDB/TimescaleDB）

```
measurements:
  - job_metrics (Job 指标)
  - routine_metrics (Routine 指标)
  - system_metrics (系统指标)
  - alert_events (告警事件)

tags:
  - job_id, flow_id, routine_id
  - status, environment, region

fields:
  - duration, memory, cpu
  - error_count, retry_count
```

### 事件存储

```
events:
  - job_lifecycle (Job 生命周期)
  - routine_execution (Routine 执行)
  - system_events (系统事件)
  - audit_trail (审计追踪)

每个事件包含：
  - event_id (UUID)
  - timestamp (ISO 8601)
  - event_type
  - data (JSON)
  - metadata (tags)
```

---

## 🚀 技术栈增强

### 前端技术栈

```
Core:
- Next.js 14 (App Router)
- React 18
- TypeScript 5

UI Framework:
- shadcn/ui + Radix UI
- TailwindCSS
- Framer Motion (动画)

可视化:
- ReactFlow (Flow 图)
- Recharts/D3.js (图表)
- Three.js (3D 可视化，可选)

状态管理:
- Zustand (全局状态)
- React Query (服务端状态)

实时通信:
- WebSocket
- Server-Sent Events (SSE)
```

### 后端集成

```
API Client:
- Fetch API
- WebSocket
- GraphQL (可选，如果 Routilux 支持)

数据存储（浏览器端）:
- IndexedDB (大量历史数据)
- LocalStorage (配置)
- SessionStorage (临时状态)
```

---

## 📝 实施计划

### Phase 1: 核心重构（当前）
- ✅ 基础 Flow 可视化
- ✅ Job 监控
- ✅ 调试功能
- ✅ 连接管理

### Phase 2: 审计与告警（下一步）
- [ ] 审计日志完整实现
- [ ] 告警规则引擎
- [ ] 通知渠道集成
- [ ] 历史数据查询

### Phase 3: 高级分析
- [ ] 性能分析仪表盘
- [ ] 自定义图表
- [ ] 趋势预测
- [ ] 报表生成

### Phase 4: 企业功能
- [ ] 权限管理
- [ ] 多租户支持
- [ ] 数据导出
- [ ] API Keys

### Phase 5: 高级特性
- [ ] 时间旅行调试
- [ ] AI 辅助调试
- [ ] 自动化测试
- [ ] CI/CD 集成

---

## 🎯 成功指标

**技术指标：**
- 页面加载时间 < 2s
- 实时更新延迟 < 100ms
- 支持同时监控 1000+ Jobs
- 历史数据查询 < 500ms

**业务指标：**
- 降低 MTTR（平均修复时间）50%
- 提高问题发现速度 10x
- 减少 90% 的手动排查工作
- 100% 的操作可追溯

---

## 📚 参考资源

**竞品参考：**
- Datadog（监控）
- New Relic（APM）
- AWS X-Ray（分布式追踪）
- Airflow（工作流管理）
- Grafana（可视化）

**设计灵感：**
- Vercel Dashboard
- Linear Issue Tracker
- GitHub Dashboard
- Kubernetes Dashboard

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-15
**维护者**: Claude Code
