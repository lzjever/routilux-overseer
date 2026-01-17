# Routilux Overseer - UI/UX Design Specification

**Version**: 2.1  
**Date**: 2025-01-15  
**Status**: Design Specification - Updated with Review Recommendations  
**Last Updated**: 2025-01-15 (Incorporated design review improvements)

---

## 📋 Document Purpose

This document provides **comprehensive, detailed specifications** for UI designers and developers to implement the updated Routilux Overseer interface. Every interaction, component, state, and visual element is specified to ensure consistent implementation without ambiguity.

**Target Audience**: UI/UX Designers, Frontend Developers, Product Managers

---

## 🎯 Design Principles

### Core Principles
1. **Clarity First**: Every element must have a clear purpose and be immediately understandable
2. **Progressive Disclosure**: Show essential information first, details on demand
3. **Consistent Patterns**: Reuse established patterns across all pages
4. **Real-time Feedback**: Always show loading states, errors, and success feedback
5. **Accessibility**: WCAG 2.1 AA compliance minimum
6. **Responsive Design**: Mobile-first, scales to desktop

### Visual Design Language
- **Color Scheme**: Maintain existing blue/indigo gradient theme
- **Typography**: System fonts (Inter/SF Pro) for readability
- **Spacing**: 4px base unit (Tailwind spacing scale)
- **Icons**: Lucide React icons (consistent with current implementation)
- **Components**: shadcn/ui components (existing library)

---

## 📱 Page Structure & Navigation

### Global Navigation (Navbar)

**Location**: Top of every page, fixed position  
**Height**: 64px (h-16)  
**Background**: `bg-background` with `border-b`

#### Left Section
```
[Routilux Overseer Logo/Text] [Flows] [Jobs] [Settings]
```

**Specifications**:
- Logo: Text "Routilux Overseer", font-bold, text-xl
- Navigation links: Text-sm, font-medium, hover:underline
- Active link: Underline + primary color
- Spacing: gap-6 between logo and links, gap-4 between links
- **Note**: Discovery removed from main nav (integrated into Flows/Jobs pages)

#### Right Section
```
[Search Button/Icon] [Connection Status Badge] [Change Server Button]
```

**Global Search** (NEW):
- **Trigger**: Search icon button or keyboard shortcut (Cmd/Ctrl+K)
- **Component**: Command palette or search modal
- **Icon**: Search (h-4 w-4)
- **Keyboard Shortcut**: Cmd/Ctrl+K (displayed as tooltip)
- **Action**: Opens global search modal
- **Features**:
  - Search flows by ID, routine names
  - Search jobs by ID, flow ID, status
  - Search within job logs/events
  - Recent searches (if any)
  - Quick filters (Flows, Jobs, Logs)
  - Real-time results as user types

**Connection Status Badge**:
- **Connected**: Green wifi icon + "Connected" text + server host badge
- **Disconnected**: Gray wifi-off icon + "Not connected" text
- Badge shows: `{hostname}:{port}` (e.g., "localhost:20555")
- Badge variant: `outline`, text-xs

**Change Server Button**:
- Variant: `ghost`, size: `sm`
- Icon: Settings (h-4 w-4)
- Text: "Change Server" (hidden on mobile: `hidden sm:inline`)
- Action: Navigate to `/connect`

---

## 🏠 Page 1: Dashboard (Home Page)

**Route**: `/`  
**Purpose**: Overview of system status, quick actions, recent activity

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar (Global)                                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Hero Section - Centered]                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Routilux Overseer (Title)                          │ │
│  │ Subtitle text                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [Statistics Cards - 4 Column Grid]                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │Total │ │Total │ │Runng │ │Quick │                   │
│  │Flows │ │Jobs  │ │Jobs  │ │Action│                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│                                                           │
│  [Content Grid - 2 Column]                                │
│  ┌────────────────────┐ ┌────────────────────┐         │
│  │ Recent Jobs        │ │ Quick Links        │         │
│  │ (List)            │ │ (List)             │         │
│  └────────────────────┘ └────────────────────┘         │
│                                                           │
│  [Get Started Card - Centered]                           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Hero Section
- **Alignment**: Center
- **Title**: 
  - Text: "Routilux Overseer"
  - Size: text-5xl, font-bold
  - Style: Gradient text (`bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`)
- **Subtitle**:
  - Text: "Comprehensive observability, debugging, and control for Routilux workflows"
  - Size: text-xl, text-muted-foreground
  - Max width: max-w-2xl, centered
- **Spacing**: mb-12 below hero

#### Statistics Cards (4-column grid)
**Grid**: `grid gap-4 md:grid-cols-4 mb-8 max-w-5xl mx-auto`

Each card:
- **Component**: `Card` from shadcn/ui
- **Header**: `CardHeader` with `pb-3`
  - Title: `text-sm font-medium`
- **Content**: `CardContent`
  - Value: `text-3xl font-bold`
  - Description: `text-xs text-muted-foreground mt-1`
- **Special**: "Running Jobs" card has blue value color (`text-blue-600`)
- **Quick Actions Card**: Contains button linking to `/flows`
- **Enhancement (NEW)**: Cards are clickable
  - **Total Flows**: Click → Navigate to `/flows`
  - **Total Jobs**: Click → Navigate to `/jobs`
  - **Running Jobs**: Click → Navigate to `/jobs?status=running`
  - **Quick Actions**: Contains "Create Flow" button (primary action)
- **Trend Indicators (NEW)**: Optional up/down arrows with percentage change
- **Mini Charts (NEW)**: Optional sparkline charts showing trends over time

#### Recent Jobs Card
- **Component**: `Card`
- **Header**: 
  - Title: "Recent Jobs"
  - "View All" button (ghost, sm) linking to `/jobs`
- **Content**:
  - If empty: Centered message "No jobs yet. Start a job from the Flows page."
  - If has jobs: List of up to 5 most recent jobs
    - Each item: Clickable card with hover effect
    - Shows: Job ID (mono font), Status badge, Flow ID
    - Action: Navigate to `/jobs/{jobId}` on click

#### Quick Links Card
- **Component**: `Card`
- **Content**: List of 3-4 navigation links
  - Each link: Icon + Title + Description
  - Icons: Activity (blue), Zap (green), Settings (purple)
  - Hover: `hover:bg-accent/50`
  - Action: Navigate to respective page

#### Get Started Card
- **Component**: `Card` with gradient background
- **Background**: `bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20`
- **Content**: Centered text + CTA button
- **Button**: Links to `/flows`, size `lg`

### State Management

**Data Sources**:
- `useFlowStore`: `flows.size` for total flows count
- `useJobStore`: `jobs.size` for total jobs, filter running jobs
- Connection status from `useConnectionStore`

**Loading State**:
- Show skeleton loaders or spinner while loading
- Text: "Loading..." centered, `animate-pulse text-muted-foreground`

**Empty State**:
- **Enhanced Empty States (NEW)**:
  - Custom illustrations or large icons (w-16 h-16)
  - Title: text-lg, font-semibold
  - Description: text-sm, text-muted-foreground, max-w-md
  - Primary CTA button (prominent)
  - Optional: Helpful tips or links to documentation
  - Example for no flows: "Create your first flow" button + "Learn more" link

---

## 🔄 Page 2: Discovery & Sync (INTEGRATED)

**Route**: `/discovery` (Advanced users only)  
**Purpose**: Discover and sync flows/jobs created outside the API  
**Note**: Discovery functionality is primarily integrated into Flows/Jobs pages. This page is for advanced users who want to see all discovered items.

### Integration Strategy

**Primary Integration**: Discovery actions are available in Flows and Jobs list pages:
- **Flows Page**: "Sync from Registry" button in action bar
- **Jobs Page**: "Sync from Registry" button in action bar
- **Notification Badge**: Shows count when items available in registry but not in API
- **Auto-sync**: Optional automatic sync on connection (user preference)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│ [Back Button] Discovery                                 │
│                                                           │
│ [Sync Controls Card]                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Sync Flows Button    │ Sync Jobs Button             │ │
│ │ Auto-sync Toggle     │ Last Sync Timestamp          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Tabs: Flows | Jobs]                                      │
│                                                           │
│ [Discovered Items List]                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Item 1                                              │ │
│ │ Item 2                                              │ │
│ │ ...                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Header
- **Back Button**: Ghost variant, links to `/`
- **Title**: "Discovery" (text-3xl, font-bold)
- **Description**: "Discover and sync flows/jobs from the global registry"

#### Sync Controls Card
- **Component**: `Card`
- **Layout**: 2-column grid on desktop, stacked on mobile
- **Left Column**:
  - "Sync Flows" button (primary)
  - Icon: RefreshCw
  - Loading state: Spinner when syncing
  - Success feedback: Toast notification
- **Right Column**:
  - "Sync Jobs" button (primary)
  - Same behavior as Sync Flows
- **Bottom Row** (full width):
  - Auto-sync toggle switch
  - Label: "Auto-sync on connection"
  - Last sync timestamp (if available)
  - Format: "Last synced: {time} ago" or "Never synced"

#### Tabs
- **Component**: `Tabs` from shadcn/ui
- **Tabs**: "Flows" | "Jobs"
- **Content**: Different lists based on active tab

#### Discovered Items List

**Flows Tab**:
- List of discovered flows (from `/api/discovery/flows`)
- Each item:
  - Flow ID (mono font)
  - Routine count
  - Connection count
  - "Add to API" button (if not in API store)
  - Status badge: "In API" or "Not in API"

**Jobs Tab**:
- List of discovered jobs (from `/api/discovery/jobs`)
- Each item:
  - Job ID (mono font)
  - Flow ID
  - Status badge
  - Created timestamp
  - "Add to API" button (if not in API store)

**Empty State**:
- Message: "No discovered items. Click 'Sync' to discover flows/jobs from the registry."

### Interactions

1. **Sync Flows**:
   - Click button → Show loading spinner
   - Call `POST /api/discovery/flows/sync`
   - On success: Show toast "X flows synced", refresh list
   - On error: Show error toast with message

2. **Sync Jobs**:
   - Same as Sync Flows but for jobs

3. **Auto-sync Toggle**:
   - When enabled: Automatically sync on page load and connection
   - Store preference in localStorage

4. **Add to API**:
   - For items not in API store
   - Button: "Add to API" (outline variant)
   - Action: Call sync endpoint for that specific item

### State Management

**New Store**: `useDiscoveryStore`
```typescript
interface DiscoveryState {
  discoveredFlows: FlowResponse[];
  discoveredJobs: JobResponse[];
  syncingFlows: boolean;
  syncingJobs: boolean;
  lastSyncFlows: number | null;
  lastSyncJobs: number | null;
  autoSync: boolean;
  
  discoverFlows: (serverUrl: string) => Promise<void>;
  syncFlows: (serverUrl: string) => Promise<void>;
  discoverJobs: (serverUrl: string) => Promise<void>;
  syncJobs: (serverUrl: string) => Promise<void>;
  setAutoSync: (enabled: boolean) => void;
}
```

---

## 📊 Page 3: Flows List Page

**Route**: `/flows`  
**Purpose**: List all available flows, navigate to flow details

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│ Flows                                                    │
│ Manage and monitor your workflow definitions             │
│ Connected to: {serverUrl}                                │
│                                                           │
│ [Action Bar]                                             │
│ [Create Flow Button] [Sync Button] [Refresh Button]     │
│                                                           │
│ [Flow Cards Grid - 3 columns]                            │
│ ┌──────┐ ┌──────┐ ┌──────┐                             │
│ │Flow 1│ │Flow 2│ │Flow 3│                             │
│ └──────┘ └──────┘ └──────┘                             │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Header
- **Title**: "Flows" (text-3xl, font-bold)
- **Description**: "Manage and monitor your workflow definitions"
- **Server Info**: "Connected to: {serverUrl}" (text-sm, text-muted-foreground)

#### Action Bar
- **Create Flow Button**:
  - Variant: `default` (primary)
  - Icon: Plus (h-4 w-4)
  - Text: "Create Flow"
  - Action: Open create flow dialog
  - **Keyboard Shortcut**: Cmd/Ctrl+N (shown in tooltip)
- **Sync Button** (NEW - Integrated Discovery):
  - Variant: `outline`
  - Icon: RefreshCw
  - Text: "Sync from Registry"
  - **Badge**: Shows count when items available (e.g., "Sync (3)")
  - Action: Call discovery sync
  - **Tooltip**: "Sync flows from global registry"
- **Refresh Button**:
  - Variant: `ghost`
  - Icon: RefreshCw (spinning when loading)
  - Action: Reload flows list
  - **Keyboard Shortcut**: Cmd/Ctrl+R
- **Search Bar** (NEW):
  - **Location**: Below header, full width
  - **Component**: Input with search icon
  - **Placeholder**: "Search flows by ID or routine name..."
  - **Behavior**: Real-time filtering as user types
  - **Clear Button**: X icon appears when text entered
  - **Keyboard Shortcut**: Focus with Cmd/Ctrl+F (when on page)

#### Flow Cards Grid
- **Grid**: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- **Card Component**: `Card` with hover effects
- **Hover**: `hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50`
- **Click Action**: Navigate to `/flows/{flowId}`
- **Bulk Selection (NEW)**:
  - **Checkbox**: Top-left corner of each card (appears on hover or when bulk mode active)
  - **Bulk Mode Toggle**: "Select" button in action bar
  - **When items selected**:
    - Selection counter: "X flows selected"
    - Bulk actions menu appears:
      - Delete (destructive)
      - Export DSL
      - Validate
      - Clear selection
  - **Select All**: "Select all X flows" (respects current filters/search)

**Card Content**:
- **Header**:
  - Icon: Activity (h-5 w-5, text-primary)
  - Flow ID: `text-lg` font-bold
- **Description**:
  - "{routineCount} routines • {connectionCount} connections"
- **Content**:
  - Execution strategy badge
  - Max workers (mono font)
  - "View Flow" button (ghost, full width)

**Empty State**:
- Centered card with icon
- Message: "No flows found"
- Description: "There are no flows available on the server."
- Optional: "Create Flow" button

### Create Flow Dialog (ENHANCED - Step-by-Step)

**Trigger**: "Create Flow" button  
**Component**: `Dialog` from shadcn/ui  
**Enhancement**: Changed from tabs to step-by-step wizard for better UX

#### Dialog Structure (NEW)
```
┌─────────────────────────────────────┐
│ Create Flow                          │
│ ─────────────────────────────────── │
│                                      │
│ Step 1: Choose Creation Method       │
│ [○] Start from scratch               │
│ [○] Import from DSL/File            │
│ [○] Clone existing flow              │
│ [○] Use template                     │
│                                      │
│ [Cancel] [Next →]                   │
└─────────────────────────────────────┘
```

#### Step 1: Choose Creation Method
- **Radio Buttons** (vertical list):
  - **Start from scratch**: Simple form (ID, Strategy, Workers)
  - **Import from DSL/File**: File upload or paste DSL
  - **Clone existing flow**: Flow selector + new ID
  - **Use template**: Template gallery (NEW)
- **Template Gallery** (if selected):
  - Grid of template cards
  - Each shows: Name, Description, Preview
  - Common templates: Linear, Branching, Loop, Aggregating
- **Next Button**: Enabled when method selected

#### Step 2: Form Based on Selection

**If "Start from scratch"**:
- **Flow ID Input**:
  - Label: "Flow ID"
  - Required: Yes
  - Validation: Alphanumeric, dashes, underscores only
  - Placeholder: "my-flow"
- **Execution Strategy**:
  - Select dropdown
  - Options: "sequential", "parallel", "hybrid"
  - Default: "sequential"
- **Max Workers**:
  - Number input
  - Default: 5
  - Min: 1, Max: 100

**If "Import from DSL/File"**:
- **Format Selector**: Tabs for "Paste DSL" or "Upload File"
- **Paste DSL Tab**:
  - Format selector: YAML or JSON
  - Textarea: Rows 15, mono font
  - Validation: Real-time validation on paste/change
  - Error display: Inline below textarea
- **Upload File Tab**:
  - Drag & drop zone (large, visual)
  - Accept: `.yaml`, `.yml`, `.json`
  - File preview after selection
  - File name display

**If "Clone existing flow"**:
- **Flow Selector**: Searchable dropdown or list
- **New Flow ID**: Text input (required)
- **Preview**: Shows source flow structure (read-only)

**If "Use template"**:
- **Template Gallery**: Grid of template cards
- Each card shows: Name, Description, Preview image/icon
- Click template → Shows template details
- **Customize**: Option to modify template before creating

#### Step 3: Preview & Validation (NEW)
- **Preview Section**: Shows flow structure (if applicable)
- **Validation**: Automatic validation
  - Valid: Green checkmark + "Ready to create"
  - Invalid: Red X + issues list
- **Back Button**: Return to previous step
- **Create Button**: Enabled only when valid

**Validation Rules**:
- Flow ID must be unique (checked on blur)
- DSL must be valid YAML/JSON (real-time)
- Show validation errors inline with suggestions
- Error messages: Specific and actionable

**Submit**:
- Button: "Create Flow" (primary)
- Loading state: Disable button, show spinner
- On success: Close dialog, navigate to new flow page
- On error: Show specific error message with recovery suggestions

---

## 🔍 Page 4: Flow Detail Page

**Route**: `/flows/[flowId]`  
**Purpose**: View, edit, and manage a specific flow

### Layout Structure (REDESIGNED - Three-Panel Layout)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Compact Header (56px)                                                    │
│ [← Back] Flow ID [Status Badge] [Jobs Link]    [Actions▼] [▶ Start Job]│
├──────────┬──────────────────────────────────────────────────┬───────────┤
│          │                                                  │           │
│ Left     │           Flow Visualization                    │ Right     │
│ Sidebar  │           (Primary Focus - 60-70% width)        │ Sidebar   │
│ (240px)  │           Full height, no scrolling             │ (280px)   │
│          │                                                  │           │
│ - Flow   │           ReactFlow Canvas                      │ - Routines│
│   Info   │           - Minimap                            │   Tab     │
│   (compact)│         - Controls                            │ - Connections│
│ - Validation│        - Zoom controls                       │   Tab     │
│   Status  │          - Fit view                            │           │
│ - Stats  │                                                  │           │
│          │                                                  │           │
│ Collapsible│                                                │ Collapsible│
│ (can hide)│                                                │ (can hide)│
└──────────┴──────────────────────────────────────────────────┴───────────┘
```

### Component Specifications

#### Compact Header (56px height)
- **Back Button**: Icon only (ghost, 32px)
- **Flow ID**: Text-xl, font-bold, truncate if long
- **Status Badge**: 
  - Green "Valid" or Red "Invalid" (compact, 20px height)
  - Click to validate
- **Jobs Link**: 
  - Compact: "X jobs" (text-sm, link style)
  - Hover shows tooltip "View all jobs for this flow"
- **Actions Menu**: Icon button (MoreVertical)
  - Export DSL
  - Refresh
- **Start Job**: Primary button, compact size (h-8)

#### Left Sidebar (240px width, collapsible)
**Purpose**: Flow metadata and validation - always accessible but not intrusive

**Layout** (vertical stack, compact):
- **Flow Information**:
  - Flow ID (truncated)
  - Execution strategy (badge)
  - Max workers
- **Validation Status**:
  - Status indicator (Valid/Invalid)
  - Refresh button (icon)
  - Error list (if invalid)
- **Quick Stats**:
  - Routines count
  - Connections count
  - Cross-connections count
- **Collapse Button**: ChevronLeft icon, collapses to 48px (icon-only mode)

**Collapsed State**:
- Shows only icons: Info, Validation, Stats
- Hover shows tooltip with details
- Click to expand

#### Center Panel: Flow Visualization (Primary Focus)
**Purpose**: Primary focus - flow graph visualization

**Layout**:
- **Full height**: Uses all available vertical space (calc(100vh - 120px))
- **No scrolling**: Canvas fits within viewport
- **Floating controls**: Zoom, fit view, etc. overlay on canvas (top-right)
- **Minimap**: Bottom-right corner, floating
- **Auto-fit on load**: Automatically fits view to show all nodes
- **Responsive**: Adjusts when sidebars collapse/expand

**Controls** (floating, top-right):
- Zoom In
- Zoom Out  
- Fit View
- Fullscreen (optional)

#### Right Sidebar (280px width, collapsible)
**Purpose**: Routines and Connections - detailed lists

**Layout** (tabs):
- **Tabbed interface**: Routines | Connections
- **Compact list items**: Minimal padding, clear hierarchy
- **Quick actions**: Inline edit/remove buttons (on hover)
- **Collapsible**: Can collapse to 48px (icon-only)
- **Scrollable**: If content overflows

**Routines Tab**:
- List of routines with:
  - Routine ID (bold)
  - Class name (muted)
  - Slot/Event counts (badges)
- Click routine → Highlight in canvas
- Hover → Show tooltip with full details
- Add Routine button (compact)

**Connections Tab**:
- List of connections:
  - Source → Target (compact format)
  - Visual indicator (arrow icon)
- Click connection → Highlight in canvas
- Inline remove button
- Add Connection button (compact)

**Note**: Param Mapping removed - this feature has been deprecated from the API.

### Interaction Patterns

#### Canvas ↔ Sidebar Sync
- **Click routine in sidebar** → Highlight node in canvas, center view
- **Click connection in sidebar** → Highlight edge in canvas
- **Click node in canvas** → Scroll to routine in sidebar, show details
- **Click edge in canvas** → Scroll to connection in sidebar

#### Panel Collapse/Expand
- **Collapse button**: Icon in panel header
- **Keyboard shortcut**: `Cmd/Ctrl + B` (left), `Cmd/Ctrl + ]` (right)
- **Smooth animation**: 200ms transition
- **State persistence**: Remember user preference (localStorage)

### Key Design Improvements

1. **Space Efficiency**
   - ✅ Horizontal layout: Uses 100% of screen width
   - ✅ No wasted space: Sidebars only take what they need
   - ✅ Collapsible panels: Users can maximize canvas space
   - ✅ Compact headers: Reduced from ~120px to 56px

2. **Flow Visualization Priority**
   - ✅ Immediate visibility: Canvas visible on page load, no scrolling
   - ✅ Maximum space: 60-70% of screen width, full height
   - ✅ No constraints: Canvas not limited by card padding
   - ✅ Better aspect ratio: Wide canvas better for flow graphs

3. **Information Architecture**
   - ✅ Clear hierarchy: Visualization > Metadata > Details
   - ✅ Progressive disclosure: Essential info in header, details in sidebars
   - ✅ Context preservation: Canvas always visible while browsing details
   - ✅ Reduced redundancy: Flow ID shown once in header

### API Changes

**Removed**:
- ❌ `param_mapping` parameter from `addConnection` - Feature deprecated
- ❌ Flow-level metrics - Not meaningful at flow level

**Updated Method Names**:
- `exportFlowDSL` → `exportDSL`
- `validateFlow` → `validate`
- `getFlowRoutines` → `getRoutines`
- `getFlowConnections` → `getConnections`
- `getFlowMetrics` → `monitor.getFlowMetrics`

#### Export Tab

**Current**: DSL export functionality  
**Enhancement**: Add import capability

**Export Section** (existing):
- Format selector (YAML/JSON)
- Export button
- Download button
- Preview area

**Import Section** (NEW):
- **File Upload**:
  - Accept: `.yaml`, `.yml`, `.json`
  - Drag & drop zone
- **Or Paste DSL**:
  - Textarea for DSL input
- **Import Button**:
  - Variant: `default`
  - Action: Validate DSL, then update flow
  - Warning: "This will replace the current flow structure"

**Note**: Metrics Tab removed - Flow-level metrics are not meaningful. Job metrics are available on individual job pages. Flow Information card now shows job count with link to filtered jobs list.

---

## 📋 Page 5: Jobs List Page

**Route**: `/jobs`  
**Purpose**: List, filter, and manage jobs

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│ [Back] Jobs                          [Cleanup] [Refresh]   │
│ {count} jobs • Live Status                                │
│                                                           │
│ [Filters Card]                                           │
│ Flow: [Select] Status: [Select] Date: [Range]            │
│                                                           │
│ [Jobs List]                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Job Card 1                                          │ │
│ │ Job Card 2                                          │ │
│ │ ...                                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Pagination] (if needed)                                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Header
- **Back Button**: Links to `/flows`
- **Title**: "Jobs" (text-3xl, font-bold)
- **Subtitle**: 
  - Job count: "{count} job(s)"
  - Live status indicator (Wifi icon + "Live" or "Offline")
- **Actions**:
  - Cleanup button (outline)
  - Refresh button (ghost, with spinner)

#### Filters Card (ENHANCED)

**Current**: Flow and Status filters  
**Enhancement**: Add date range filter, active filters display, quick filters

**Filter Layout**: 3-column grid (responsive)

1. **Flow Filter**:
   - Select dropdown
   - Options: "All Flows" + list of flows
   - Default: "All Flows"

2. **Status Filter**:
   - Select dropdown
   - Options: All, Running, Completed, Failed, Paused, Cancelled
   - Default: "All Statuses"

3. **Date Range Filter** (NEW):
   - Date picker component
   - Options:
     - "All Time" (default)
     - "Last 24 hours"
     - "Last 7 days"
     - "Last 30 days"
     - "Custom range" (opens date picker)
   - Implementation: Use date-fns for date handling

**Quick Filters (NEW)**:
- Preset filter buttons above filter card:
  - [Today] [This Week] [Failed] [Running] [Completed]
- Clicking applies filter immediately
- Active quick filter highlighted

**Active Filters Bar (NEW)**:
- **Location**: Between filters card and jobs list
- **Display**: Removable chips showing active filters
  ```
  Active Filters: [Flow: test-flow ×] [Status: completed ×] [Date: Last 7 days ×] [Clear All]
  ```
- **Behavior**:
  - Each chip shows filter name and value
  - X button removes individual filter
  - "Clear All" button resets all filters
  - Only shows when filters are active

**Filter Summary (NEW)**:
- **Location**: Above jobs list
- **Display**: "Showing X of Y jobs" with filter breakdown
- **Example**: "Showing 15 of 150 jobs (filtered by: Flow=test-flow, Status=completed, Date=Last 7 days)"

**Filter Behavior**:
- Apply filters on change (debounced 300ms)
- Show active filter count badge on filter card
- "Clear Filters" button to reset all
- **Saved Filters (Future)**: Allow users to save common filter combinations

#### Jobs List

**Bulk Selection (NEW)**:
- **Checkbox**: Left side of each job card (appears on hover or when bulk mode active)
- **Bulk Mode Toggle**: "Select" button in header
- **When items selected**:
  - Selection counter: "X jobs selected"
  - Bulk actions menu appears:
    - Cancel (if running/paused)
    - Cleanup
    - Export logs
    - Clear selection
  - **Select All**: "Select all X jobs" (respects current filters)

**Job Card**:
- **Component**: `Card` with hover effect
- **Click Action**: Navigate to `/jobs/{jobId}` (when not in bulk mode)
- **Content**:
  - **Header**:
    - Checkbox (if bulk mode active)
    - Job ID (mono font, text-lg)
    - Flow ID (muted text)
    - Status badge (enhanced - see Status Badge section)
  - **Body**:
    - Timestamps: Created, Started, Completed (relative time)
    - Error message (if failed) - clickable to expand
  - **Hover**: Border highlight, shadow
  - **Actions Menu** (NEW): Three-dot menu on hover
    - View Details
    - Cancel (if running)
    - Export Logs
    - Copy Job ID

**Empty State** (ENHANCED):
- **Illustration**: Large icon (w-16 h-16) or custom illustration
- **Title**: "No jobs yet" (text-lg, font-semibold)
- **Description**: "Get started by creating a job from one of your flows." (text-sm, text-muted-foreground)
- **Primary CTA**: "Start a Job" button (primary) linking to `/flows`
- **Secondary CTA**: "View Flows" link
- **Helpful Tip**: "Tip: You can start jobs from the Flows page"

#### Cleanup Dialog (ENHANCED)

**Current**: Basic cleanup  
**Enhancement**: More options

**Dialog Structure**:
```
┌─────────────────────────────────────┐
│ Cleanup Old Jobs                     │
│ ─────────────────────────────────── │
│                                      │
│ Maximum Age: [Number Input] hours    │
│ (1-720, default: 24)                 │
│                                      │
│ Status Filter: [Multi-select]        │
│ ☑ Completed                          │
│ ☐ Failed                              │
│ ☐ Cancelled                           │
│                                      │
│ Preview: X jobs will be deleted      │
│                                      │
│ [Cancel] [Cleanup Jobs]              │
└─────────────────────────────────────┘
```

**Enhancements**:
- Multi-select for statuses (checkboxes)
- Preview count before deletion
- Confirmation step: "Are you sure? This cannot be undone."
- Success feedback: Toast with count of deleted jobs

#### Pagination (NEW)

**When to Show**: If total jobs > limit (default: 100)

**Component**: Custom pagination component
- Previous/Next buttons
- Page numbers
- Items per page selector
- Total count display

**Implementation**:
- Use `limit` and `offset` query parameters
- Store pagination state in URL query params

---

## 🔬 Page 6: Job Detail Page

**Route**: `/jobs/[jobId]`  
**Purpose**: Monitor, debug, and control a specific job execution

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│ [Back] Job ID                    [Pause/Resume] [Cancel] │
│ Flow: {flowId} • {status} • Live Monitoring             │
│                                                           │
│ [Main Content Area - Left]    ] [Debug Sidebar - Right] │
│                                                           │
│ [Tabs: Main | History]                                    │
│                                                           │
│ [Flow Canvas]                                            │
│ [Job State Summary]                                      │
│ [Routine States Panel]                                   │
│ [Shared Data Viewer]                                     │
│ [Metrics Panel]                                          │
│ [Event Log]                                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Header
- **Back Button**: Links to `/jobs`
- **Title**: Job ID (mono font, text-3xl)
- **Subtitle**: 
  - Flow ID
  - Status badge
  - Live monitoring indicator
- **Actions**:
  - Refresh button (ghost)
  - Debug panel toggle (default/outline based on state)
  - Pause button (if running)
  - Resume button (if paused)
  - Cancel button (if running/paused, destructive)

#### Main Content Area

**Layout**: Flex column, with right padding when debug sidebar is open

**Tabs**:
- "Main" tab: Current content
- "History" tab: Execution history timeline

#### Main Tab Content

**Flow Canvas**:
- Full width card
- Min height: 500px
- Shows flow visualization with execution state
- Read-only mode

**Job State Summary**:
- Current routine
- Job status
- Pause history
- Deferred events
- Timestamps

**Routine States Panel** (ENHANCED):
- **Current**: Shows routine execution states
- **Enhancement**: Add routine info display
  - Click routine → Show routine info card
  - Info includes: Policy, Config, Slots, Events
  - Data source: `GET /api/flows/{flowId}/routines/{routineId}/info`

**Shared Data Viewer**:
- Collapsible sections
- JSON formatted display

**Metrics Panel**:
- Execution metrics
- Performance indicators

**Event Log**:
- Real-time event stream
- Filterable, searchable

#### History Tab Content

**Execution History Timeline**:
- Chronological list of execution records
- Expandable items
- Filter by routine

#### Debug Sidebar (ENHANCED)

**Current**: Breakpoints, variables, step controls, expression evaluator  
**Enhancement**: Better organization, more features

**Sidebar Structure**:
```
┌─────────────────────────┐
│ Debug Panel        [×]  │
├─────────────────────────┤
│ [Tabs: Breakpoints |    │
│  Variables | Step |     │
│  Expression]            │
│                         │
│ [Tab Content]           │
│                         │
└─────────────────────────┘
```

**Breakpoints Tab**:
- List of breakpoints
- Add breakpoint button
- Each breakpoint: Type, location, condition, enabled toggle
- Actions: Edit, Delete

**Variables Tab**:
- Routine selector
- Variable tree view
- Expandable JSON objects
- Set variable button (if paused)

**Step Tab**:
- Step Over button
- Step Into button
- Resume button
- Call stack viewer

**Expression Tab**:
- Current expression evaluator component
- No changes needed (already implemented)

**New Feature: Queue Status** (NEW):
- Add "Queues" tab to debug sidebar
- Show queue status for all routines
- Data source: `GET /api/jobs/{jobId}/queues/status`
- Display: Table or cards showing:
  - Routine ID
  - Slot name
  - Queue length
  - Queue pressure level (color-coded)

---

## 🎨 Component Specifications

### Common Components

#### Status Badge (ENHANCED)
**Enhanced Design**: Icon + Color + Text for better clarity and accessibility

**Variants**:
- **`running`**: 
  - Icon: RefreshCw (spinning animation)
  - Color: Blue/primary
  - Text: "Running"
  - Background: Blue-50, border: Blue-200
- **`completed`**: 
  - Icon: CheckCircle
  - Color: Green
  - Text: "Completed"
  - Background: Green-50, border: Green-200
- **`failed`**: 
  - Icon: XCircle
  - Color: Red/destructive
  - Text: "Failed"
  - Background: Red-50, border: Red-200
  - **Clickable**: Click to expand error message
- **`paused`**: 
  - Icon: Pause
  - Color: Yellow/warning
  - Text: "Paused"
  - Background: Yellow-50, border: Yellow-200
- **`cancelled`**: 
  - Icon: StopCircle
  - Color: Gray
  - Text: "Cancelled"
  - Background: Gray-50, border: Gray-200
- **`pending`**: 
  - Icon: Clock
  - Color: Gray
  - Text: "Pending"
  - Background: Gray-50, border: Gray-200

**Implementation**: Use `Badge` component from shadcn/ui with icon support
**Accessibility**: Ensure color contrast meets WCAG AA standards (4.5:1)
**Progress Indicator** (for long-running jobs): Optional progress bar below status

#### Loading States
**Spinner**:
- Component: `Loader2` from lucide-react
- Size: h-4 w-4 (small), h-8 w-8 (large)
- Animation: `animate-spin`
- Color: `text-muted-foreground`

**Skeleton**:
- Use `Skeleton` component from shadcn/ui
- Match content shape
- `animate-pulse`

#### Toast Notifications
**Component**: Use toast library (sonner or react-hot-toast)

**Types**:
- Success: Green, checkmark icon
- Error: Red, X icon
- Info: Blue, info icon
- Warning: Yellow, warning icon

**Duration**: 3 seconds (default), 5 seconds for errors

#### Empty States
**Structure**:
- Icon (large, muted color)
- Title (text-lg, font-semibold)
- Description (text-sm, text-muted-foreground)
- Optional CTA button

**Spacing**: py-16 for centered empty states

### New Components Needed

#### 1. DiscoverySyncControls
**Location**: `/app/discovery/page.tsx`  
**Purpose**: Sync flows/jobs from registry

**Props**:
```typescript
interface DiscoverySyncControlsProps {
  onSyncFlows: () => Promise<void>;
  onSyncJobs: () => Promise<void>;
  syncingFlows: boolean;
  syncingJobs: boolean;
  lastSyncFlows: number | null;
  lastSyncJobs: number | null;
  autoSync: boolean;
  onAutoSyncChange: (enabled: boolean) => void;
}
```

**Layout**: Card with 2-column grid

#### 2. FlowValidationCard
**Location**: `/app/flows/[flowId]/page.tsx`  
**Purpose**: Show flow validation status

**Props**:
```typescript
interface FlowValidationCardProps {
  flowId: string;
  serverUrl: string;
}
```

**Features**:
- Validate button
- Status indicator
- Issues list

#### 3. FlowMetricsCard
**Location**: `/app/flows/[flowId]/page.tsx`  
**Purpose**: Display flow-level metrics

**Props**:
```typescript
interface FlowMetricsCardProps {
  flowId: string;
  serverUrl: string;
}
```

**Features**:
- Summary cards
- Job metrics table
- Optional charts

#### 4. AddRoutineDialog
**Location**: `/app/flows/[flowId]/page.tsx`  
**Purpose**: Add routine to flow

**Props**:
```typescript
interface AddRoutineDialogProps {
  flowId: string;
  serverUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

**Form Fields**:
- Routine ID (text input)
- Class Path (text input with validation)
- Config (JSON editor, optional)

#### 5. AddConnectionDialog
**Location**: `/app/flows/[flowId]/page.tsx`  
**Purpose**: Add connection to flow

**Props**:
```typescript
interface AddConnectionDialogProps {
  flowId: string;
  serverUrl: string;
  routines: RoutineInfo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

**Form Fields**:
- Source Routine (select)
- Source Event (select, depends on source routine)
- Target Routine (select)
- Target Slot (select, depends on target routine)
- Param Mapping (JSON editor, optional)

#### 6. QueueStatusPanel
**Location**: `/app/jobs/[jobId]/page.tsx` (in debug sidebar)  
**Purpose**: Show queue status for all routines

**Props**:
```typescript
interface QueueStatusPanelProps {
  jobId: string;
  serverUrl: string;
}
```

**Display**:
- Table or cards
- Color-coded pressure levels
- Real-time updates via WebSocket

#### 7. DateRangeFilter
**Location**: `/app/jobs/page.tsx`  
**Purpose**: Filter jobs by date range

**Props**:
```typescript
interface DateRangeFilterProps {
  value: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
}
```

**Features**:
- Preset options (Last 24h, 7d, 30d)
- Custom range picker
- Clear button

---

## 🔄 User Stories

### Epic 1: Discovery & Sync

#### Story 1.1: Discover Flows from Registry
**As a** developer  
**I want to** discover flows created outside the API  
**So that** I can view and manage them in Overseer

**Acceptance Criteria**:
- [ ] User can navigate to Discovery page
- [ ] User sees list of discovered flows
- [ ] Each flow shows: ID, routine count, connection count, "In API" status
- [ ] User can click "Add to API" for flows not in API store
- [ ] Success feedback shown after adding

#### Story 1.2: Sync Flows from Registry
**As a** developer  
**I want to** sync all flows from the global registry  
**So that** all flows are available in the API

**Acceptance Criteria**:
- [ ] "Sync Flows" button visible on Discovery page
- [ ] Clicking button shows loading state
- [ ] On success: Toast notification with count, list refreshes
- [ ] On error: Error toast with message
- [ ] Last sync timestamp updated

#### Story 1.3: Auto-sync on Connection
**As a** developer  
**I want to** automatically sync flows/jobs when connecting  
**So that** I don't have to manually sync

**Acceptance Criteria**:
- [ ] Auto-sync toggle available
- [ ] When enabled: Auto-sync on page load and connection
- [ ] Preference saved in localStorage
- [ ] User can disable auto-sync

### Epic 2: Flow Management

#### Story 2.1: Create Empty Flow
**As a** developer  
**I want to** create a new empty flow  
**So that** I can build flows from scratch in Overseer

**Acceptance Criteria**:
- [ ] "Create Flow" button on Flows list page
- [ ] Dialog opens with "Empty Flow" tab
- [ ] Form fields: Flow ID, Execution Strategy, Max Workers
- [ ] Validation: Flow ID must be unique, alphanumeric
- [ ] On submit: Flow created, navigate to flow detail page
- [ ] Error handling for duplicate IDs

#### Story 2.2: Create Flow from DSL
**As a** developer  
**I want to** create a flow from YAML/JSON DSL  
**So that** I can import existing flow definitions

**Acceptance Criteria**:
- [ ] "Create Flow" dialog has "From DSL" tab
- [ ] Format selector: YAML or JSON
- [ ] Textarea for DSL input
- [ ] Validation on paste/change
- [ ] Error messages for invalid DSL
- [ ] On submit: Flow created from DSL

#### Story 2.3: Validate Flow
**As a** developer  
**I want to** validate a flow's structure  
**So that** I can catch issues before execution

**Acceptance Criteria**:
- [ ] "Validate Flow" button in flow detail page actions
- [ ] Clicking shows loading state
- [ ] Valid flows: Green checkmark + "Valid" message
- [ ] Invalid flows: Red X + issue count + issues list
- [ ] Each issue shows: Type and message

#### Story 2.4: Export Flow DSL
**As a** developer  
**I want to** export a flow as DSL  
**So that** I can version control or share flows

**Acceptance Criteria**:
- [ ] Export tab in flow detail page
- [ ] Format selector: YAML or JSON
- [ ] "Export" button fetches DSL
- [ ] DSL displayed in preview area
- [ ] "Download" button saves file
- [ ] Filename: `{flowId}_flow.{format}`

#### Story 2.5: Import Flow DSL
**As a** developer  
**I want to** import DSL to update a flow  
**So that** I can modify flows from external definitions

**Acceptance Criteria**:
- [ ] Import section in Export tab
- [ ] File upload (drag & drop) or paste DSL
- [ ] Validation before import
- [ ] Warning: "This will replace current flow structure"
- [ ] Confirmation dialog
- [ ] On confirm: Flow updated, page refreshes

#### Story 2.6: Add Routine to Flow
**As a** developer  
**I want to** add a routine to an existing flow  
**So that** I can extend flows without recreating them

**Acceptance Criteria**:
- [ ] "Add Routine" button in Routines tab
- [ ] Dialog opens with form
- [ ] Fields: Routine ID, Class Path, Config (optional)
- [ ] Validation: Class path format, routine ID uniqueness
- [ ] On submit: Routine added, flow refreshes
- [ ] Error handling for invalid class paths

#### Story 2.7: Remove Routine from Flow
**As a** developer  
**I want to** remove a routine from a flow  
**So that** I can clean up unused routines

**Acceptance Criteria**:
- [ ] "Remove" button on each routine card
- [ ] Confirmation dialog: "Remove routine and all its connections?"
- [ ] On confirm: Routine removed, connections cleaned up
- [ ] Flow refreshes automatically

#### Story 2.8: Add Connection to Flow
**As a** developer  
**I want to** add a connection between routines  
**So that** I can build flow logic

**Acceptance Criteria**:
- [ ] "Add Connection" button in Connections tab
- [ ] Dialog with form
- [ ] Source/Target routine and event/slot selectors
- [ ] Param mapping editor (optional)
- [ ] Validation: Source event and target slot must exist
- [ ] On submit: Connection added, flow refreshes

#### Story 2.9: Remove Connection from Flow
**As a** developer  
**I want to** remove a connection  
**So that** I can modify flow logic

**Acceptance Criteria**:
- [ ] "Remove" button on each connection
- [ ] Confirmation dialog
- [ ] On confirm: Connection removed, flow refreshes

#### Story 2.10: View Flow Metrics
**As a** developer  
**I want to** see aggregated metrics for a flow  
**So that** I can understand flow performance

**Acceptance Criteria**:
- [ ] Metrics tab in flow detail page
- [ ] Summary cards: Total jobs, Completed, Failed, Success rate
- [ ] Job metrics table with sortable columns
- [ ] Click job ID navigates to job page
- [ ] Loading state while fetching
- [ ] Empty state if no metrics

### Epic 3: Job Management

#### Story 3.1: Filter Jobs by Date Range
**As a** developer  
**I want to** filter jobs by creation date  
**So that** I can find jobs from specific time periods

**Acceptance Criteria**:
- [ ] Date range filter in Jobs list page
- [ ] Preset options: Last 24h, 7d, 30d, All Time
- [ ] Custom range picker
- [ ] Filter applies on selection
- [ ] Active filter shown in UI
- [ ] Clear filters button

#### Story 3.2: Advanced Job Cleanup
**As a** developer  
**I want to** cleanup jobs with multiple criteria  
**So that** I can manage storage efficiently

**Acceptance Criteria**:
- [ ] Cleanup dialog with enhanced options
- [ ] Multi-select for status filter
- [ ] Preview count before deletion
- [ ] Confirmation step
- [ ] Success toast with deleted count
- [ ] List refreshes after cleanup

#### Story 3.3: Pagination for Jobs List
**As a** developer  
**I want to** paginate through jobs  
**So that** I can handle large numbers of jobs

**Acceptance Criteria**:
- [ ] Pagination controls when jobs > limit
- [ ] Previous/Next buttons
- [ ] Page numbers
- [ ] Items per page selector
- [ ] Total count display
- [ ] URL query params for pagination state

### Epic 4: Enhanced Monitoring

#### Story 4.1: View Routine Info
**As a** developer  
**I want to** see detailed routine metadata  
**So that** I can understand routine configuration

**Acceptance Criteria**:
- [ ] Click routine in Routine States Panel
- [ ] Routine info card appears
- [ ] Shows: Policy, Config, Slots, Events
- [ ] Data from `/api/flows/{flowId}/routines/{routineId}/info`
- [ ] Loading state while fetching
- [ ] Close button to dismiss

#### Story 4.2: View Queue Status
**As a** developer  
**I want to** see queue status for all routines  
**So that** I can monitor queue pressure

**Acceptance Criteria**:
- [ ] "Queues" tab in debug sidebar
- [ ] Table/cards showing queue status
- [ ] Color-coded pressure levels
- [ ] Real-time updates via WebSocket
- [ ] Shows: Routine ID, Slot name, Queue length, Pressure

#### Story 4.3: Enhanced Queue Visualization
**As a** developer  
**I want to** see queue pressure visually  
**So that** I can quickly identify bottlenecks

**Acceptance Criteria**:
- [ ] Pressure levels: Low (green), Medium (yellow), High (orange), Critical (red)
- [ ] Progress bars or badges for queue length
- [ ] Tooltip on hover with details
- [ ] Auto-refresh or WebSocket updates

---

## 🎯 Interaction Flows

### Flow 1: Create and Validate Flow

```
1. User clicks "Create Flow" on Flows list page
2. Dialog opens with "Empty Flow" tab
3. User enters Flow ID, selects strategy, sets max workers
4. User clicks "Create"
5. Loading state shown
6. On success: Dialog closes, navigate to new flow page
7. User clicks "Validate Flow" in actions menu
8. Validation runs, results shown in Validation Status Card
9. If invalid: Issues list displayed
10. User fixes issues (if needed)
11. User validates again
```

### Flow 2: Discover and Sync Flows

```
1. User navigates to Discovery page
2. User sees discovered flows list (if any)
3. User clicks "Sync Flows" button
4. Loading spinner shown
5. API call: POST /api/discovery/flows/sync
6. On success: Toast "X flows synced", list refreshes
7. User enables "Auto-sync" toggle
8. Preference saved
9. On next connection: Auto-sync runs automatically
```

### Flow 3: Add Routine and Connection

```
1. User navigates to Flow detail page
2. User clicks "Routines" tab
3. User clicks "Add Routine" button
4. Dialog opens
5. User enters Routine ID, Class Path, Config (optional)
6. User clicks "Add"
7. Validation runs
8. On success: Routine added, dialog closes, list refreshes
9. User clicks "Connections" tab
10. User clicks "Add Connection" button
11. Dialog opens
12. User selects Source Routine → Source Event
13. User selects Target Routine → Target Slot
14. User adds param mapping (optional)
15. User clicks "Add"
16. Connection added, list refreshes
```

### Flow 4: Filter and Cleanup Jobs

```
1. User navigates to Jobs list page
2. User selects "Last 7 days" in date filter
3. List filters automatically
4. User selects "Completed" in status filter
5. List filters again
6. User clicks "Cleanup" button
7. Dialog opens
8. User sets max age: 24 hours
9. User selects "Completed" and "Failed" statuses
10. Preview shows: "X jobs will be deleted"
11. User clicks "Cleanup Jobs"
12. Confirmation dialog appears
13. User confirms
14. Cleanup runs
15. Success toast: "X jobs deleted"
16. List refreshes
```

---

## 📐 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md-lg)
- **Desktop**: > 1024px (xl+)

### Mobile Adaptations

#### Navigation
- Hamburger menu on mobile
- Collapsible navigation links
- Connection status always visible

#### Cards
- Single column on mobile
- 2 columns on tablet
- 3+ columns on desktop

#### Dialogs
- Full screen on mobile
- Centered modal on desktop
- Close button always visible

#### Tables
- Horizontal scroll on mobile
- Or convert to cards on small screens

#### Debug Sidebar
- Overlay on mobile (drawer)
- Fixed sidebar on desktop

---

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order logical
- Focus indicators visible
- Escape closes dialogs/modals

#### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for icons (if decorative, use aria-hidden)
- Live regions for dynamic content

#### Color Contrast
- Text contrast ratio: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus states

#### Error Handling
- Error messages associated with form fields
- Error summaries for forms
- Success feedback clearly communicated

---

## 🎨 Visual Design Details

### Color Palette
- **Primary**: Blue-600 (buttons, links, active states)
- **Secondary**: Indigo-600 (gradients, accents)
- **Success**: Green-600 (completed status, success messages)
- **Error**: Red-600 (failed status, error messages)
- **Warning**: Yellow-600 (paused status, warnings)
- **Muted**: Gray-500 (secondary text, borders)

### Typography
- **Headings**: font-bold
  - H1: text-3xl or text-5xl
  - H2: text-2xl
  - H3: text-xl
- **Body**: font-normal, text-base
- **Mono**: font-mono (for IDs, code, DSL)
- **Small**: text-sm or text-xs

### Spacing
- **Base Unit**: 4px
- **Card Padding**: p-6 (24px)
- **Section Gap**: gap-6 (24px)
- **Component Gap**: gap-4 (16px)
- **Small Gap**: gap-2 (8px)

### Shadows
- **Card**: shadow-sm (default)
- **Hover**: shadow-lg
- **Modal**: shadow-xl

### Borders
- **Default**: border (1px solid)
- **Hover**: border-primary/50
- **Focus**: ring-2 ring-primary

---

## 🧪 Testing Requirements

### Component Testing
- Unit tests for all new components
- Test user interactions
- Test error states
- Test loading states

### Integration Testing
- Test API calls
- Test WebSocket connections
- Test state management
- Test navigation flows

### E2E Testing
- Critical user flows
- Form submissions
- Error handling
- Real-time updates

---

## 📝 Implementation Checklist

### Phase 1: Discovery & Sync
- [ ] Create Discovery page (`/app/discovery/page.tsx`)
- [ ] Create DiscoverySyncControls component
- [ ] Create useDiscoveryStore
- [ ] Add Discovery link to Navbar
- [ ] Implement sync flows functionality
- [ ] Implement sync jobs functionality
- [ ] Implement auto-sync toggle
- [ ] Test discovery and sync flows

### Phase 2: Flow Management
- [ ] Create AddRoutineDialog component
- [ ] Create AddConnectionDialog component
- [ ] Create FlowValidationCard component
- [ ] Create FlowMetricsCard component
- [ ] Enhance Flow detail page with new tabs
- [ ] Implement create flow from empty
- [ ] Implement create flow from DSL
- [ ] Implement flow validation
- [ ] Implement DSL import
- [ ] Implement add/remove routine
- [ ] Implement add/remove connection
- [ ] Test all flow management features

### Phase 3: Job Management
- [ ] Create DateRangeFilter component
- [ ] Enhance cleanup dialog
- [ ] Implement pagination
- [ ] Enhance job filters
- [ ] Test job management features

### Phase 4: Enhanced Monitoring
- [ ] Create QueueStatusPanel component
- [ ] Create RoutineInfoCard component
- [ ] Enhance Routine States Panel
- [ ] Add Queues tab to debug sidebar
- [ ] Implement routine info display
- [ ] Implement queue status display
- [ ] Test monitoring features

### Phase 5: Polish & Testing
- [ ] Responsive design adjustments
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation updates
- [ ] E2E testing

---

## 📚 Additional Notes

### API Integration
- All API calls must use the generated TypeScript client
- Error handling: Try-catch blocks, user-friendly error messages
- Loading states: Show spinners/skeletons during API calls
- Success feedback: Toast notifications

### State Management
- Use Zustand stores for global state
- Local state for component-specific data
- URL query params for filter/pagination state
- localStorage for user preferences

### Performance
- Lazy load heavy components
- Debounce filter inputs
- Virtualize long lists
- Optimize re-renders with React.memo where needed

### Error Handling (ENHANCED)

**Error Categories & Messages**:

1. **Network Errors**:
   - Message: "Cannot connect to server. Please check your connection and try again."
   - Action: Retry button
   - Icon: WifiOff
   - Color: Red

2. **API Errors**:
   - **404 Not Found**: 
     - Message: "{Resource} not found. It may have been deleted."
     - Action: Navigate back or refresh
   - **400 Bad Request**:
     - Message: Show specific validation error from API
     - Action: Fix the issue and try again
   - **403 Forbidden**:
     - Message: "You don't have permission to perform this action. Contact your administrator."
     - Action: None (informational)
   - **500 Server Error**:
     - Message: "Server error occurred. Please try again later."
     - Action: Retry button
     - **Error ID**: Show error ID for support (e.g., "Error ID: abc123")

3. **Validation Errors**:
   - **Inline**: Show below form field
   - **Format**: Red text, specific message
   - **Example**: "Flow ID must be unique. 'test-flow' already exists."
   - **Error Summary**: For forms with multiple errors, show summary at top

4. **Generic Errors**:
   - Message: "Something went wrong. Please try again."
   - Action: Retry button
   - **Error Logging**: Log to console for developers

**Error Display Components**:
- **Toast Notifications**: For transient errors (3-5 seconds)
- **Alert Components**: For persistent errors (inline in forms)
- **Error Modals**: For critical errors requiring user attention

**Error Recovery**:
- **Retry Buttons**: For transient errors
- **Suggestions**: Provide helpful suggestions for common errors
- **Documentation Links**: Link to relevant docs for complex errors

---

## 🔍 Global Search Feature (NEW)

**Purpose**: Enable users to quickly find flows, jobs, and content across the application

### Search Modal

**Trigger**: 
- Search icon in navbar (click)
- Keyboard shortcut: `Cmd/Ctrl+K` (global)
- Keyboard shortcut: `Cmd/Ctrl+F` (when on Flows/Jobs pages)

**Component**: Command palette or full-screen modal

### Modal Structure
```
┌─────────────────────────────────────┐
│ 🔍 Search...              [Esc]     │
│ ─────────────────────────────────── │
│                                      │
│ Recent Searches                      │
│ • test-flow                          │
│ • job-123                            │
│                                      │
│ Quick Filters                        │
│ [Flows] [Jobs] [Logs]                │
│                                      │
│ Results (as user types)              │
│ ┌─────────────────────────────────┐ │
│ │ Flow: test-flow                 │ │
│ │ Job: job-123 (test-flow)        │ │
│ │ ...                              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Search Functionality

**Search Scope**:
- **Flows**: By ID, routine names, routine class names
- **Jobs**: By ID, flow ID, status
- **Logs/Events**: Search within job execution logs and events

**Search Behavior**:
- **Real-time**: Results update as user types (debounced 300ms)
- **Highlighting**: Highlight matching text in results
- **Keyboard Navigation**: Arrow keys to navigate, Enter to select
- **Recent Searches**: Show last 5 searches (stored in localStorage)

**Result Display**:
- **Grouped Results**: Separate sections for Flows, Jobs, Logs
- **Result Item**:
  - Title: Resource name/ID
  - Subtitle: Context (flow ID for jobs, routine count for flows)
  - Icon: Type indicator
  - Action: Click to navigate
- **Empty State**: "No results found. Try different keywords."

**Keyboard Shortcuts in Modal**:
- `Esc`: Close modal
- `Arrow Up/Down`: Navigate results
- `Enter`: Select highlighted result
- `Tab`: Switch between result groups

---

## ⌨️ Keyboard Shortcuts (NEW)

**Purpose**: Enable power users to navigate and interact efficiently

### Global Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd/Ctrl+K` | Open global search | Global |
| `Cmd/Ctrl+N` | Create new flow | Global (when on Flows page) |
| `Cmd/Ctrl+R` | Refresh current page | Global |
| `Esc` | Close dialogs/modals | Global |
| `?` | Show keyboard shortcuts help | Global |
| `Cmd/Ctrl+F` | Focus search (page-specific) | Flows/Jobs pages |

### Context-Specific Shortcuts

**Flow Canvas**:
- `Arrow Keys`: Navigate between nodes
- `Space`: Select/deselect node
- `Enter`: Open node details
- `Delete`: Delete selected node (if editable)

**Job Detail Page**:
- `P`: Pause job (if running)
- `R`: Resume job (if paused)
- `C`: Cancel job (if running/paused)
- `D`: Toggle debug sidebar

**Debug Sidebar**:
- `S`: Step over
- `I`: Step into
- `N`: Step to next breakpoint

### Shortcuts Help Modal

**Trigger**: Press `?` key

**Content**:
- List of all available shortcuts
- Grouped by context (Global, Flow Canvas, Job Detail, etc.)
- Searchable/filterable
- Keyboard icon indicators

**Implementation**:
- Use `useKeyboardShortcut` hook
- Display shortcuts in tooltips where applicable
- Help modal accessible from Help menu

---

## 📊 Data Visualization (NEW)

**Purpose**: Present metrics and trends visually for better understanding

### Chart Components

**Chart Library**: Recharts or similar (lightweight, React-friendly)

### Flow Metrics Charts

**Location**: Flow Detail Page → Metrics Tab

**Charts**:
1. **Job Duration Over Time**:
   - Type: Line chart
   - X-axis: Time (date)
   - Y-axis: Duration (seconds)
   - Multiple series: Show average, min, max
   - Tooltip: Show exact values on hover

2. **Success Rate Trend**:
   - Type: Area chart
   - X-axis: Time (date)
   - Y-axis: Success rate (%)
   - Color: Green for success, red for failure

3. **Status Distribution**:
   - Type: Pie/Donut chart
   - Segments: Completed, Failed, Cancelled, etc.
   - Show percentages
   - Click segment to filter jobs

4. **Job Count Over Time**:
   - Type: Bar chart
   - X-axis: Time (grouped by day/week)
   - Y-axis: Job count
   - Stacked: Show by status

### Dashboard Charts

**Location**: Dashboard → Statistics Cards

**Mini Charts (Sparklines)**:
- Small line charts in statistic cards
- Show trend over last 7/30 days
- Color: Green (up), Red (down), Gray (neutral)
- Tooltip on hover shows detailed values

### Queue Pressure Visualization

**Location**: Job Detail Page → Debug Sidebar → Queues Tab

**Visualization**:
- **Heatmap**: Color-coded grid showing queue pressure
  - Green: Low pressure
  - Yellow: Medium pressure
  - Orange: High pressure
  - Red: Critical pressure
- **Progress Bars**: Show queue length vs capacity
- **Tooltips**: Detailed info on hover

---

## 🎯 Enhanced User Flows (UPDATED)

### Flow 1: Enhanced Flow Creation (UPDATED)

```
1. User clicks "Create Flow" (from Dashboard, Flows page, or empty state)
2. Dialog opens with Step 1: Choose Creation Method
3. User selects method (e.g., "Start from scratch")
4. User clicks "Next"
5. Step 2: Form appears based on selection
6. User fills form (with real-time validation)
7. User clicks "Next"
8. Step 3: Preview and validation shown
9. If valid: "Create" button enabled
10. User clicks "Create"
11. Loading state shown
12. On success: Dialog closes, navigate to new flow page
13. Auto-open validation to check flow
```

### Flow 2: Enhanced Job Filtering (UPDATED)

```
1. User navigates to Jobs page
2. User sees quick filter buttons: [Today] [This Week] [Failed] [Running]
3. User clicks "This Week"
4. Active filter chip appears: [This Week ×]
5. List updates automatically
6. Filter summary shows: "Showing 15 of 150 jobs"
7. User adds status filter: "Completed"
8. Another chip appears: [Status: Completed ×]
9. User can remove individual filters or click "Clear All"
10. User can save filter combination (optional, future feature)
```

### Flow 3: Global Search (NEW)

```
1. User presses Cmd/Ctrl+K (or clicks search icon)
2. Search modal opens with autofocus
3. User types "test"
4. Results appear in real-time:
   - Flows: test-flow-1, test-flow-2
   - Jobs: job-123 (from test-flow-1)
5. User navigates with arrow keys
6. User presses Enter on a result
7. Navigates to that item
8. Search modal closes
9. Search term saved to recent searches
```

### Flow 4: Bulk Operations (NEW)

```
1. User navigates to Flows page
2. User clicks "Select" button (enters bulk mode)
3. Checkboxes appear on all flow cards
4. User selects multiple flows (or clicks "Select All")
5. Selection counter shows: "3 flows selected"
6. Bulk actions menu appears:
   - Delete
   - Export DSL
   - Validate
7. User clicks "Delete"
8. Confirmation dialog appears
9. User confirms
10. Selected flows deleted
11. Success toast: "3 flows deleted"
12. List refreshes
```

---

## 📝 Updated Implementation Checklist

### Phase 1: Core Enhancements (HIGH PRIORITY)
- [ ] Integrate Discovery into Flows/Jobs pages (remove from main nav)
- [ ] Add global search functionality (Cmd/Ctrl+K)
- [ ] Enhance error handling (specific, actionable messages)
- [ ] Add active filters display (removable chips)
- [ ] Improve empty states (illustrations, CTAs)
- [ ] Add keyboard shortcuts (basic set)
- [ ] Enhance status indicators (icons + colors)
- [ ] Add bulk operations (select multiple items)

### Phase 2: Flow Management Enhancements
- [ ] Update Flow creation to step-by-step wizard
- [ ] Add search bar to Flows page
- [ ] Add bulk selection and actions
- [ ] Enhance Flow detail page tabs
- [ ] Add data visualization (charts for metrics)

### Phase 3: Job Management Enhancements
- [ ] Add date range filter
- [ ] Add active filters bar
- [ ] Add quick filter buttons
- [ ] Enhance cleanup dialog
- [ ] Add bulk operations
- [ ] Implement pagination

### Phase 4: Enhanced Monitoring
- [ ] Add queue status panel
- [ ] Enhance routine info display
- [ ] Add data visualization
- [ ] Improve real-time updates

### Phase 5: Polish & Optimization
- [ ] Responsive design adjustments
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation updates
- [ ] E2E testing

---

## 📚 Additional Implementation Notes

### Global Search Implementation

**Component**: `components/search/GlobalSearchModal.tsx`

**State Management**:
```typescript
interface SearchState {
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  activeFilter: 'all' | 'flows' | 'jobs' | 'logs';
  loading: boolean;
}
```

**API Integration**:
- Search flows: Filter client-side or use search endpoint (if available)
- Search jobs: Use existing list endpoint with search param
- Search logs: Use job logs endpoint with search param

### Keyboard Shortcuts Implementation

**Hook**: `lib/hooks/useKeyboardShortcut.ts`

**Usage**:
```typescript
useKeyboardShortcut('cmd+k', () => openSearch());
useKeyboardShortcut('cmd+n', () => openCreateFlow(), { enabled: onFlowsPage });
```

**Prevent Default**: Ensure shortcuts don't conflict with browser defaults

### Bulk Operations Implementation

**State Management**:
- Add `selectedItems: Set<string>` to store
- Add `bulkMode: boolean` to UI store
- Actions: `selectItem`, `deselectItem`, `selectAll`, `clearSelection`

**UI Components**:
- Checkbox component for selection
- Bulk actions toolbar (appears when items selected)
- Confirmation dialogs for destructive actions

### Data Visualization Implementation

**Chart Library**: Recharts (recommended) or Chart.js

**Components**:
- `components/charts/LineChart.tsx`
- `components/charts/BarChart.tsx`
- `components/charts/PieChart.tsx`
- `components/charts/Sparkline.tsx`

**Data Processing**:
- Transform API data to chart format
- Handle empty states
- Show loading states
- Error handling for chart rendering

---

**End of Design Specification v2.1**

This document incorporates all design review recommendations and serves as the single source of truth for UI/UX implementation. All improvements from the design review have been integrated.

**Key Changes from v2.0**:
- ✅ Discovery integrated into Flows/Jobs pages
- ✅ Global search functionality added
- ✅ Enhanced error handling
- ✅ Active filters display
- ✅ Improved empty states
- ✅ Keyboard shortcuts
- ✅ Enhanced status indicators
- ✅ Bulk operations
- ✅ Step-by-step flow creation
- ✅ Data visualization
- ✅ Enhanced user flows

Any questions or ambiguities should be clarified before implementation begins.
