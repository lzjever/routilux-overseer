# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-01

### Added

- **ConfirmDialog**: Reusable confirmation dialog for destructive actions (replaces `window.confirm`).
- **Connection UX**: Recent servers (last 3 URLs) on connect page; optional connection display name shown in Navbar.
- **Connection-lost banner**: Global banner with Retry and Reconnect when API/network fails; debounced reporting from key pages.
- **Empty states**: Unified pattern (title + description + primary/secondary action); Flows empty state with "Sync from registry" and "Create flow"; Jobs/Workers copy aligned; optional first-run hint on Home (dismissible).
- **Flow list**: "Last synced: X ago" or "—" per flow card using discovery timestamp.
- **Error utilities**: `lib/errors` — `getApiErrorMessage`, `parseApiErrorBody`, `isNetworkError` for API/structured errors; re-exports `handleError` for stores.
- **Docs**: `docs/empty_states.md`; `docs/flow_sources.md` (Routilux) linked from README.

### Changed

- **Feedback**: All success/error feedback uses toasts (sonner); destructive confirmations use ConfirmDialog (no `alert`/`confirm`).
- **API client**: Discovery and job-state stores use shared `getAPI()` instead of `createAPI(serverUrl)`; plugin manager uses `getAPI()`.
- **Flows page**: Helper text "Sync imports flows created in code or loaded from server files."; CreateFlowWizard supports controlled `open`/`onOpenChange` for empty-state secondary action.
- **Connect page**: Recent server URLs and optional connection name; store persists `recentServerUrls` and `connectionDisplayName`.
- **E2E**: Removed dialog auto-accept for flows sync test (assert on toast/state instead).

### Fixed

- **Build**: Re-export `handleError` from `lib/errors` so stores and breakpointStore build successfully.
- **Tests**: `renderWithProviders` wraps with `ConfirmDialogProvider`; flows-page and connect-page tests updated for new store fields and dialog usage.

## [1.0.1] - 2025-02-13

### Added

- Comprehensive E2E test suite with Playwright
  - Connection management tests
  - Flows page tests
  - Jobs page tests
  - Workers page tests
  - Debugging feature tests
  - Visual regression tests
  - API contract tests
- TESTID_CONTRACT.md documenting testid naming conventions
- Visual regression test infrastructure with screenshot comparison
- API contract tests to validate routilux API compatibility

### Changed

- API Key storage changed from localStorage to sessionStorage for improved security
- WebSocket authentication uses query parameter for API key
- QueryService now has maxCacheSize limit with LRU eviction
- ESLint configuration enhanced with TypeScript rules
- Added Prettier for code formatting

### Fixed

- Fixed TypeScript build errors in multiple components
- Fixed Axios DoS vulnerability by upgrading to ^1.13.5
- Fixed test mocking issues for next/navigation hooks
- Fixed Select component testid placement (Radix UI)
- Fixed connection flow in E2E tests
- Fixed page object selectors to use testid convention

### Security

- API Key no longer persisted in localStorage (uses sessionStorage)
- Upgraded axios from ^1.13.2 to ^1.13.5 to fix CVE

### Dependencies

- Added @radix-ui/react-switch
- Upgraded axios to ^1.13.5
- Added @typescript-eslint/parser and @typescript-eslint/eslint-plugin
- Added prettier

## [1.0.0] - 2025-02-01

### Added

- Initial release of Routilux Overseer
- Connection management UI for routilux servers
- Flow visualization with ReactFlow
- Job monitoring and management
- Worker pool management
- Real-time WebSocket updates
- Breakpoint debugging support
- Plugin system foundation
- Runtime management
- Discovery and sync features
- Auto-generated TypeScript API client from OpenAPI spec
