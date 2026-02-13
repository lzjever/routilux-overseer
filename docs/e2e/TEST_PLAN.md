# E2E Test Plan for Routilux Overseer

**Version**: 1.0.0
**Last Updated**: 2026-02-10
**Test Framework**: Playwright

---

## Overview

This document describes the End-to-End (E2E) testing strategy for the routilux-overseer application. The E2E tests verify the complete functionality of the application by testing it against a real routilux CLI server.

---

## Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        E2E Test Suite                       │
│                    (Playwright + Node.js)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────────┐             │
│  │ Page Objects │────────▶│  Test Fixtures   │             │
│  │              │         │                  │             │
│  │ - ConnectPage│         │ - ServerManager  │             │
│  │ - FlowsPage  │         │ - TestRoutines   │             │
│  │ - JobsPage   │         │                  │             │
│  │ - etc.       │         │                  │             │
│  └──────────────┘         └──────────────────┘             │
│          │                          │                       │
│          │                          ▼                       │
│          │                 ┌──────────────────┐            │
│          │                 │ Routlux CLI      │            │
│          │                 │ Server (Python)  │            │
│          │                 │                  │            │
│          │                 │ - Test Routines  │            │
│          │                 │ - HTTP API       │            │
│          │                 │ - WebSocket      │            │
│          │                 └──────────────────┘            │
│          │                                                  │
│          └─────────────────────────────────────────────────┘
│                          │
│                          ▼
│                 ┌──────────────────┐
│                 │ Routlux Overseer │
│                 │   (Next.js App)  │
│                 │                  │
│                 │ - React UI       │
│                 │ - API Client     │
│                 │ - WebSocket      │
│                 └──────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## Test Structure

### Directory Layout

```
e2e/
├── fixtures/                 # Test infrastructure
│   ├── test-routines/        # Shared test routines for routilux
│   │   ├── sources/          # Data source routines
│   │   ├── processors/       # Data processing routines
│   │   ├── sinks/            # Data collection routines
│   │   └── flows/            # Pre-defined flow DSLs
│   ├── helpers/              # Utility functions
│   ├── page-objects/         # Page Object Models
│   └── *.ts                  # Server management, fixtures
├── tests/                    # Test cases
│   ├── 01-connection.spec.ts # Connection tests
│   ├── 02-flows.spec.ts      # Flow management tests
│   ├── 03-jobs.spec.ts       # Job execution tests
│   ├── 04-workers.spec.ts    # Worker management tests
│   ├── 05-debugging.spec.ts  # Debugging features tests
│   └── journeys/             # End-to-end user journeys
│       └── create-execute-flow.spec.ts
├── playwright.config.ts       # Playwright configuration
└── package.json              # E2E dependencies
```

---

## Test Categories

### 1. Connection Tests (`01-connection.spec.ts`)

**Purpose**: Verify the connection setup and configuration.

| Test Case                | Description                            | Priority |
| ------------------------ | -------------------------------------- | -------- |
| Connection form display  | Verify connection UI elements          | P1       |
| Invalid URL rejection    | Test error handling for invalid URLs   | P1       |
| Valid server connection  | Test successful connection to routilux | P1       |
| Connection persistence   | Verify settings are saved              | P2       |
| Post-connection redirect | Verify redirect to home page           | P2       |

### 2. Flows Management Tests (`02-flows.spec.ts`)

**Purpose**: Test flow listing, viewing, and management.

| Test Case               | Description                             | Priority |
| ----------------------- | --------------------------------------- | -------- |
| Routine listing         | Verify routines from factory are listed | P1       |
| Flow list display       | Test flow list UI                       | P1       |
| Flow sync from registry | Test registry synchronization           | P1       |
| Flow detail navigation  | Test navigating to flow details         | P2       |
| Flow canvas display     | Verify flow visualization               | P2       |
| DSL export              | Test exporting flow as DSL              | P2       |

### 3. Jobs Management Tests (`03-jobs.spec.ts`)

**Purpose**: Test job execution and monitoring.

| Test Case                   | Description                       | Priority |
| --------------------------- | --------------------------------- | -------- |
| Jobs list display           | Verify jobs page loads            | P1       |
| Empty state handling        | Test empty jobs state             | P2       |
| Status filtering            | Test filtering jobs by status     | P2       |
| Job execution               | Test submitting and running a job | P1       |
| Job detail monitoring       | Test real-time job updates        | P1       |
| Job completion verification | Verify job finishes successfully  | P1       |

### 4. Workers Management Tests (`04-workers.spec.ts`)

**Purpose**: Test worker lifecycle management.

| Test Case            | Description                       | Priority |
| -------------------- | --------------------------------- | -------- |
| Workers list display | Verify workers page loads         | P1       |
| Empty state handling | Test empty workers state          | P2       |
| Start worker         | Test starting a worker for a flow | P1       |
| Pause/Resume worker  | Test worker pause/resume          | P2       |
| Stop worker          | Test stopping a running worker    | P2       |

### 5. Debugging Features Tests (`05-debugging.spec.ts`)

**Purpose**: Test debugging and troubleshooting features.

| Test Case             | Description                     | Priority |
| --------------------- | ------------------------------- | -------- |
| Event log display     | Verify event log is shown       | P1       |
| Routine visualization | Test routine nodes on canvas    | P2       |
| Shared data panel     | Test viewing shared data        | P2       |
| Error display         | Test error information is shown | P1       |

### 6. Journey Tests (`journeys/`)

**Purpose**: Test complete user workflows end-to-end.

| Journey               | Description                      | Priority |
| --------------------- | -------------------------------- | -------- |
| Create & Execute Flow | Full flow creation and execution | P1       |
| Handle Failed Job     | Error handling workflow          | P2       |

---

## Test Routines

The test suite includes a comprehensive set of test routines registered with the routilux factory:

### Sources

- `e2e_data_generator`: Generates configurable test data
- `e2e_number_source`: Generates number sequences
- `e2e_delayed_source`: Generates data with delay (async testing)

### Processors

- `e2e_data_transformer`: Transforms data (uppercase, prefix, compute)
- `e2e_data_filter`: Filters data by conditions
- `e2e_data_aggregator`: Aggregates data into statistics
- `e2e_error_simulator`: Simulates errors for testing

### Sinks

- `e2e_data_collector`: Collects and returns data
- `e2e_batch_collector`: Collects data in batches
- `e2e_counter_sink`: Counts items received
- `e2e_assertion_sink`: Asserts conditions on data

### Pre-defined Flows

- `simple_flow.json`: Basic generator → transformer → collector
- `filter_flow.json`: Number source → filter → counter
- `error_flow.json`: Generator → error simulator

---

## Running Tests

### Prerequisites

1. **Install dependencies**:

```bash
cd e2e
npm install
```

2. **Install Playwright browsers**:

```bash
npx playwright install chromium
```

3. **Ensure routilux is installed**:

```bash
pip install -e /path/to/routilux
```

4. **Start the overseer dev server** (in separate terminal):

```bash
cd /path/to/routilux-overseer
npm run dev
```

### Run All Tests

```bash
cd e2e
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/01-connection.spec.ts
```

### Run with UI

```bash
npx playwright test --ui
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

### View Test Report

```bash
npx playwright show-report
```

---

## Environment Variables

| Variable            | Description                    | Default                 |
| ------------------- | ------------------------------ | ----------------------- |
| `OVERSEER_BASE_URL` | URL of the overseer app        | `http://localhost:3000` |
| `ROUTILUX_CLI_PATH` | Path to routilux CLI           | Auto-detected           |
| `E2E_SERVER_PORT`   | Starting port for test servers | `20555`                 |

---

## Continuous Integration

The E2E tests are designed to run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: "20"

- name: Setup Python
  uses: actions/setup-python@v4
  with:
    python-version: "3.12"

- name: Install dependencies
  run: |
    pip install -e ../routilux
    cd e2e && npm install

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Start overseer dev server
  run: npm run dev &

- name: Run E2E tests
  run: cd e2e && npx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: e2e/playwright-report/
```

---

## Test Maintenance

### Adding New Tests

1. Create test file in appropriate category
2. Use page objects for UI interactions
3. Use the `server` fixture for backend operations
4. Follow naming convention: `[number]-[category].spec.ts`

### Adding New Test Routines

1. Create routine file in `e2e/fixtures/test-routines/`
2. Use `@auto_register_routine` decorator
3. Include proper type hints and docstrings
4. Add error handling for edge cases

### Debugging Failed Tests

1. Run with `--debug` flag
2. Check screenshots in `e2e/test-results/`
3. Review traces in `e2e/playwright-trace/`
4. Check server logs via `server.getStdout()` and `server.getStderr()`

---

## Known Limitations

1. **Server Stop Command**: The routilux CLI doesn't implement `server stop`, so tests use SIGTERM to stop servers
2. **Port Conflicts**: Tests run sequentially to avoid port conflicts
3. **Python Path**: Test routines must be discoverable by routilux
4. **Browser Limitations**: Currently only Chromium is tested

---

## Related Documents

- [Bug Report](./BUG_REPORT.md) - Issues found in routilux CLI during testing
- [Architecture Documentation](../../README.md) - Main project documentation

---

## Changelog

| Version | Date       | Changes                         |
| ------- | ---------- | ------------------------------- |
| 1.0.0   | 2026-02-10 | Initial E2E test infrastructure |
