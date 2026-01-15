# 插件系统 TODO

> 插件系统后续开发任务

**Created**: 2025-01-15
**Status**: 暂停（先测试核心功能）

---

## ✅ 已完成

- [x] EventBus 事件总线
- [x] Storage API 存储接口
- [x] PluginManager 插件管理器
- [x] 插件类型定义
- [x] 应用集成
- [x] Hello World 示例插件

---

## 📋 待办事项

### Phase 2: 插件管理 UI

#### 1. 插件管理页面
**文件**: `app/plugins/page.tsx`

**功能**:
- [ ] 显示所有插件列表
- [ ] 区分内置插件和用户插件
- [ ] 显示插件状态（enabled/disabled）
- [ ] 显示插件详细信息（名称、版本、描述、作者）
- [ ] 插件搜索和过滤
- [ ] 插件统计信息

#### 2. 插件组件
**目录**: `components/plugin/`

**组件**:
- [ ] `PluginList.tsx` - 插件列表
- [ ] `PluginCard.tsx` - 插件卡片
- [ ] `PluginDetails.tsx` - 插件详情
- [ ] `PluginToggle.tsx` - 启用/禁用切换
- [ ] `PluginUpload.tsx` - 上传插件（未来）
- [ ] `PluginBadge.tsx` - 状态徽章

#### 3. 导航集成
**文件**: `components/layout/Navbar.tsx`

**修改**:
- [ ] 添加"Plugins"导航链接
- [ ] 显示插件数量徽章

---

### Phase 3: 内置插件

#### 1. Audit Logger Plugin
**文件**: `lib/plugins/builtin/audit.ts`

**功能**:
- [ ] 记录所有用户操作
  - Job 操作（start/pause/resume/cancel）
  - Debug 操作（breakpoint/step）
  - Flow 操作（view/export）
  - 连接操作
- [ ] 保存到 IndexedDB
- [ ] 提供审计日志查看页面
  - 时间线视图
  - 搜索和过滤
  - 导出功能（CSV/JSON）
- [ ] 实现方式
  ```typescript
  context.events.on("*", (event, data) => {
    this.logEvent(event, data);
  });
  ```

#### 2. Alert Manager Plugin
**文件**: `lib/plugins/builtin/alert.ts`

**功能**:
- [ ] 监听失败事件
  - Job 失败
  - Routine 失败
  - 连接错误
- [ ] 触发浏览器通知
- [ ] 通知历史记录
- [ ] 通知配置
  - 启用/禁用
  - 通知类型选择
- [ ] 未来扩展
  - [ ] Email 通知
  - [ ] Slack Webhook
  - [ ] 自定义 Webhook
- [ ] 实现方式
  ```typescript
  context.events.on("job:failed", (data) => {
    this.showAlert(data);
  });
  ```

#### 3. Metrics Collector Plugin
**文件**: `lib/plugins/builtin/metrics.ts`

**功能**:
- [ ] 收集 Job 性能数据
  - 执行时间
  - Routine 执行次数
  - 错误率
- [ ] 保存到 IndexedDB
- [ ] 数据聚合
  - 按小时/天聚合
  - 计算平均值、P50/P95/P99
- [ ] 可视化展示
  - Job 详情页显示当前 Job 指标
  - 性能趋势图
  - Routine 性能对比
- [ ] 实现方式
  ```typescript
  context.events.on("job:completed", async (data) => {
    const job = await context.api.jobs.get(data.job_id);
    const metrics = calculateMetrics(job);
    await context.storage.indexedDB.set("metrics", data.job_id, metrics);
  });
  ```

---

### Phase 4: 插件生态

#### 1. 插件开发文档
**文件**: `docs/plugin-development.md`

**内容**:
- [ ] 插件 API 完整文档
- [ ] 插件开发教程
- [ ] 最佳实践
- [ ] 常见问题
- [ ] 示例代码

#### 2. 插件示例集合
**目录**: `lib/plugins/examples/`

**示例**:
- [ ] `hello-world-plugin.ts` - ✅ 已完成
- [ ] `simple-event-listener.ts` - 简单事件监听
- [ ] `storage-plugin.ts` - 存储使用示例
- [ ] `ui-extension-plugin.ts` - UI 扩展示例
- [ ] `complete-plugin.ts` - 完整功能示例

#### 3. 插件模板
**文件**: `plugins/template.ts`

**功能**:
- [ ] 插件开发模板
- [ ] 包含所有生命周期钩子
- [ ] 包含注释说明
- [ ] 可复制的代码结构

---

### Phase 5: 高级特性（未来）

#### 1. 用户插件上传
**功能**:
- [ ] 支持 JSON 格式插件定义
- [ ] 插件代码验证
- [ ] 插件沙箱隔离（安全）
- [ ] 插件版本管理

#### 2. 插件市场（可选）
**功能**:
- [ ] 在线插件仓库
- [ ] 插件搜索和发现
- [ ] 插件评分和评论
- [ ] 一键安装

#### 3. 插件依赖管理
**功能**:
- [ ] 插件之间依赖关系
- [ ] 自动加载依赖插件
- [ ] 版本兼容性检查

---

## 🎯 优先级

### 高优先级（Phase 2 & 3）
1. 插件管理 UI - 让用户能看到和管理插件
2. Audit Logger - 核心功能，审计需求
3. Alert Manager - 告警需求

### 中优先级（Phase 4）
4. Metrics Collector - 性能分析
5. 插件开发文档 - 生态建设
6. 插件示例集合 - 降低开发门槛

### 低优先级（Phase 5）
7. 用户插件上传 - 高级功能
8. 插件市场 - 社区功能
9. 插件依赖管理 - 复杂功能

---

## 📝 注意事项

### 设计原则
- 保持"小而美"理念
- 插件功能精简，够用即可
- 不追求大而全

### 技术考虑
- 插件性能影响最小化
- 插件错误隔离（不影响核心）
- 存储空间管理（IndexedDB 配额）

### 用户体验
- 简洁的 UI
- 清晰的插件说明
- 一键启用/禁用

---

## 🔗 相关文档

- [OVERSEER_MINIMAL_DESIGN.md](OVERSEER_MINIMAL_DESIGN.md) - 小而美设计文档
- [PLUGIN_SYSTEM_IMPLEMENTATION.md](PLUGIN_SYSTEM_IMPLEMENTATION.md) - 插件系统实现总结
- [lib/plugins/index.ts](lib/plugins/index.ts) - 插件系统 API

---

**最后更新**: 2025-01-15
**状态**: 暂停，优先测试核心功能
