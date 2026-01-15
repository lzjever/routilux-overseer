# 🚀 Routilux 调试器测试环境 - 快速开始指南

## ✅ 已完成的工作

### 后端服务器
- ✅ Routilux API 服务器正在运行：`http://localhost:20555`
- ✅ 已注册 4 个测试 flows：
  1. **linear_flow** - 线性流程（4 个 routines）
  2. **branching_flow** - 分支流程（5 个 routines，fan-out/fan-in）
  3. **complex_flow** - 复杂流程（9 个 routines，多源、聚合、慢处理）
  4. **error_flow** - 错误处理流程（3 个 routines）

### 前端调试器
- ✅ Next.js 项目已创建
- ✅ 基础架构已完成（Phase 1）
- ✅ 连接页面已实现

---

## 🎯 如何使用

### 1️⃣ 确认后端服务器运行

```bash
# 检查服务器状态
curl http://localhost:20555/api/health

# 查看所有可用的 flows
curl http://localhost:20555/api/flows | python3 -m json.tool
```

你应该看到 4 个 flows 已注册。

### 2️⃣ 启动前端调试器

```bash
cd /home/percy/works/mygithub/routilux-debugger
npm run dev
```

前端将在 `http://localhost:3000` 运行。

### 3️⃣ 连接到后端服务器

1. 打开浏览器：http://localhost:3000
2. 你会自动跳转到连接页面 (`/connect`)
3. 输入服务器 URL：`http://localhost:20555`
4. 点击 "Connect" 按钮

### 4️⃣ 开始测试

连接成功后，你可以：
- 查看 flows 列表
- 查看 flow 详情和结构
- 启动 jobs 并监控执行

---

## 📊 测试 Flows 说明

### 1. Linear Flow（线性流程）

**结构：**
```
Source → Validator → Transformer → Sink
```

**特点：**
- 最简单的线性流程
- 4 个 routines，3 个连接
- 适合测试基本功能

**启动方式：**
```json
{
  "flow_id": "linear_flow",
  "entry_routine_id": "source",
  "entry_params": {"data": "Hello, World!"}
}
```

### 2. Branching Flow（分支流程）

**结构：**
```
              → Transformer ↘
Source → Validator
              → Multiplier ↙
                   ↓
                   Sink
```

**特点：**
- Fan-out (1 → 2)：validator 输出到两个处理器
- Fan-in (2 → 1)：两个处理器都输出到 sink
- 5 个 routines，5 个连接
- 适合测试分支和并发

**启动方式：**
```json
{
  "flow_id": "branching_flow",
  "entry_routine_id": "source",
  "entry_params": {"data": "Branch Test"}
}
```

### 3. Complex Flow（复杂流程）

**结构：**
```
Source1 → Validator1 → Transformer → Aggregator
                              ↓
                           SlowProcessor (1s delay)

Source2 → Validator2 → Multiplier ↗
                              ↓
                           Sink
```

**特点：**
- 多个源（2 个 sources）
- 多条路径汇聚
- 慢处理器（1 秒延迟）
- 聚合器合并多个输入
- 9 个 routines，9 个连接
- 适合测试复杂场景和性能监控

**启动方式：**
```json
{
  "flow_id": "complex_flow",
  "entry_routine_id": "source1",
  "entry_params": {"data": "Complex Test", "index": 0}
}
```

### 4. Error Flow（错误流程）

**结构：**
```
Source → ErrorProcessor → Sink
         (can fail)
```

**特点：**
- 可以触发错误的流程
- 测试错误处理
- 3 个 routines，2 个 connections

**启动方式（成功）：**
```json
{
  "flow_id": "error_flow",
  "entry_routine_id": "source",
  "entry_params": {"data": "Success Test", "should_fail": false}
}
```

**启动方式（失败）：**
```json
{
  "flow_id": "error_flow",
  "entry_routine_id": "source",
  "entry_params": {"data": "Error Test", "should_fail": true}
}
```

---

## 🧪 通过 API 测试

### 启动一个 Job

```bash
curl -X POST http://localhost:20555/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "linear_flow",
    "entry_routine_id": "source",
    "entry_params": {"data": "Test Data"}
  }'
```

### 查看 Job 状态

```bash
# 列出所有 jobs
curl http://localhost:20555/api/jobs

# 获取特定 job 详情
curl http://localhost:20555/api/jobs/{job_id}
```

### 控制 Job

```bash
# 暂停
curl -X POST http://localhost:20555/api/jobs/{job_id}/pause

# 恢复
curl -X POST http://localhost:20555/api/jobs/{job_id}/resume

# 取消
curl -X POST http://localhost:20555/api/jobs/{job_id}/cancel
```

---

## 🛠️ 管理服务器

### 停止服务器

```bash
# 方法 1：查找并杀掉进程
lsof -ti:20555 | xargs kill -9

# 方法 2：使用 pkill
pkill -f "uvicorn routilux"
```

### 重启服务器

```bash
cd /home/percy/works/mygithub/routilux

# 设置调试模式环境变量
export ROUTILUX_DEBUGGER_MODE=true

# 启动服务器
.venv/bin/python -m uvicorn routilux.api.main:app \
  --host 0.0.0.0 \
  --port 20555 \
  --reload
```

或者使用启动脚本：
```bash
cd /home/percy/works/mygithub/routilux
./examples/start_debugger.sh
```

---

## 📁 文件位置

### 后端
- **项目根目录：** `/home/percy/works/mygithub/routilux`
- **测试应用：** `examples/debugger_test_app.py`
- **API 主模块：** `routilux/api/main.py`（已添加调试器支持）
- **启动脚本：** `examples/start_debugger.sh`

### 前端
- **项目根目录：** `/home/percy/works/mygithub/routilux-debugger`
- **连接页面：** `app/connect/page.tsx`
- **API 客户端：** `lib/api/`
- **状态管理：** `lib/stores/`

---

## 🎨 下一步开发

现在测试环境已就绪，我们可以继续开发：

### Phase 2: Flow Visualization 🔄
- [ ] 集成 ReactFlow
- [ ] 创建 RoutineNode 组件
- [ ] 创建 ConnectionEdge 组件
- [ ] 实现 FlowCanvas
- [ ] 添加 dagre 自动布局
- [ ] 创建 Flow 列表和详情页面

### Phase 3: Real-time Monitoring 📊
- [ ] 实现 WebSocketManager
- [ ] 创建 JobMonitor
- [ ] 添加实时事件流
- [ ] 创建 MetricsPanel
- [ ] 创建 EventLog

### Phase 4: Debugging 🐛
- [ ] 创建 DebugPanel
- [ ] 实现断点管理
- [ ] 添加变量查看
- [ ] 实现单步执行

---

## 📝 快速命令参考

```bash
# === 后端 ===
# 启动服务器（带调试 flows）
cd /home/percy/works/mygithub/routilux
export ROUTILUX_DEBUGGER_MODE=true
.venv/bin/python -m uvicorn routilux.api.main:app --host 0.0.0.0 --port 20555 --reload

# 检查服务器
curl http://localhost:20555/api/health
curl http://localhost:20555/api/flows

# === 前端 ===
# 启动开发服务器
cd /home/percy/works/mygithub/routilux-debugger
npm run dev

# 构建生产版本
npm run build

# === 测试 API ===
# 启动测试 job
curl -X POST http://localhost:20555/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"flow_id":"linear_flow","entry_routine_id":"source","entry_params":{"data":"Test"}}'

# 查看 jobs
curl http://localhost:20555/api/jobs
```

---

## ✨ 现在你可以做什么？

1. **立即测试**：打开 http://localhost:3000，连接到后端
2. **查看 API 文档**：http://localhost:20555/docs（Swagger UI）
3. **继续开发**：Phase 2 - Flow 可视化
4. **提交问题**：如果遇到任何问题

准备好了吗？让我们继续开发调试器的 Flow 可视化功能！🚀
