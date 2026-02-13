# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
