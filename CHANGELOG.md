# Changelog

All notable changes to Routilux Overseer will be documented in this file.

## [2.1.0] - 2025-02-07 (I01 Improvements)

### Added

#### Service Layer & Architecture
- **QueryService**: Caching and deduplication layer for API calls
  - Configurable TTL-based cache with automatic expiration
  - Request deduplication to prevent redundant concurrent calls
  - Domain-specific API wrappers (flows, jobs, workers, runtimes, breakpoints, discovery)
- **APIClientManager**: Singleton API client with centralized configuration
  - Automatic API key injection from localStorage
  - Connection state management
  - Simplified API client initialization

#### Error Handling
- **ErrorHandler**: Centralized error handling with toast notifications
  - `handleError()` function with context-aware error messages
  - `withErrorHandling()` wrapper for async functions
  - Error type hierarchy (AppError, NetworkError, APIError, ValidationError)
- **Toast UI Components**: Toast notification system using sonner
  - Custom toast state management with reducer
  - Manual rendering support for precise control
  - Integration with ErrorHandler

#### WebSocket Enhancements
- **Enhanced WebSocketManager**: Heartbeat and exponential backoff
  - Configurable heartbeat with stale connection detection
  - Connection timeout support
  - Max reconnection delay cap for exponential backoff
  - Automatic job resubscription on reconnection
- **WebSocket State Store**: Zustand store for WebSocket connection state
  - Track connected status, reconnect attempts, last error
- **Network Detection**: Browser online/offline event listeners
  - Automatic WebSocket disconnect detection on offline
  - State synchronization with WebSocket store

#### Plugin System UI
- **Plugins Management Page**: Full plugin management interface
  - List all installed plugins (built-in and user)
  - Enable/disable plugins with toggle switches
  - Search and filter plugins by status
  - Plugin cards with metadata (version, author, homepage)
- **Navigation**: Added Plugins link to main navigation
- **Switch UI Component**: shadcn/ui Switch component using Radix UI primitives

#### Testing
- **Unit Tests**: Comprehensive test coverage (132+ tests)
  - Service layer tests (QueryService, APIClient)
  - Store tests (flowStore, jobStore, workersStore, runtimeStore, breakpointStore, websocketStore)
  - WebSocketManager tests with mock WebSocket
  - Error handler tests

### Changed
- **Store Architecture**: All data stores now use QueryService for API calls
  - `flowStore`, `jobStore`, `workersStore`, `runtimeStore`, `breakpointStore` migrated
  - Removed direct `createAPI` calls from stores
  - Added `handleError` for consistent error handling
- **API Calls**: Unified through QueryService with caching
  - Reduces redundant API calls
  - Improved performance with caching
  - Better error handling across the application

### Technical
- **New Files**:
  - `lib/services/api-client.ts`, `lib/services/query-service.ts`
  - `lib/errors/types.ts`, `lib/errors/error-handler.ts`
  - `lib/stores/websocket-store.ts`
  - `components/ui/switch.tsx`, `components/ui/toast.tsx`
  - `components/plugins/`, `app/plugins/`
  - `test/unit/services/`, `test/unit/errors/`, `test/unit/websocket/`
- **Dependencies**: Added `@radix-ui/react-switch`, `sonner`

## [2.0.0] - 2025-01-15

### Added

#### Core Infrastructure
- **API Client Regeneration**: Automated script to fetch OpenAPI schema and regenerate TypeScript client
- **Enhanced API Wrapper**: Complete wrapper with all backend endpoints including Discovery, Monitor, Flow Management
- **Global Search**: Command palette-style search (Cmd/Ctrl+K) with real-time search, recent searches, keyboard navigation
- **Keyboard Shortcuts**: Comprehensive keyboard shortcut system with help modal
- **Error Handling**: Enhanced error display component with categorized errors, retry buttons, and actionable messages

#### Discovery Integration
- **Discovery Store**: New Zustand store for managing flow and job discovery
- **Sync from Registry**: Sync buttons on Flows and Jobs pages to import items from global registry
- **Discovery Badges**: Visual indicators showing count of available items in registry
- **Auto-sync Preference**: User preference for automatic syncing (stored in localStorage)

#### Flow Management
- **Search Bar**: Real-time search for flows by ID or description
- **Bulk Selection**: Checkbox selection for multiple flows
- **Bulk Actions**: Bulk delete operations with confirmation
- **Enhanced Empty States**: Improved empty states with illustrations and clear CTAs

#### Job Management
- **Enhanced Filters**: Quick filter buttons, active filters bar, filter summary
- **Date Range Filter**: Date range picker with presets (Today, This Week, Last 7/30 Days)
- **Bulk Selection**: Checkbox selection for multiple jobs
- **Bulk Actions**: Bulk cancel operations
- **Filter Summary**: "Showing X of Y jobs" indicator

#### UI/UX Enhancements
- **Status Badges**: Enhanced status indicators with icons, colors, animations, and accessibility
- **Empty States**: Reusable EmptyState component with icons, descriptions, and actions
- **Loading States**: Skeleton screens (SkeletonCard, SkeletonList) matching content structure
- **Dashboard Enhancements**: Clickable stat cards, improved empty states, quick actions

#### Data Visualization
- **Chart Components**: LineChart, BarChart, PieChart, Sparkline components using recharts
- **Chart Library**: Installed and configured recharts for data visualization

### Changed

- **Navigation**: Removed Discovery from main navigation, added global search button
- **API Methods**: Updated all API calls to use new generated client methods
- **Status Display**: Replaced basic badges with enhanced StatusBadge component throughout app
- **Error Messages**: Improved error categorization and user-friendly messages

### Technical

- **TypeScript Client**: Regenerated from latest OpenAPI schema (v0.10.0)
- **API Endpoints**: Added support for all 46+ backend API endpoints
- **Component Structure**: Improved component organization and reusability
- **State Management**: Added discoveryStore and searchStore for new features

### Scripts

- `scripts/setup-server.sh`: Script to start Routilux API server and fetch OpenAPI schema
- `scripts/regenerate-client.sh`: Script to regenerate TypeScript API client

### Dependencies

- Added `recharts` for data visualization

## [1.0.0] - Previous Version

Initial release with basic flow visualization, job monitoring, and debugging capabilities.

## [2.0.0] - 2025-01-15

### Added

#### Core Infrastructure
- **API Client Regeneration**: Automated script to fetch OpenAPI schema and regenerate TypeScript client
- **Enhanced API Wrapper**: Complete wrapper with all backend endpoints including Discovery, Monitor, Flow Management
- **Global Search**: Command palette-style search (Cmd/Ctrl+K) with real-time search, recent searches, keyboard navigation
- **Keyboard Shortcuts**: Comprehensive keyboard shortcut system with help modal
- **Error Handling**: Enhanced error display component with categorized errors, retry buttons, and actionable messages

#### Discovery Integration
- **Discovery Store**: New Zustand store for managing flow and job discovery
- **Sync from Registry**: Sync buttons on Flows and Jobs pages to import items from global registry
- **Discovery Badges**: Visual indicators showing count of available items in registry
- **Auto-sync Preference**: User preference for automatic syncing (stored in localStorage)

#### Flow Management
- **Search Bar**: Real-time search for flows by ID or description
- **Bulk Selection**: Checkbox selection for multiple flows
- **Bulk Actions**: Bulk delete operations with confirmation
- **Enhanced Empty States**: Improved empty states with illustrations and clear CTAs

#### Job Management
- **Enhanced Filters**: Quick filter buttons, active filters bar, filter summary
- **Date Range Filter**: Date range picker with presets (Today, This Week, Last 7/30 Days)
- **Bulk Selection**: Checkbox selection for multiple jobs
- **Bulk Actions**: Bulk cancel operations
- **Filter Summary**: "Showing X of Y jobs" indicator

#### UI/UX Enhancements
- **Status Badges**: Enhanced status indicators with icons, colors, animations, and accessibility
- **Empty States**: Reusable EmptyState component with icons, descriptions, and actions
- **Loading States**: Skeleton screens (SkeletonCard, SkeletonList) matching content structure
- **Dashboard Enhancements**: Clickable stat cards, improved empty states, quick actions

#### Data Visualization
- **Chart Components**: LineChart, BarChart, PieChart, Sparkline components using recharts
- **Chart Library**: Installed and configured recharts for data visualization

### Changed

- **Navigation**: Removed Discovery from main navigation, added global search button
- **API Methods**: Updated all API calls to use new generated client methods
- **Status Display**: Replaced basic badges with enhanced StatusBadge component throughout app
- **Error Messages**: Improved error categorization and user-friendly messages

### Technical

- **TypeScript Client**: Regenerated from latest OpenAPI schema (v0.10.0)
- **API Endpoints**: Added support for all 46+ backend API endpoints
- **Component Structure**: Improved component organization and reusability
- **State Management**: Added discoveryStore and searchStore for new features

### Scripts

- `scripts/setup-server.sh`: Script to start Routilux API server and fetch OpenAPI schema
- `scripts/regenerate-client.sh`: Script to regenerate TypeScript API client

### Dependencies

- Added `recharts` for data visualization

## [1.0.0] - Previous Version

Initial release with basic flow visualization, job monitoring, and debugging capabilities.
