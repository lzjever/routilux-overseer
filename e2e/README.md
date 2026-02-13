# E2E Tests for Routlux Overseer

End-to-end tests using Playwright to verify the routilux-overseer application works correctly with a real routilux server.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Start the overseer dev server (in another terminal)
cd .. && npm run dev

# Run tests
npx playwright test
```

## Prerequisites

1. **routilux CLI installed**:

```bash
pip install -e /path/to/routilux
```

2. **Overseer dev server running**:

```bash
npm run dev  # Runs on http://localhost:3000
```

3. **Node.js 18+ and Python 3.10+**

## Test Structure

```
e2e/
├── fixtures/              # Test infrastructure
│   ├── test-routines/     # Test routines for routilux server
│   ├── page-objects/      # Page Object Models
│   ├── server-manager.ts  # Server lifecycle management
│   └── fixtures.ts        # Playwright test fixtures
├── tests/                 # Test cases
│   ├── 01-connection.spec.ts
│   ├── 02-flows.spec.ts
│   ├── 03-jobs.spec.ts
│   ├── 04-workers.spec.ts
│   ├── 05-debugging.spec.ts
│   └── journeys/          # End-to-end user journeys
└── playwright.config.ts    # Playwright configuration
```

## Running Tests

### All tests

```bash
npx playwright test
```

### Specific test file

```bash
npx playwright test tests/01-connection.spec.ts
```

### With UI (interactive)

```bash
npx playwright test --ui
```

### Debug mode

```bash
npx playwright test --debug
```

### View test report

```bash
npx playwright show-report
```

## Test Routines

The test suite includes specialized routines for testing:

| Category       | Routines                                                                                |
| -------------- | --------------------------------------------------------------------------------------- |
| **Sources**    | `e2e_data_generator`, `e2e_number_source`, `e2e_delayed_source`                         |
| **Processors** | `e2e_data_transformer`, `e2e_data_filter`, `e2e_data_aggregator`, `e2e_error_simulator` |
| **Sinks**      | `e2e_data_collector`, `e2e_batch_collector`, `e2e_counter_sink`, `e2e_assertion_sink`   |

## Environment Variables

| Variable            | Description             | Default                 |
| ------------------- | ----------------------- | ----------------------- |
| `OVERSEER_BASE_URL` | URL of the overseer app | `http://localhost:3000` |

## Documentation

- [Test Plan](../docs/e2e/TEST_PLAN.md) - Complete test documentation
- [Bug Report](../docs/e2e/BUG_REPORT.md) - Issues found in routilux CLI

## Troubleshooting

**Server not starting**: Ensure routilux is installed and importable

```bash
python -c "import routilux.cli.main; print('OK')"
```

**Tests timing out**: Check if overseer dev server is running on port 3000

**Port conflicts**: Tests automatically find available ports starting from 20555
