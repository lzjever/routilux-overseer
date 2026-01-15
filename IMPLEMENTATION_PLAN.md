# Routilux Overseer - Implementation Plan

> Complete feature implementation plan based on Routilux API capabilities

**Version**: 1.0.0
**Last Updated**: 2025-01-15
**Status**: Phase 1 Complete, Phase 2 Planning

---

## 📊 API Analysis & Capability Mapping

### Available Routilux APIs

#### 1. **Flow Management APIs**
```
GET    /api/flows                    - List all flows
GET    /api/flows/{id}               - Get flow details
POST   /api/flows                    - Create flow
DELETE /api/flows/{id}               - Delete flow
GET    /api/flows/{id}/dsl           - Export flow DSL
GET    /api/flows/{id}/routines      - Get routines
GET    /api/flows/{id}/connections   - Get connections
GET    /api/flows/{id}/validate      - Validate flow
```

**Capabilities:**
- ✅ Flow listing and visualization (Phase 1 ✅)
- ✅ Flow detail view (Phase 1 ✅)
- ✅ Flow export (DSL export)
- ✅ Flow validation
- 🚧 Flow version management (need backend support)
- 🚧 Flow dependency analysis (need backend support)

#### 2. **Job Management APIs**
```
GET    /api/jobs                     - List all jobs
GET    /api/jobs/{id}                - Get job details
POST   /api/jobs                     - Start new job
POST   /api/jobs/{id}/pause          - Pause job
POST   /api/jobs/{id}/resume         - Resume job
POST   /api/jobs/{id}/cancel         - Cancel job
GET    /api/jobs/{id}/status         - Get job status
GET    /api/jobs/{id}/state          - Get job state (with metrics)
```

**Capabilities:**
- ✅ Job listing (Phase 1 ✅)
- ✅ Job detail view (Phase 1 ✅)
- ✅ Job control (pause/resume/cancel) (Phase 1 ✅)
- ✅ Real-time job monitoring (Phase 3 ✅)
- 🚧 Job batch operations
- 🚧 Job templates & quick start
- 🚧 Job scheduling (need backend support)
- 🚧 Job queue management (need backend support)

#### 3. **Debug APIs**
```
GET    /api/jobs/{id}/debug/session       - Get debug session
POST   /api/jobs/{id}/debug/resume        - Resume execution
POST   /api/jobs/{id}/debug/step-over     - Step over
POST   /api/jobs/{id}/debug/step-into     - Step into
GET    /api/jobs/{id}/debug/variables     - Get variables
PUT    /api/jobs/{id}/debug/variables/{n} - Set variable
GET    /api/jobs/{id}/debug/call-stack    - Get call stack
```

**Capabilities:**
- ✅ Breakpoint management (Phase 4 ✅)
- ✅ Variable inspection (Phase 4 ✅)
- ✅ Step execution (Phase 4 ✅)
- 🚧 Conditional breakpoints
- 🚧 Log breakpoints (log without pausing)
- 🚧 Call stack visualization
- 🚧 Time travel debugging (need backend support)

#### 4. **Breakpoint APIs**
```
POST   /api/jobs/{id}/breakpoints              - Create breakpoint
GET    /api/jobs/{id}/breakpoints              - List breakpoints
DELETE /api/jobs/{id}/breakpoints/{bid}        - Delete breakpoint
PUT    /api/jobs/{id}/breakpoints/{bid}        - Update breakpoint
```

**Capabilities:**
- ✅ Create/delete breakpoints (Phase 4 ✅)
- ✅ Enable/disable breakpoints (Phase 4 ✅)
- ✅ Breakpoint hit tracking (Phase 4 ✅)
- 🚧 Conditional breakpoints (API exists but UI not implemented)
- 🚧 Breakpoint groups

#### 5. **WebSocket Events**
```
Events:
- job_started, job_completed, job_failed, job_paused, job_resumed, job_cancelled
- routine_started, routine_completed, routine_failed
- breakpoint_hit
```

**Capabilities:**
- ✅ Real-time job updates (Phase 3 ✅)
- ✅ Real-time routine execution tracking (Phase 3 ✅)
- ✅ Breakpoint hit notifications (Phase 4 ✅)
- 🚧 Event recording and playback
- 🚧 Event filtering and search

#### 6. **Metrics Data (from Job State API)**
```typescript
interface MetricsResponse {
  job_id: string;
  flow_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  total_events: number;
  total_slot_calls: number;
  total_event_emits: number;
  routine_metrics: Record<string, RoutineMetrics>;
  errors: ErrorRecord[];
}

interface RoutineMetrics {
  routine_id: string;
  execution_count: number;
  total_duration: number;
  avg_duration: number;
  min_duration: number | null;
  max_duration: number | null;
  error_count: number;
  last_execution: string | null;
}
```

**Capabilities:**
- ✅ Basic metrics display (Phase 3 ✅)
- 🚧 Performance analytics
- 🚧 Bottleneck identification
- 🚧 Error rate tracking
- 🚧 Trend analysis (need historical data storage)

---

## 🎯 Phase 2: Audit & Alerting (Current Priority)

### 2.1 📋 Audit Center

#### Features to Implement

**2.1.1 Event Logging System**
- [ ] Create `lib/stores/auditStore.ts`
- [ ] Record all user actions:
  - Job operations (start/pause/resume/cancel)
  - Debug operations (breakpoint changes, step execution)
  - Flow operations (view/export)
  - Connection changes
- [ ] Store events in IndexedDB for persistence
- [ ] Add timestamps, user context, action results

**2.1.2 Timeline View**
- [ ] Create `app/audit/page.tsx`
- [ ] Timeline visualization component
- [ ] Filterable by event type, time range, flow, job
- [ ] Event details panel
- [ ] Export to CSV/JSON

**2.1.3 Audit Reports**
- [ ] Generate compliance reports
- [ ] Summary statistics
- [ ] Anomaly detection
- [ ] PDF export

**Data Structure:**
```typescript
interface AuditEvent {
  event_id: string;
  timestamp: string;
  event_type: "job_operation" | "debug_operation" | "flow_operation" | "system";
  user_id: string;
  action: string;
  target_type: "job" | "flow" | "breakpoint";
  target_id: string;
  details: Record<string, any>;
  result: "success" | "failed";
  error?: string;
}
```

**Implementation Priority:**
1. High - Event logging (foundation for other features)
2. High - Timeline view (user-visible feature)
3. Medium - Reports (compliance requirement)

---

### 2.2 🔔 Alert Console

#### Features to Implement

**2.2.1 Alert Rule Engine**
- [ ] Create `lib/stores/alertStore.ts`
- [ ] Create `lib/alerting/rule-engine.ts`
- [ ] Rule types:
  - Job failure alerts
  - Job timeout alerts (based on duration)
  - High error rate alerts
  - Performance degradation alerts
- [ ] Rule conditions:
  - Thresholds (e.g., error rate > 5%)
  - Time windows (e.g., last 10 minutes)
  - Flow-specific or global

**2.2.2 Alert Channels**
- [ ] Browser push notifications
- [ ] Email notifications (need backend service)
- [ ] Webhook notifications (Slack, Discord, etc.)
- [ ] In-app notification center

**2.2.3 Alert Management**
- [ ] Create `app/alerts/page.tsx`
- [ ] Alert history view
- [ ] Alert configuration UI
- [ ] Alert acknowledgment workflow
- [ ] Alert grouping and deduplication

**Data Structure:**
```typescript
interface AlertRule {
  rule_id: string;
  name: string;
  description: string;
  enabled: boolean;
  rule_type: "job_failure" | "job_timeout" | "error_rate" | "performance";
  conditions: {
    threshold?: number;
    time_window?: number; // seconds
    flow_id?: string;
  };
  severity: "critical" | "warning" | "info";
  channels: NotificationChannel[];
  cooldown_period: number; // seconds
}

interface Alert {
  alert_id: string;
  rule_id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  context: {
    job_id?: string;
    flow_id?: string;
    error_message?: string;
  };
  triggered_at: string;
  status: "active" | "acknowledged" | "resolved";
}
```

**Implementation Priority:**
1. High - Rule engine (core functionality)
2. High - In-app notifications (user-visible)
3. Medium - Browser notifications (enhancement)
4. Low - External integrations (need backend)

---

## 📈 Phase 3: Performance Analytics

### 3.1 Performance Metrics Dashboard

**3.1.1 Flow Performance**
- [ ] Create `app/analytics/page.tsx`
- [ ] Flow execution time charts
- [ ] Routine-level performance breakdown
- [ ] Bottleneck identification
- [ ] Comparison between flows

**3.1.2 Job Analytics**
- [ ] Job throughput over time
- [ ] P50/P95/P99 duration percentiles
- [ ] Failure rate trends
- [ ] Retry statistics
- [ ] Queue wait times (if data available)

**3.1.3 Error Analysis**
- [ ] Error frequency by type
- [ ] Error-prone routines identification
- [ ] Error trend visualization
- [ ] Error drill-down (view context)

**Data Storage Strategy:**
- Use IndexedDB to store historical job/metrics data
- Periodic aggregation for performance
- Retention policy (e.g., 90 days)

**Implementation Priority:**
1. Medium - Basic charts (requires data accumulation)
2. Medium - Advanced analytics (complex queries)
3. Low - Predictive analytics (ML models)

---

## 🚀 Phase 4: Enhanced Flow Management

### 4.1 Flow Studio Enhancements

**4.1.1 Flow Comparison**
- [ ] Side-by-side flow diff viewer
- [ ] Highlight routine/connection changes
- [ ] Export diff report

**4.1.2 Flow Testing**
- [ ] Dry-run mode (need backend API)
- [ ] Test parameter presets
- [ ] Test history and results

**4.1.3 Flow Deployment**
- [ ] Multiple environment support (dev/staging/prod)
- [ ] Deployment history
- [ ] Rollback capability

**Implementation Priority:**
1. Medium - Flow comparison (useful for developers)
2. Low - Testing/Deployment (need backend support)

---

## 🎮 Phase 5: Job Management Enhancements

### 5.1 Job Queue & Scheduling

**5.1.1 Job Templates**
- [ ] Create `app/jobs/templates/page.tsx`
- [ ] Save job start parameters as templates
- [ ] Quick start from templates
- [ ] Template management (create/edit/delete)

**5.1.2 Job Batch Operations**
- [ ] Multi-select jobs
- [ ] Batch cancel
- [ ] Batch retry
- [ ] Bulk status updates

**Implementation Priority:**
1. High - Job templates (user-friendly)
2. Medium - Batch operations (power user feature)

---

## 🐛 Phase 6: Debugging Enhancements

### 6.1 Advanced Debugging Features

**6.1.1 Conditional Breakpoints**
- [ ] Add condition field to breakpoint UI
- [ ] Expression evaluation
- [ ] Hit counter display

**6.1.2 Log Breakpoints**
- [ ] "Log and continue" breakpoint mode
- [ ] Message formatting
- [ ] Log history panel

**6.1.3 Call Stack Visualization**
- [ ] Visual call stack tree
- [ ] Navigate between frames
- [ ] Variable inspection per frame

**Implementation Priority:**
1. High - Conditional breakpoints (API exists)
2. Medium - Log breakpoints (need backend)
3. Medium - Call stack viz (UI enhancement)

---

## 🔐 Phase 7: Enterprise Features

### 7.1 Security & Compliance

**7.1.1 RBAC**
- [ ] User role management (Admin/Operator/Viewer)
- [ ] Permission system
- [ ] Role-based UI access control

**7.1.2 Audit Trail Enhancement**
- [ ] Digital signatures for audit logs
- [ ] Tamper detection
- [ ] Immutable storage

**Implementation Priority:**
1. Low - Requires backend authentication system

---

## 📊 Data Architecture

### Storage Strategy

**Browser Storage (IndexedDB):**
```typescript
// Stores to implement:
1. auditStore      - Audit events
2. alertStore      - Alert rules and history
3. metricsStore    - Historical metrics
4. templatesStore  - Job templates
```

**Data Retention:**
```
Audit Events:      1 year (configurable)
Alerts:           90 days
Metrics:          90 days (with aggregation)
Templates:        Persistent
```

### Performance Optimization

**Data Pagination:**
- All list views should support pagination
- Default page size: 50 items
- Infinite scroll option

**Data Aggregation:**
- Pre-aggregate metrics hourly/daily
- Cache aggregation results
- Lazy loading for charts

---

## 🛠️ Technical Implementation Details

### New API Wrappers Needed

```typescript
// lib/api/alerts.ts
export class AlertsAPI {
  // Browser-based alert management
  // Will use localStorage + IndexedDB
}

// lib/api/audit.ts
export class AuditAPI {
  // Audit event recording and querying
  // Will use IndexedDB
}

// lib/api/templates.ts
export class TemplatesAPI {
  // Job template CRUD
  // Will use localStorage
}

// lib/api/metrics.ts
export class MetricsAPI {
  // Historical metrics aggregation
  // Will use IndexedDB
}
```

### New State Stores Needed

```typescript
// lib/stores/alertStore.ts
export interface AlertState {
  rules: AlertRule[];
  alerts: Alert[];
  unreadCount: number;

  addRule: (rule: AlertRule) => void;
  updateRule: (ruleId: string, updates: Partial<AlertRule>) => void;
  deleteRule: (ruleId: string) => void;
  triggerAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
}

// lib/stores/auditStore.ts
export interface AuditState {
  events: AuditEvent[];
  filters: AuditFilters;

  addEvent: (event: AuditEvent) => void;
  getEvents: (filters?: AuditFilters) => AuditEvent[];
  exportEvents: (format: "csv" | "json") => string;
}

// lib/stores/templateStore.ts
export interface TemplateState {
  templates: JobTemplate[];

  saveTemplate: (template: JobTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  getTemplates: () => JobTemplate[];
  startJobFromTemplate: (templateId: string) => Promise<JobResponse>;
}

// lib/stores/metricsStore.ts
export interface MetricsState {
  historicalMetrics: Map<string, MetricsResponse[]>;

  recordMetrics: (jobId: string, metrics: MetricsResponse) => void;
  getMetrics: (jobId: string) => MetricsResponse[];
  getAggregatedMetrics: (timeRange: TimeRange) => AggregatedMetrics;
}
```

### New Components Needed

**Audit Center:**
```
components/audit/
├── AuditTimeline.tsx           - Timeline visualization
├── AuditEventDetails.tsx       - Event detail panel
├── AuditFilters.tsx            - Filter controls
└── AuditReport.tsx             - Report generation
```

**Alert Console:**
```
components/alerting/
├── AlertRulesList.tsx          - Rules management
├── AlertRuleEditor.tsx         - Rule CRUD
├── AlertNotificationCenter.tsx - In-app alerts
├── AlertHistory.tsx            - Alert history
└── AlertBadge.tsx              - Navbar alert indicator
```

**Analytics:**
```
components/analytics/
├── PerformanceChart.tsx        - Performance over time
├── ErrorRateChart.tsx          - Error trends
├── FlowComparison.tsx          - Flow comparison
└── RoutineBreakdown.tsx        - Routine-level metrics
```

**Job Management:**
```
components/jobs/
├── JobTemplates.tsx            - Template management
├── JobBatchActions.tsx         - Batch operations
└── JobQuickStart.tsx           - Quick start dialog
```

---

## 📅 Implementation Roadmap

### Q1 2025: Audit & Alerting (Phase 2)
**Week 1-2: Audit Center**
- [ ] Audit store and API
- [ ] Event logging system
- [ ] Timeline view
- [ ] Export functionality

**Week 3-4: Alert Console**
- [ ] Alert rule engine
- [ ] In-app notifications
- [ ] Alert history
- [ ] Rule configuration UI

### Q2 2025: Analytics (Phase 3)
**Week 5-6: Metrics Collection**
- [ ] Metrics store
- [ ] Historical data collection
- [ ] Data aggregation

**Week 7-8: Analytics Dashboard**
- [ ] Performance charts
- [ ] Error analysis
- [ ] Trend visualization

### Q3 2025: Enhancements (Phase 4-6)
**Week 9-10: Flow Management**
- [ ] Flow comparison
- [ ] Job templates

**Week 11-12: Debugging**
- [ ] Conditional breakpoints
- [ ] Call stack visualization
- [ ] Log breakpoints

### Q4 2025: Polish & Enterprise (Phase 7)
**Week 13-14: Enterprise**
- [ ] RBAC foundation
- [ ] Enhanced audit trail

**Week 15-16: Documentation & Testing**
- [ ] Comprehensive documentation
- [ ] E2E testing
- [ ] Performance optimization

---

## 🎯 Success Metrics

### Phase 2 (Audit & Alerting)
- ✅ All user actions recorded
- ✅ 100% searchable audit trail
- ✅ Alert latency < 1 second
- ✅ Zero false negatives for critical alerts

### Phase 3 (Analytics)
- ✅ Support 10,000+ historical jobs
- ✅ Chart rendering < 500ms
- ✅ Data aggregation < 2s for 90 days

### Overall Platform
- ✅ Page load time < 2s
- ✅ Real-time updates < 100ms
- ✅ Support 1000+ concurrent jobs monitored

---

## 📝 Notes

### Backend Dependencies

Some features require backend support from Routilux:
- Job scheduling/cron
- Flow versioning
- Time travel debugging
- Dry-run mode
- Multi-environment deployment

### Frontend-Only Features

These can be implemented entirely in the frontend:
- ✅ Audit logging
- ✅ Alert rule engine
- ✅ Performance analytics (with accumulated data)
- ✅ Job templates
- ✅ Flow comparison
- ✅ Batch operations

### Browser Storage Limits

- IndexedDB: ~50-500MB per origin
- localStorage: ~5-10MB per origin
- Need to implement cleanup policies for old data

---

**Document Status**: ✅ Complete
**Next Steps**: Begin Phase 2.1 (Audit Center) implementation
