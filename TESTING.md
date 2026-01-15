# 功能测试计划

> 测试 Routilux Overseer 核心功能

**Date**: 2025-01-15
**Server**: http://localhost:3002
**Routilux Server**: http://localhost:20555 (需要单独运行)

---

## 🎯 测试范围

### Phase 1: 核心功能（已完成）

- ✅ Flow 可视化
- ✅ Job 监控
- ✅ 基础调试
- ✅ 实时事件流
- ✅ 连接管理
- 🔌 插件系统（基础设施完成）

---

## 📋 测试清单

### 1. 应用启动和基础功能

#### 1.1 应用启动
- [ ] 访问 http://localhost:3002
- [ ] 页面正常加载
- [ ] 控制台无错误
- [ ] 插件系统初始化成功
  ```
  ✅ Plugin System: EventBus initialized
  ✅ Plugin System: StorageAPI initialized
  ✅ Plugin System: Ready
  ✅ Builtin plugin registered: Hello World
  ```

#### 1.2 未连接状态
- [ ] 显示"Not Connected"提示
- [ ] "Connect to Server"按钮可点击
- [ ] 导航栏显示连接状态

---

### 2. 连接管理

#### 2.1 连接到服务器
**前提**: 需要运行 Routilux 服务器

- [ ] 点击"Connect to Server"
- [ ] 输入服务器地址（默认：http://localhost:20555）
- [ ] 点击"Connect"
- [ ] 连接成功后跳转到首页
- [ ] 导航栏显示"Connected"状态
- [ ] 显示服务器地址

#### 2.2 断开连接
- [ ] 点击导航栏"Change Server"按钮
- [ ] 返回连接页面
- [ ] 或可以重新连接

---

### 3. Flow 可视化

#### 3.1 Flow 列表
- [ ] 点击导航栏"Flows"
- [ ] 显示 Flow 列表
- [ ] 每个 Flow 显示卡片
- [ ] Flow 信息正确（ID, Routines 数量等）

#### 3.2 Flow 详情
- [ ] 点击某个 Flow
- [ ] 进入 Flow 详情页
- [ ] 显示 Flow 图（ReactFlow）
- [ ] Routine 节点正确显示
- [ ] 连接线正确显示
- [ ] 节点可拖拽
- [ ] 图可以缩放和平移

#### 3.3 启动 Job
- [ ] 在 Flow 详情页点击"Start Job"
- [ ] 显示启动对话框
- [ ] 选择 entry routine
- [ ] 输入参数（可选）
- [ ] 点击启动
- [ ] Job 创建成功
- [ ] 跳转到 Job 详情页

---

### 4. Job 监控

#### 4.1 Job 列表
- [ ] 点击导航栏"Jobs"
- [ ] 显示 Job 列表
- [ ] 每个 Job 显示卡片
- [ ] Job 信息正确（ID, Flow ID, 状态等）
- [ ] 状态徽章颜色正确
  - running: 蓝色
  - completed: 绿色
  - failed: 红色
  - 其他: 灰色
- [ ] 显示时间信息（created, started, completed）

#### 4.2 Job 详情
- [ ] 点击某个 Job
- [ ] 进入 Job 详情页
- [ ] 显示 Job 基本信息
- [ ] 显示 Flow 图（带执行状态）
- [ ] 显示 Event Log
- [ ] 显示 Metrics Panel

#### 4.3 Job 控制
- [ ] 在 Job 详情页
- [ ] "Pause"按钮可用（running 状态）
- [ ] "Resume"按钮可用（paused 状态）
- [ ] "Cancel"按钮可用
- [ ] 控制按钮响应正确
- [ ] 状态实时更新（WebSocket）

#### 4.4 实时更新（WebSocket）
- [ ] Job 状态变化实时显示
- [ ] Event Log 实时追加
- [ ] Metrics 实时更新
- [ ] 导航栏显示"Live"状态
- [ ] WebSocket 断线显示"Offline"

---

### 5. 调试功能

#### 5.1 断点管理
**前提**: 需要有一个 running 状态的 Job

- [ ] 在 Job 详情页展开 Debug Panel
- [ ] 切换到"Breakpoints"标签
- [ ] 显示可用 Routines
- [ ] 可以选择 Routine
- [ ] 可以设置断点类型（routine/slot/event）
- [ ] 点击"Set Breakpoint"
- [ ] 断点列表显示新断点
- [ ] 可以启用/禁用断点
- [ ] 可以删除断点

#### 5.2 变量检查
- [ ] 切换到"Variables"标签
- [ ] 选择 Routine
- [ ] 点击"Load Variables"
- [ ] 显示变量列表
- [ ] 变量类型正确显示
- [ ] 变量值正确显示

#### 5.3 单步执行
- [ ] 切换到"Steps"标签
- [ ] "Resume"按钮可用
- [ ] "Step Over"按钮可用
- [ ] "Step Into"按钮可用
- [ ] 点击按钮后执行相应操作
- [ ] 状态正确更新

#### 5.4 调用栈
- [ ] 在 Debug Panel 显示 Call Stack
- [ ] 显示调用栈帧
- [ ] 可以查看每个帧的信息

---

### 6. 插件系统

#### 6.1 插件初始化
- [ ] 控制台显示插件系统初始化成功
- [ ] 显示 EventBus 初始化
- [ ] 显示 StorageAPI 初始化
- [ ] 显示 Hello World 插件注册

#### 6.2 插件功能测试
**前提**: 打开浏览器控制台**

- [ ] 访问 `__OVERSEER_PLUGINS__`
- [ ] 调用 `getStats()` 返回统计信息
- [ ] 调用 `getManager()` 返回插件管理器
- [ ] 可以获取插件列表
- [ ] 可以启用/禁用插件

#### 6.3 Hello World 插件
- [ ] Job 完成时显示 toast 通知
- [ ] 控制台显示日志
- [ ] 插件存储测试成功

---

## 🔍 发现的问题记录

### 已发现
1. ✅ **API 导出问题** - 已修复
   - 问题：FlowsAPI 等类未导出
   - 修复：在 lib/api/index.ts 中添加导出

### 待测试
- （测试过程中填写）

---

## 📊 测试结果

### 通过的测试
- （测试过程中填写）

### 失败的测试
- （测试过程中填写）

### 跳过的测试
- （测试过程中填写）
  - 原因：需要 Routilux 服务器运行

---

## 🛠️ 测试环境

### 前置条件
1. Node.js 18+ 已安装
2. 依赖已安装 (`npm install`)
3. Next.js 开发服务器运行在 http://localhost:3002

### 可选条件
1. Routilux 服务器运行在 http://localhost:20555
   - 需要单独启动
   - 用于测试完整的 Flow/Job 功能

### 浏览器
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 📝 测试注意事项

1. **需要 Routilux 服务器**的功能
   - Flow 可视化（需要获取 Flow 数据）
   - Job 监控（需要获取 Job 数据）
   - 调试功能（需要调试中的 Job）

2. **可以独立测试**的功能
   - 应用启动
   - 连接管理 UI
   - 插件系统初始化

3. **WebSocket 测试**
   - 需要服务器支持
   - 需要有活动的 Job

4. **性能观察**
   - 页面加载速度
   - 插件系统影响
   - WebSocket 延迟

---

**测试开始时间**: （待填写）
**测试结束时间**: （待填写）
**测试人员**: Claude Code

**下一步**: 根据测试结果修复问题或继续开发新功能
