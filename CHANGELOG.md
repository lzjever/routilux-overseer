# Changelog

All notable changes to Routilux Overseer will be documented in this file.

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
