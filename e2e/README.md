# E2E Tests

Playwright end-to-end tests for routilux-overseer. Tests require the overseer app running (e.g. `npm run dev` on port 3000) and optionally a routilux server for API contract tests.

## TestID Standard

All selectors should use `data-testid` attributes. The naming standard is documented in **[docs/TESTID_CONTRACT.md](../docs/TESTID_CONTRACT.md)**.

### Quick reference

| Pattern | Example | Usage |
|--------|---------|--------|
| Page container | `{scope}-page` | `flows-page`, `jobs-page`, `workers-page` |
| List container | `{scope}-list` | `flows-list`, `jobs-list`, `workers-list` |
| Empty state | `{scope}-empty-state` | `flows-empty-state`, `jobs-empty-state` |
| Loading | `{scope}-loading` | `flows-loading`, `jobs-loading` |
| Not connected | `{scope}-not-connected` | `flows-not-connected`, `jobs-not-connected` |
| Button | `{scope}-button-{action}` | `connect-button-submit`, `flows-button-refresh` |
| Per-item card/row | `{scope}-card-{id}` or `{scope}-row-{id}` | `flows-card-{flowId}`, `jobs-row-{jobId}`, `workers-card-{workerId}` |
| Per-item actions | `{scope}-button-{action}-{id}` | `workers-button-pause-{workerId}`, `flows-button-view-{flowId}` |
| Input | `{scope}-input-{name}` | `connect-input-server-url`, `flows-input-search` |
| Nav | `nav-link-{page}` | `nav-link-home`, `nav-link-flows` |

### Running tests

```bash
# From project root
npm run test:e2e

# From e2e directory (uses local playwright.config)
cd e2e && npx playwright test

# With local routilux server for API contract tests
ROUTILUX_WORKSPACE=/path/to/routilux npm run test:e2e

# Run a single spec
npx playwright test tests/01-connection.spec.ts
```

### Structure

- `tests/` – spec files (01-connection, 02-flows, 03-jobs, 04-workers, 05-debugging, 06-visual-regression, 07-api-contract, journeys/)
- `fixtures/` – Playwright fixtures, page objects, server manager
- `snapshots/` – visual regression snapshots
