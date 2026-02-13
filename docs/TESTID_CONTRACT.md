# TestID Naming Contract

## Overview

This document defines the naming conventions for `data-testid` attributes used in the routilux-overseer application. These testids are essential for reliable E2E testing and component testing.

## Naming Convention

### Format

```
data-testid="[scope]-[element]-[action]"
```

### Components

1. **scope**: The page, component, or feature area (e.g., `connect`, `flows`, `jobs`, `workers`)
2. **element**: The type of element (e.g., `button`, `input`, `card`, `modal`, `table`)
3. **action** (optional): The specific action or purpose (e.g., `submit`, `cancel`, `refresh`, `delete`)

### Examples

```tsx
// Good
<button data-testid="connect-button-submit">Connect</button>
<input data-testid="connect-input-server-url" />
<div data-testid="flows-card-list">
<button data-testid="jobs-button-refresh">Refresh</button>

// Avoid
<button data-testid="btn1">Submit</button>
<input data-testid="input" />
```

## Element Types

| Element Type    | Suffix    | Example                     |
| --------------- | --------- | --------------------------- |
| Button          | `button`  | `connect-button-submit`     |
| Input           | `input`   | `connect-input-api-key`     |
| Select/Dropdown | `select`  | `jobs-select-status-filter` |
| Card            | `card`    | `flows-card-item`           |
| Modal           | `modal`   | `confirm-modal`             |
| Table           | `table`   | `jobs-table-list`           |
| Table Row       | `row`     | `jobs-row-{jobId}`          |
| Badge           | `badge`   | `status-badge`              |
| Icon            | `icon`    | `refresh-icon`              |
| Link            | `link`    | `nav-link-flows`            |
| Form            | `form`    | `connect-form`              |
| Error Message   | `error`   | `connect-error-message`     |
| Loading Spinner | `spinner` | `loading-spinner`           |
| Empty State     | `empty`   | `jobs-empty-state`          |
| Dialog          | `dialog`  | `confirm-dialog`            |
| Tooltip         | `tooltip` | `help-tooltip`              |

## Scopes by Page

### Pages

| Page                  | Scope           | Key Elements                                                                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/connect`            | `connect`       | `connect-form`, `connect-input-server-url`, `connect-input-api-key`, `connect-button-submit`, `connect-button-test` |
| `/` (Home)            | `home`          | `home-card-flows`, `home-card-jobs`, `home-card-workers`                                                            |
| `/flows`              | `flows`         | `flows-button-create`, `flows-button-refresh`, `flows-card-{flowId}`, `flows-empty-state`                           |
| `/flows/[flowId]`     | `flow-detail`   | `flow-detail-title`, `flow-detail-canvas`, `flow-detail-button-edit`, `flow-detail-button-delete`                   |
| `/jobs`               | `jobs`          | `jobs-button-create`, `jobs-button-refresh`, `jobs-select-filter`, `jobs-table-list`, `jobs-row-{jobId}`            |
| `/jobs/[jobId]`       | `job-detail`    | `job-detail-title`, `job-detail-status`, `job-detail-tabs`, `job-detail-button-cancel`                              |
| `/workers`            | `workers`       | `workers-button-create`, `workers-button-refresh`, `workers-card-{workerId}`, `workers-empty-state`                 |
| `/workers/[workerId]` | `worker-detail` | `worker-detail-title`, `worker-detail-status`, `worker-detail-button-pause`, `worker-detail-button-stop`            |
| `/runtimes`           | `runtimes`      | `runtimes-card-list`, `runtimes-card-{runtimeId}`                                                                   |
| `/plugins`            | `plugins`       | `plugins-card-list`, `plugins-card-{pluginId}`                                                                      |

### Shared Components

| Component      | Scope     | Key Elements                                                                                |
| -------------- | --------- | ------------------------------------------------------------------------------------------- |
| Navbar         | `nav`     | `nav-link-home`, `nav-link-flows`, `nav-link-jobs`, `nav-link-workers`, `nav-link-runtimes` |
| StatusBadge    | `status`  | `status-badge`                                                                              |
| ConfirmDialog  | `confirm` | `confirm-dialog`, `confirm-button-confirm`, `confirm-button-cancel`                         |
| EmptyState     | `empty`   | `empty-state-icon`, `empty-state-title`, `empty-state-description`                          |
| LoadingSpinner | `loading` | `loading-spinner`                                                                           |
| ErrorAlert     | `error`   | `error-alert`, `error-message`                                                              |

### Forms

| Form Type | Pattern                | Example             |
| --------- | ---------------------- | ------------------- |
| Create    | `create-{entity}-form` | `create-flow-form`  |
| Edit      | `edit-{entity}-form`   | `edit-flow-form`    |
| Filter    | `filter-{entity}-form` | `filter-jobs-form`  |
| Search    | `search-{entity}-form` | `search-flows-form` |

## Action Suffixes

| Action          | Suffix    | Example                 |
| --------------- | --------- | ----------------------- |
| Submit form     | `submit`  | `connect-button-submit` |
| Cancel action   | `cancel`  | `modal-button-cancel`   |
| Refresh data    | `refresh` | `jobs-button-refresh`   |
| Delete item     | `delete`  | `flow-button-delete`    |
| Edit item       | `edit`    | `flow-button-edit`      |
| Create new      | `create`  | `flows-button-create`   |
| View details    | `view`    | `job-button-view`       |
| Pause           | `pause`   | `worker-button-pause`   |
| Resume          | `resume`  | `worker-button-resume`  |
| Stop            | `stop`    | `worker-button-stop`    |
| Test connection | `test`    | `connect-button-test`   |
| Close           | `close`   | `modal-button-close`    |
| Export          | `export`  | `flow-button-export`    |
| Import          | `import`  | `flow-button-import`    |

## Dynamic TestIDs

For elements that are repeated in lists or have dynamic content:

```tsx
// List items
<div data-testid={`flows-card-${flowId}`}>

// Table rows
<tr data-testid={`jobs-row-${jobId}`}>

// Tab panels
<div data-testid={`tab-panel-${tabName}`}>

// Form fields with dynamic names
<input data-testid={`form-input-${fieldName}`}>
```

## Usage in Tests

### Playwright

```typescript
// Good - using testid
await page.getByTestId("connect-button-submit").click();
await page.getByTestId("connect-input-server-url").fill("http://localhost:20555");

// Avoid - using text or CSS selectors
await page.getByRole("button", { name: "Connect" }).click();
await page.locator("#server-url").fill("http://localhost:20555");
```

### React Testing Library

```typescript
// Good - using testid
render(<ConnectPage />);
fireEvent.change(screen.getByTestId('connect-input-server-url'), {
  target: { value: 'http://localhost:20555' }
});
fireEvent.click(screen.getByTestId('connect-button-submit'));

// Avoid - using text only
fireEvent.click(screen.getByText('Connect'));
```

## Best Practices

1. **Always add testids to interactive elements** - buttons, inputs, selects, links
2. **Use consistent naming** - follow the scope-element-action pattern
3. **Keep testids stable** - don't change them unless necessary
4. **Avoid using text content** - text can change, testids should be stable
5. **Use dynamic testids for lists** - include unique identifiers like IDs
6. **Document new testids** - update this contract when adding new elements
7. **Test accessibility too** - testids complement, not replace, accessibility testing

## Checklist for New Features

- [ ] All buttons have testids
- [ ] All form inputs have testids
- [ ] All links have testids
- [ ] All modals/dialogs have testids
- [ ] All error messages have testids
- [ ] All empty states have testids
- [ ] All loading states have testids
- [ ] All filter/search inputs have testids
- [ ] All table rows have dynamic testids
- [ ] Testids documented in this contract
