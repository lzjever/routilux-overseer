# Overseer Demo 测试指南

> 完整的端到端测试指南

**Date**: 2025-01-15
**Demo App**: `routilux/examples/overseer_demo_app.py`

---

## 🚀 快速开始

### 步骤 1: 启动 Routilux Demo 服务器

```bash
cd /home/percy/works/mygithub/routilux/examples
./start_overseer_demo.sh
```

或者直接运行：

```bash
cd /home/percy/works/mygithub/routilux/examples
python3 overseer_demo_app.py
```

### 步骤 2: 启动 Overseer 前端

```bash
cd /home/percy/works/mygithub/routilux-debugger
npm run dev
```

访问: http://localhost:3000

### 步骤 3: 连接到服务器

1. 打开 Overseer (http://localhost:3000)
2. 点击 "Connect to Server"
3. 输入服务器地址: `http://localhost:20555`
4. 点击 "Connect"

---

## 📊 Demo Flows 说明

### 1. Linear Flow（线性流程）

**Flow ID**: `linear_flow`

**功能**: 展示基本的线性数据流

**结构**:
```
DataSource → DataValidator → DataTransformer → DataSink
```

**测试要点**:
- ✅ Flow 图可视化
- ✅ 节点顺序正确
- ✅ 连接线显示

**如何测试**:
1. 进入 Flows 页面
2. 点击 "linear_flow"
3. 查看 Flow 图
4. 点击 "Start Job"
5. 观察执行过程

**预期结果**:
- 数据依次经过所有 Routine
- 每个节点高亮显示
- 最终输出转换后的大写数据

---

### 2. Branching Flow（分支流程）

**Flow ID**: `branching_flow`

**功能**: 展示并行执行和分支

**结构**:
```
         → DataTransformer ↘
DataSource → DataValidator   → DataSink
         → DataMultiplier ↗
```

**测试要点**:
- ✅ 分支可视化
- ✅ 并行执行
- ✅ 聚合点（fan-in）

**如何测试**:
1. 启动 Job
2. 观察 DataTransformer 和 DataMultiplier 同时执行
3. 查看两者结果如何聚合到 DataSink

**预期结果**:
- 两个分支并行执行
- 两个结果都到达 Sink
- Event Log 显示并行事件

---

### 3. Aggregating Flow（聚合流程）

**Flow ID**: `aggregating_flow`

**功能**: 展示多源数据聚合

**结构**:
```
DataSource1 ↘
            → DataAggregator → DataSink
DataSource2 ↗
```

**测试要点**:
- ✅ 多输入源
- ✅ 数据聚合
- ✅ merge_strategy 工作原理

**如何测试**:
1. 启动 Job
2. 观察两个 Source 同时触发
3. 查看 Aggregator 如何合并数据

**预期结果**:
- 两个源数据合并
- 聚合结果输出到 Sink

---

### 4. Conditional Flow（条件流程）⭐

**Flow ID**: `conditional_flow`

**功能**: 测试断点和条件分支

**结构**:
```
DataSource → Counter → ConditionalProcessor → DataSink
```

**测试要点**:
- ⭐ 断点测试
- ⭐ 条件分支
- ⭐ 变量检查

**如何测试（调试功能）**:

#### A. 设置断点
1. 启动一个 Job（使用 `condition='branch_a'`）
2. 进入 Job 详情页
3. 展开 Debug Panel
4. 在 ConditionalProcessor 设置断点
   - 类型: `routine`
   - Routine: `ConditionalProcessor`
5. 点击 "Set Breakpoint"

#### B. 检查变量
1. 切换到 "Variables" 标签
2. 选择 Routine: `ConditionalProcessor`
3. 点击 "Load Variables"
4. 查看变量值（如 `condition`, `data`）

#### C. 单步执行
1. 切换到 "Steps" 标签
2. 点击 "Step Over" 或 "Step Into"
3. 观察执行流程

**预期结果**:
- 断点命中时 Job 暂停
- 可以查看变量值
- 单步执行正常工作

---

### 5. Performance Flow（性能流程）

**Flow ID**: `performance_flow`

**功能**: 展示不同速度的 Routine

**结构**:
```
              → FastProcessor → FastProcessor → FastProcessor ↘
DataSource                                                       → DataAggregator → DataSink
              → SlowProcessor → DataAggregator ↗
```

**测试要点**:
- ⚡ 快速 vs 慢速 Routine
- 📊 性能指标
- ⏱️ 执行时间对比

**如何测试**:
1. 启动 Job
2. 观察 FastProcessors 快速执行（~0.01s）
3. 观察 SlowProcessor 慢速执行（~2.0s）
4. 查看 Metrics Panel 中的时间统计

**预期结果**:
- Fast routines 快速完成
- Slow routine 耗时较长
- Metrics 显示准确的执行时间

---

### 6. Error Flow（错误流程）❌

**Flow ID**: `error_flow`

**功能**: 测试错误处理和告警

**结构**:
```
DataSource → ErrorGenerator → DataSink
```

**测试要点**:
- ❌ 错误场景
- 📋 错误日志
- 🔔 告警触发

**如何测试**:

#### A. 测试 ValueError
```python
# 启动参数:
entry_params = {
    "data": "Test Data",
    "error_type": "value_error"
}
```

#### B. 测试 RuntimeError
```python
entry_params = {
    "error_type": "runtime_error"
}
```

#### C. 测试自定义错误
```python
entry_params = {
    "error_type": "custom"
}
```

**预期结果**:
- Job 失败
- Event Log 显示错误信息
- Job 详情页显示错误堆栈

---

### 7. Complex Flow（复杂流程）🎯

**Flow ID**: `complex_flow`

**功能**: 综合展示所有功能

**结构**:
```
         → DataValidator → DataTransformer → Counter → ConditionalProcessor ↘
MainSource                                                          → DataAggregator → DataSink
         → FastProcessor → FastProcessor ↗                      ↗
                                                              ↗
SecondarySource → SlowProcessor → DataAggregator ──────────────┘
```

**测试要点**:
- 🎯 所有功能综合
- 📊 复杂的可视化
- 🔍 完整的调试场景

**如何测试**:
1. 启动 Job
2. 观察 Flow 图（复杂但清晰）
3. 查看多个并行路径
4. 设置断点测试调试功能
5. 观察聚合过程

**预期结果**:
- Flow 图正确显示所有连接
- 并发执行正常
- 聚合功能正常
- 适合综合测试

---

## 🧪 完整测试清单

### Flow 可视化测试

- [ ] 所有 Flow 都能正确显示
- [ ] Routine 节点位置合理
- [ ] 连接线正确显示
- [ ] 节点可以拖拽
- [ ] Flow 图可以缩放和平移
- [ ] 节点标签清晰可读

### Job 监控测试

- [ ] Job 列表显示所有 Jobs
- [ ] Job 状态正确显示（running/completed/failed）
- [ ] Job 详情页显示完整信息
- [ ] Job 控制按钮工作正常（pause/resume/cancel）
- [ ] 时间信息正确显示

### 实时事件测试

- [ ] WebSocket 连接正常
- [ ] Job 状态实时更新
- [ ] Event Log 实时追加
- [ ] Routine 事件实时显示
- [ ] Metrics 实时更新
- [ ] 连接状态显示（Live/Offline）

### 调试功能测试

#### 断点管理
- [ ] 可以设置断点
- [ ] 断点命中时暂停
- [ ] 可以启用/禁用断点
- [ ] 可以删除断点
- [ ] 断点列表正确显示

#### 变量检查
- [ ] 可以加载变量
- [ ] 变量类型正确显示
- [ ] 变量值正确显示
- [ ] 支持嵌套变量

#### 单步执行
- [ ] Resume 工作正常
- [ ] Step Over 工作正常
- [ ] Step Into 工作正常
- [ ] 执行状态正确更新

### 插件系统测试

- [ ] 插件初始化成功（控制台日志）
- [ ] Hello World 插件正常工作
- [ ] Job 完成时显示 toast
- [ ] 可以通过 `__OVERSEER_PLUGINS__` 访问插件系统

---

## 🔍 调试技巧

### 1. 使用 Conditional Flow 测试断点

**为什么选择 Conditional Flow**:
- 有明确的分支点
- 变量状态清晰
- 适合单步执行

**最佳实践**:
1. 在 ConditionalProcessor 设置断点
2. 使用不同的 `condition` 参数启动 Job
3. 观察不同的执行路径

### 2. 使用 Performance Flow 测试 Metrics

**观察要点**:
- Fast routines: ~0.01s
- Slow routines: ~2.0s
- 总执行时间: ~2.05s

### 3. 使用 Error Flow 测试告警

**测试告警功能**:
1. 启动一个会失败的 Job
2. 观察 Event Log 中的错误事件
3. 查看 Job 详情页的错误信息
4. 检查告警插件是否触发（如果已实现）

---

## 📝 测试数据

### 推荐 Job 启动参数

#### Linear Flow
```json
{
  "data": "Hello Overseer!"
}
```

#### Conditional Flow（测试分支 A）
```json
{
  "data": "Test A",
  "steps": 5,
  "condition": "branch_a"
}
```

#### Conditional Flow（测试分支 B）
```json
{
  "data": "Test B",
  "steps": 3,
  "condition": "branch_b"
}
```

#### Error Flow（测试 ValueError）
```json
{
  "data": "Error Test",
  "error_type": "value_error"
}
```

#### Performance Flow
```json
{
  "data": "Performance Test"
}
```

---

## 🐛 常见问题

### Q: WebSocket 无法连接？

**A**: 检查以下几点：
1. Routilux 服务器是否正在运行（http://localhost:20555）
2. 浏览器控制台是否有错误
3. 网络请求是否成功

### Q: Flow 图不显示？

**A**:
1. 刷新页面
2. 检查服务器连接状态
3. 查看浏览器控制台错误

### Q: 断点不工作？

**A**:
1. 确保 Job 处于 running 状态
2. 断点必须设置在正在执行的 Routine 上
3. 检查断点是否已启用

### Q: 变量无法加载？

**A**:
1. Job 必须处于 paused 状态
2. Routine 必须已执行
3. 检查 Routine ID 是否正确

---

## ✅ 测试完成标准

### 基础功能
- [x] 所有 Flow 可视化正常
- [x] Job 启动和监控正常
- [x] WebSocket 实时更新正常

### 调试功能
- [ ] 断点设置和命中正常
- [ ] 变量检查正常
- [ ] 单步执行正常

### 性能
- [ ] 页面加载 < 2s
- [ ] WebSocket 延迟 < 100ms
- [ ] 插件系统无影响

---

## 🎉 测试完成后

### 发现 Bug?

请记录在 `TESTING_SUMMARY.md` 中：
1. Bug 描述
2. 重现步骤
3. 预期 vs 实际
4. 错误日志

### 功能正常？

太好了！你可以：
1. ✅ 继续开发插件管理 UI
2. ✅ 实现内置插件
3. ✅ 部署到生产环境

---

**祝你测试愉快！** 🚀

如有问题，请查看：
- [TESTING.md](TESTING.md) - 完整测试计划
- [TESTING_SUMMARY.md](TESTING_SUMMARY.md) - 测试总结
