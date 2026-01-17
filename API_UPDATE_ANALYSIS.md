# Routilux Overseer API Update Analysis & Plan

**Date**: 2025-01-15  
**Status**: Analysis Complete - Ready for Implementation

---

## 📋 Executive Summary

The Routilux backend has undergone significant refactoring, resulting in a comprehensive API with many new endpoints and capabilities. The Overseer frontend needs to be updated to:

1. **Fetch and regenerate** the TypeScript client from the latest OpenAPI schema
2. **Update all API calls** to use the new endpoint structure
3. **Redesign the UI** to leverage ALL available backend features
4. **Enhance functionality** with previously unavailable capabilities

---

## 🔍 Current State Analysis

### Backend API Structure (Routilux v0.10.0)

#### 1. **Flows API** (`/api/flows`)
- ✅ `GET /api/flows` - List all flows
- ✅ `GET /api/flows/{flow_id}` - Get flow details
- ✅ `POST /api/flows` - Create flow (from DSL or empty)
- ✅ `DELETE /api/flows/{flow_id}` - Delete flow
- ✅ `GET /api/flows/{flow_id}/dsl` - Export flow as DSL (YAML/JSON)
- ✅ `POST /api/flows/{flow_id}/validate` - Validate flow structure
- ✅ `GET /api/flows/{flow_id}/routines` - List flow routines
- ✅ `GET /api/flows/{flow_id}/connections` - List flow connections
- ✅ `POST /api/flows/{flow_id}/routines` - Add routine to flow
- ✅ `POST /api/flows/{flow_id}/connections` - Add connection to flow
- ✅ `DELETE /api/flows/{flow_id}/routines/{routine_id}` - Remove routine
- ✅ `DELETE /api/flows/{flow_id}/connections/{connection_index}` - Remove connection

**Total: 12 endpoints**

#### 2. **Jobs API** (`/api/jobs`)
- ✅ `GET /api/jobs` - List jobs (with filters: flow_id, status, pagination)
- ✅ `GET /api/jobs/{job_id}` - Get job details
- ✅ `POST /api/jobs` - Start new job
- ✅ `POST /api/jobs/{job_id}/pause` - Pause job
- ✅ `POST /api/jobs/{job_id}/resume` - Resume job
- ✅ `POST /api/jobs/{job_id}/cancel` - Cancel job
- ✅ `GET /api/jobs/{job_id}/status` - Get job status
- ✅ `GET /api/jobs/{job_id}/state` - Get full job state
- ✅ `POST /api/jobs/cleanup` - Cleanup old jobs (with filters)

**Total: 9 endpoints**

#### 3. **Monitor API** (`/api/monitor`)
- ✅ `GET /api/jobs/{job_id}/metrics` - Job execution metrics
- ✅ `GET /api/jobs/{job_id}/trace` - Execution trace (with limit)
- ✅ `GET /api/jobs/{job_id}/logs` - Execution logs
- ✅ `GET /api/flows/{flow_id}/metrics` - Flow aggregated metrics
- ✅ `GET /api/jobs/{job_id}/routines/{routine_id}/queue-status` - Routine queue status
- ✅ `GET /api/jobs/{job_id}/queues/status` - All routine queues status
- ✅ `GET /api/flows/{flow_id}/routines/{routine_id}/info` - Routine metadata
- ✅ `GET /api/jobs/{job_id}/routines/status` - All routines execution status
- ✅ `GET /api/jobs/{job_id}/monitoring` - Complete monitoring data

**Total: 9 endpoints**

#### 4. **Debug API** (`/api/debug`)
- ✅ `GET /api/jobs/{job_id}/debug/session` - Get debug session
- ✅ `POST /api/jobs/{job_id}/debug/resume` - Resume from breakpoint
- ✅ `POST /api/jobs/{job_id}/debug/step-over` - Step over
- ✅ `POST /api/jobs/{job_id}/debug/step-into` - Step into
- ✅ `GET /api/jobs/{job_id}/debug/variables` - Get variables (with routine_id)
- ✅ `PUT /api/jobs/{job_id}/debug/variables/{name}` - Set variable
- ✅ `GET /api/jobs/{job_id}/debug/call-stack` - Get call stack
- ✅ `POST /api/jobs/{job_id}/debug/evaluate` - Evaluate expression

**Total: 8 endpoints**

#### 5. **Breakpoints API** (`/api/breakpoints`)
- ✅ `GET /api/jobs/{job_id}/breakpoints` - List breakpoints
- ✅ `POST /api/jobs/{job_id}/breakpoints` - Create breakpoint
- ✅ `PUT /api/jobs/{job_id}/breakpoints/{breakpoint_id}` - Update breakpoint
- ✅ `DELETE /api/jobs/{job_id}/breakpoints/{breakpoint_id}` - Delete breakpoint

**Total: 4 endpoints**

#### 6. **Discovery API** (`/api/discovery`) - **NEW!**
- ✅ `POST /api/discovery/flows/sync` - Sync flows from registry
- ✅ `GET /api/discovery/flows` - Discover flows (read-only)
- ✅ `POST /api/discovery/jobs/sync` - Sync jobs from registry
- ✅ `GET /api/discovery/jobs` - Discover jobs (read-only)

**Total: 4 endpoints** - **Currently NOT used in Overseer!**

#### 7. **WebSocket API** (`/api/ws`)
- ✅ `WS /api/ws/jobs/{job_id}/monitor` - Real-time job monitoring
- ✅ `WS /api/ws/jobs/{job_id}/debug` - Interactive debug session
- ✅ `WS /api/ws/flows/{flow_id}/monitor` - Flow-wide monitoring

**Total: 3 WebSocket endpoints**

#### 8. **Health & Root**
- ✅ `GET /` - Root endpoint
- ✅ `GET /api/health` - Health check (detailed)

**Total: 2 endpoints**

---

### Current Overseer Implementation

#### ✅ Implemented Features
1. **Flow Visualization** - ReactFlow-based flow graph
2. **Job Management** - List, view, start, pause, resume, cancel
3. **Basic Debugging** - Breakpoints, variables, step controls
4. **Real-time Monitoring** - WebSocket integration
5. **Job State Display** - Status, metrics, trace, logs

#### ❌ Missing Features (Available in API but not used)
1. **Discovery API** - No sync/discover functionality
2. **Flow Management** - No create/edit/delete flows in UI
3. **Flow Validation** - No validation UI
4. **Flow DSL Export/Import** - No DSL operations
5. **Flow Metrics** - No flow-level aggregated metrics
6. **Job Cleanup** - No cleanup management UI
7. **Expression Evaluation** - No expression evaluator UI
8. **Routine Info** - No detailed routine metadata display
9. **Queue Status Visualization** - Basic but could be enhanced
10. **Flow Connections Management** - No add/remove connections UI
11. **Flow Routines Management** - No add/remove routines UI

---

## 🎯 Proposed Enhancements

### Phase 1: API Client Regeneration
1. ✅ Run `error_handling_example.py` in background
2. ✅ Fetch `/openapi.json` from running server
3. ✅ Regenerate TypeScript client using `openapi-typescript-codegen` or similar
4. ✅ Update `lib/api/index.ts` wrapper to use new client

### Phase 2: Core API Updates
1. ✅ Fix all broken API calls (endpoint paths may have changed)
2. ✅ Update type definitions
3. ✅ Ensure backward compatibility where needed
4. ✅ Add missing API methods

### Phase 3: New Feature Integration

#### 3.1 Discovery & Sync
- **New Page**: `/app/discovery/page.tsx`
  - Sync flows from registry button
  - Sync jobs from registry button
  - Discover flows/jobs (read-only view)
  - Auto-sync on connection

#### 3.2 Flow Builder/Editor
- **Enhanced Flow Page**: `/app/flows/[flowId]/page.tsx`
  - Flow validation button
  - Export DSL button (YAML/JSON)
  - Import DSL button
  - Add routine button
  - Remove routine button
  - Add connection button
  - Remove connection button
  - Flow metrics panel

#### 3.3 Advanced Monitoring
- **Enhanced Job Page**: `/app/jobs/[jobId]/page.tsx`
  - Queue pressure visualization (enhanced)
  - Routine info panel (metadata, policy, config)
  - Flow metrics comparison
  - Job cleanup controls

#### 3.4 Expression Evaluator
- **New Component**: `components/debug/ExpressionEvaluator.tsx`
  - Expression input field
  - Variable context selector
  - Result display
  - Error handling

#### 3.5 Job Management
- **Enhanced Job List**: `/app/jobs/page.tsx`
  - Advanced filters (flow_id, status, date range)
  - Pagination controls
  - Bulk cleanup actions
  - Job status statistics

---

## 📊 API Endpoint Mapping

### Current vs New Endpoint Names

| Current (Overseer) | New (Backend) | Status |
|-------------------|---------------|--------|
| `api.flows.listFlows()` | `GET /api/flows` | ✅ Working |
| `api.flows.getFlow()` | `GET /api/flows/{flow_id}` | ✅ Working |
| `api.flows.createFlow()` | `POST /api/flows` | ✅ Working |
| `api.flows.deleteFlow()` | `DELETE /api/flows/{flow_id}` | ✅ Working |
| `api.flows.exportFlowDSL()` | `GET /api/flows/{flow_id}/dsl` | ✅ Working |
| `api.flows.validateFlow()` | `POST /api/flows/{flow_id}/validate` | ✅ Working |
| `api.jobs.list()` | `GET /api/jobs` | ⚠️ May need filter updates |
| `api.jobs.get()` | `GET /api/jobs/{job_id}` | ✅ Working |
| `api.jobs.start()` | `POST /api/jobs` | ✅ Working |
| `api.jobs.pause()` | `POST /api/jobs/{job_id}/pause` | ✅ Working |
| `api.jobs.resume()` | `POST /api/jobs/{job_id}/resume` | ✅ Working |
| `api.jobs.cancel()` | `POST /api/jobs/{job_id}/cancel` | ⚠️ May be DELETE now |
| `api.jobs.getState()` | `GET /api/jobs/{job_id}/state` | ✅ Working |
| `api.monitor.getJobMonitoringData()` | `GET /api/jobs/{job_id}/monitoring` | ✅ Working |
| `api.debug.evaluateExpression()` | `POST /api/jobs/{job_id}/debug/evaluate` | ✅ Working (not in UI) |
| `api.discovery.*` | `POST /api/discovery/*` | ❌ Not implemented |

---

## 🔧 Technical Implementation Plan

### Step 1: Setup & Fetch OpenAPI Schema
```bash
# 1. Start the error_handling_example.py in background
cd /home/percy/works/mygithub/routilux-family/routilux
uv run python examples/error_handling_example.py &
API_PID=$!

# 2. Start API server (if not already running)
uv run uvicorn routilux.api.main:app --host 127.0.0.1 --port 20555 &

# 3. Wait for server to be ready
sleep 3

# 4. Fetch OpenAPI schema
curl http://127.0.0.1:20555/openapi.json > routilux-overseer/openapi.json
```

### Step 2: Regenerate TypeScript Client
```bash
cd routilux-overseer

# Option A: Using openapi-typescript-codegen
npx openapi-typescript-codegen --input openapi.json --output lib/api/generated

# Option B: Using openapi-generator
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o lib/api/generated
```

### Step 3: Update API Wrapper
- Update `lib/api/index.ts` to use new generated client
- Maintain backward compatibility wrapper
- Add new methods for discovery, cleanup, etc.

### Step 4: Update Components
- Fix broken API calls
- Add new UI components for missing features
- Enhance existing components with new data

### Step 5: Testing
- Test all API endpoints
- Verify WebSocket connections
- Test new features
- Verify backward compatibility

---

## 🎨 UI/UX Design Recommendations

### 1. Discovery Page
- **Layout**: Two-column layout
  - Left: Sync controls (buttons)
  - Right: Discovered items list
- **Features**:
  - Auto-sync toggle
  - Sync status indicator
  - Last sync timestamp

### 2. Flow Builder
- **Layout**: Split view
  - Left: Flow canvas (existing)
  - Right: Properties panel
    - Flow metadata
    - Validation results
    - DSL export/import
    - Routine management
    - Connection management

### 3. Expression Evaluator
- **Layout**: Modal or sidebar
  - Expression input (code editor)
  - Variable context selector
  - Result display (formatted JSON)
  - Error display
  - History of evaluations

### 4. Enhanced Job Monitoring
- **New Panels**:
  - Queue Pressure Heatmap
  - Routine Info Cards
  - Flow Metrics Comparison
  - Cleanup Controls

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Endpoint Path Changes
**Solution**: Use generated client which handles paths automatically

### Issue 2: Type Mismatches
**Solution**: Regenerate types from OpenAPI, update components gradually

### Issue 3: Breaking Changes in Response Format
**Solution**: Test all endpoints, update type definitions, add migration layer if needed

### Issue 4: Missing Features in Generated Client
**Solution**: Extend generated client with wrapper methods

### Issue 5: WebSocket Endpoint Changes
**Solution**: Check WebSocket router, update connection URLs

---

## 📈 Success Metrics

- ✅ All 46+ API endpoints accessible from Overseer
- ✅ All existing features working with new API
- ✅ All new features implemented and tested
- ✅ Zero breaking changes for existing users
- ✅ Improved UX with new capabilities
- ✅ Better error handling and validation

---

## 🚀 Next Steps

1. **Execute error_handling_example.py** and monitor in background
2. **Fetch OpenAPI schema** from running server
3. **Regenerate TypeScript client**
4. **Update API wrapper** (`lib/api/index.ts`)
5. **Fix broken API calls** in components
6. **Add Discovery page** and functionality
7. **Enhance Flow page** with builder features
8. **Add Expression Evaluator** component
9. **Enhance Job monitoring** with new metrics
10. **Test everything** thoroughly

---

## 📝 Notes

- The backend API is well-structured and comprehensive
- Most endpoints require authentication (`RequireAuth` dependency)
- WebSocket endpoints provide real-time updates
- Discovery API allows syncing flows/jobs created outside API
- Expression evaluation requires `ROUTILUX_EXPRESSION_EVAL_ENABLED=true`
- Job cleanup supports filtering by age and status

---

**Ready to proceed with implementation!** 🎯
