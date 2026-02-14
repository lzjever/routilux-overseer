# Routine Docstring Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display routine docstrings in the UI to help users understand routines when viewing routine info and submitting jobs.

**Architecture:** Add docstring fetching via Factory API (`api.factory.getObjectMetadata`) and display in multiple components: RoutineDetails, FlowDetailsSidebar, SubmitJobDialog, and RunOnceDialog. Use ScrollArea for long docstrings with proper formatting.

**Tech Stack:** React, TypeScript, shadcn/ui components (ScrollArea, Collapsible), existing API client

---

## Background

Currently, the UI displays routine `class_name` but not the docstring. The Factory API endpoint `/api/v1/factory/objects/{name}` returns `ObjectMetadataResponse` with a `docstring` field containing full documentation. This plan adds docstring display in two key scenarios:

1. **Viewing Routine Info** - When users view routine details in the flow page
2. **Submitting Jobs** - When users select a routine to submit a job

---

## Task 1: Create Reusable Docstring Display Component

**Files:**
- Create: `components/routine/RoutineDocstring.tsx`
- Create: `components/routine/RoutineDocstring.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/routine/RoutineDocstring.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoutineDocstring } from "./RoutineDocstring";

describe("RoutineDocstring", () => {
  it("should display docstring when provided", () => {
    render(<RoutineDocstring docstring="This is a test docstring" />);

    expect(screen.getByText("This is a test docstring")).toBeInTheDocument();
  });

  it("should show placeholder when docstring is null", () => {
    render(<RoutineDocstring docstring={null} />);

    expect(screen.getByText(/no documentation available/i)).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<RoutineDocstring docstring={null} loading />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render multi-line docstring with whitespace preserved", () => {
    const multilineDocstring = "Line 1\nLine 2\nLine 3";
    render(<RoutineDocstring docstring={multilineDocstring} />);

    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- components/routine/RoutineDocstring.test.tsx --run`
Expected: FAIL with "Cannot find module './RoutineDocstring'"

**Step 3: Create the component directory and implement**

```bash
mkdir -p components/routine
```

```typescript
// components/routine/RoutineDocstring.tsx
"use client";

import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RoutineDocstringProps {
  docstring: string | null | undefined;
  loading?: boolean;
  className?: string;
  maxHeight?: string;
  collapsed?: boolean;
}

export function RoutineDocstring({
  docstring,
  loading = false,
  className,
  maxHeight = "200px",
  collapsed = false,
}: RoutineDocstringProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground p-3", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading documentation...</span>
      </div>
    );
  }

  if (!docstring) {
    return (
      <div className={cn("text-sm text-muted-foreground italic p-3", className)}>
        No documentation available
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)} style={{ maxHeight }}>
      <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-3 rounded-md border text-foreground/90">
        {docstring}
      </pre>
    </ScrollArea>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- components/routine/RoutineDocstring.test.tsx --run`
Expected: PASS

**Step 5: Commit**

```bash
git add components/routine/RoutineDocstring.tsx components/routine/RoutineDocstring.test.tsx
git commit -m "feat: add RoutineDocstring component for displaying routine documentation"
```

---

## Task 2: Add Docstring to SubmitJobDialog

**Files:**
- Modify: `components/job/SubmitJobDialog.tsx`
- Modify: `components/job/SubmitJobDialog.test.tsx`

**Step 1: Add state for docstring loading**

In `components/job/SubmitJobDialog.tsx`, add state after existing state declarations (around line 45):

```typescript
const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
const [loadingDocstring, setLoadingDocstring] = useState(false);
```

**Step 2: Add useEffect to load docstring when routine is selected**

Add after the existing `loadRoutines` useEffect (around line 90):

```typescript
// Load docstring when routine is selected
useEffect(() => {
  const loadDocstring = async () => {
    if (!selectedRoutineId || !serverUrl) {
      setRoutineDocstring(null);
      return;
    }

    // Find the selected routine to get its class_name
    const selectedRoutine = routines.find((r) => r.routine_id === selectedRoutineId);
    if (!selectedRoutine?.class_name) {
      setRoutineDocstring(null);
      return;
    }

    setLoadingDocstring(true);
    try {
      const api = createAPI(serverUrl);
      const metadata = await api.factory.getObjectMetadata(selectedRoutine.class_name);
      setRoutineDocstring(metadata.docstring || null);
    } catch (error) {
      console.error("Failed to load routine docstring:", error);
      setRoutineDocstring(null);
    } finally {
      setLoadingDocstring(false);
    }
  };

  loadDocstring();
}, [selectedRoutineId, serverUrl, routines]);
```

**Step 3: Add import for RoutineDocstring component**

Add at the top of the file with other imports:

```typescript
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";
```

**Step 4: Add docstring display in the UI**

Insert after the routine selector (around line 210, after the `</Select>` closing tag):

```typescript
{/* Routine Documentation */}
{selectedRoutineId && (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      Routine Documentation
    </Label>
    <RoutineDocstring
      docstring={routineDocstring}
      loading={loadingDocstring}
      maxHeight="150px"
    />
  </div>
)}
```

**Step 5: Add FileText icon import**

Add `FileText` to the lucide-react import:

```typescript
import { Loader2, FileText } from "lucide-react";
```

**Step 6: Test manually**

Run: `npm run dev`
Navigate to: Jobs page -> Click "Submit Job" -> Select a flow -> Select a routine
Expected: Docstring should appear below the routine selector

**Step 7: Commit**

```bash
git add components/job/SubmitJobDialog.tsx
git commit -m "feat: display routine docstring in SubmitJobDialog"
```

---

## Task 3: Add Docstring to RunOnceDialog

**Files:**
- Modify: `components/flow/RunOnceDialog.tsx`

**Step 1: Add state for docstring loading**

In `components/flow/RunOnceDialog.tsx`, add state after existing state declarations:

```typescript
const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
const [loadingDocstring, setLoadingDocstring] = useState(false);
```

**Step 2: Add useEffect to load docstring when routine is selected**

Add after the existing routine loading logic:

```typescript
// Load docstring when routine is selected
useEffect(() => {
  const loadDocstring = async () => {
    if (!selectedRoutineId || !serverUrl) {
      setRoutineDocstring(null);
      return;
    }

    const selectedRoutine = routines.find((r) => r.routine_id === selectedRoutineId);
    if (!selectedRoutine?.class_name) {
      setRoutineDocstring(null);
      return;
    }

    setLoadingDocstring(true);
    try {
      const api = createAPI(serverUrl);
      const metadata = await api.factory.getObjectMetadata(selectedRoutine.class_name);
      setRoutineDocstring(metadata.docstring || null);
    } catch (error) {
      console.error("Failed to load routine docstring:", error);
      setRoutineDocstring(null);
    } finally {
      setLoadingDocstring(false);
    }
  };

  loadDocstring();
}, [selectedRoutineId, serverUrl, routines]);
```

**Step 3: Add imports**

```typescript
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";
import { FileText } from "lucide-react";
```

**Step 4: Add docstring display in the UI**

Insert after the routine selector:

```typescript
{/* Routine Documentation */}
{selectedRoutineId && (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      Routine Documentation
    </Label>
    <RoutineDocstring
      docstring={routineDocstring}
      loading={loadingDocstring}
      maxHeight="150px"
    />
  </div>
)}
```

**Step 5: Test manually**

Run: `npm run dev`
Navigate to: Flow detail page -> Click "Run Once" -> Select a routine
Expected: Docstring should appear below the routine selector

**Step 6: Commit**

```bash
git add components/flow/RunOnceDialog.tsx
git commit -m "feat: display routine docstring in RunOnceDialog"
```

---

## Task 4: Add Docstring to RoutineDetails Component

**Files:**
- Modify: `components/flow/RoutineDetails.tsx`

**Step 1: Add state and loading logic**

In `components/flow/RoutineDetails.tsx`, add state after existing state:

```typescript
const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
const [loadingDocstring, setLoadingDocstring] = useState(false);
```

**Step 2: Add useEffect to load docstring**

Add useEffect after existing effects:

```typescript
// Load docstring when selected routine changes
useEffect(() => {
  const loadDocstring = async () => {
    if (!selectedRoutine || !serverUrl || !routines[selectedRoutine]) {
      setRoutineDocstring(null);
      return;
    }

    const routine = routines[selectedRoutine];
    if (!routine.class_name) {
      setRoutineDocstring(null);
      return;
    }

    setLoadingDocstring(true);
    try {
      const api = createAPI(serverUrl);
      const metadata = await api.factory.getObjectMetadata(routine.class_name);
      setRoutineDocstring(metadata.docstring || null);
    } catch (error) {
      console.error("Failed to load routine docstring:", error);
      setRoutineDocstring(null);
    } finally {
      setLoadingDocstring(false);
    }
  };

  loadDocstring();
}, [selectedRoutine, serverUrl, routines]);
```

**Step 3: Add imports**

```typescript
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";
import { FileText } from "lucide-react";
```

**Step 4: Add docstring display in the UI**

Insert after the Class Name display section (around line 105):

```typescript
{/* Documentation */}
<div className="space-y-2">
  <Label className="flex items-center gap-2">
    <FileText className="h-4 w-4" />
    Documentation
  </Label>
  <RoutineDocstring
    docstring={routineDocstring}
    loading={loadingDocstring}
    maxHeight="300px"
  />
</div>
```

**Step 5: Test manually**

Run: `npm run dev`
Navigate to: Flow detail page -> Click on a routine node
Expected: Docstring should appear in the routine details panel

**Step 6: Commit**

```bash
git add components/flow/RoutineDetails.tsx
git commit -m "feat: display routine docstring in RoutineDetails component"
```

---

## Task 5: Add Docstring Tooltip in FlowDetailsSidebar

**Files:**
- Modify: `components/flow/FlowDetailsSidebar.tsx`

**Step 1: Add a helper component for truncated docstring preview**

In `components/flow/FlowDetailsSidebar.tsx`, add a small component for showing truncated docstring in routine list items:

```typescript
// Add inside the component, before the return statement
const RoutineDocstringPreview = ({ className }: { className: string }) => {
  const [docstring, setDocstring] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDocstring = async () => {
      if (!serverUrl || !className) {
        setDocstring(null);
        return;
      }

      setLoading(true);
      try {
        const api = createAPI(serverUrl);
        const metadata = await api.factory.getObjectMetadata(className);
        // Get first line or first 100 chars
        const fullDocstring = metadata.docstring || "";
        const firstLine = fullDocstring.split("\n")[0];
        setDocstring(firstLine.length > 100 ? firstLine.slice(0, 100) + "..." : firstLine);
      } catch (error) {
        setDocstring(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocstring();
  }, [className, serverUrl]);

  if (loading || !docstring) return null;

  return (
    <p className="text-xs text-muted-foreground truncate mt-0.5" title={docstring}>
      {docstring}
    </p>
  );
};
```

**Step 2: Add the preview to routine list items**

In the routine list item (around line 173), add after the class_name line:

```typescript
<p className="text-xs text-muted-foreground truncate mt-0.5">
  {routine.class_name || "Unknown"}
</p>
<RoutineDocstringPreview className={routine.class_name} />
```

**Step 3: Test manually**

Run: `npm run dev`
Navigate to: Flow detail page
Expected: Routine items in sidebar show truncated docstring preview

**Step 4: Commit**

```bash
git add components/flow/FlowDetailsSidebar.tsx
git commit -m "feat: add docstring preview in FlowDetailsSidebar routine list"
```

---

## Task 6: Add Docstring to RoutineDetailPanel (Job Execution View)

**Files:**
- Modify: `components/job/RoutineDetailPanel.tsx`

**Step 1: Add state for docstring**

```typescript
const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
const [loadingDocstring, setLoadingDocstring] = useState(false);
```

**Step 2: Add useEffect to load docstring**

```typescript
useEffect(() => {
  const loadDocstring = async () => {
    const className = (routineState as any)?._config?.className;
    if (!className || !serverUrl) {
      setRoutineDocstring(null);
      return;
    }

    setLoadingDocstring(true);
    try {
      const api = createAPI(serverUrl);
      const metadata = await api.factory.getObjectMetadata(className);
      setRoutineDocstring(metadata.docstring || null);
    } catch (error) {
      console.error("Failed to load routine docstring:", error);
      setRoutineDocstring(null);
    } finally {
      setLoadingDocstring(false);
    }
  };

  if (routineState) {
    loadDocstring();
  }
}, [routineState, serverUrl]);
```

**Step 3: Add imports**

```typescript
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
```

**Step 4: Add collapsible docstring section in the header**

After the header section (around line 145), add:

```typescript
{/* Collapsible Documentation Section */}
{(routineDocstring || loadingDocstring) && (
  <Collapsible open={docstringOpen} onOpenChange={setDocstringOpen} className="border-b">
    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-slate-50">
      <span className="flex items-center gap-2 font-medium">
        <FileText className="h-4 w-4" />
        Routine Documentation
      </span>
      {docstringOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </CollapsibleTrigger>
    <CollapsibleContent className="px-4 py-2">
      <RoutineDocstring
        docstring={routineDocstring}
        loading={loadingDocstring}
        maxHeight="200px"
      />
    </CollapsibleContent>
  </Collapsible>
)}
```

**Step 5: Add Collapsible state and imports**

```typescript
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Add state
const [docstringOpen, setDocstringOpen] = useState(false);
```

**Step 6: Test manually**

Run: `npm run dev`
Navigate to: Job detail page -> Click on a routine
Expected: Collapsible documentation section appears in the routine panel

**Step 7: Commit**

```bash
git add components/job/RoutineDetailPanel.tsx
git commit -m "feat: add collapsible docstring section in RoutineDetailPanel"
```

---

## Task 7: Run Full Test Suite and Build

**Step 1: Run unit tests**

Run: `npm run test:run`
Expected: All tests pass

**Step 2: Run E2E tests**

Run: `npm run test:e2e`
Expected: Core tests pass

**Step 3: Build the application**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup for routine docstring feature"
```

---

## Verification Checklist

After implementation, verify:

- [ ] RoutineDocstring component displays docstring correctly
- [ ] SubmitJobDialog shows docstring when routine is selected
- [ ] RunOnceDialog shows docstring when routine is selected
- [ ] RoutineDetails panel shows docstring for selected routine
- [ ] FlowDetailsSidebar shows truncated docstring preview
- [ ] RoutineDetailPanel shows collapsible docstring section
- [ ] All unit tests pass
- [ ] Build succeeds
- [ ] No console errors in browser

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `components/routine/RoutineDocstring.tsx` | Create | Reusable docstring display component |
| `components/routine/RoutineDocstring.test.tsx` | Create | Unit tests for docstring component |
| `components/job/SubmitJobDialog.tsx` | Modify | Add docstring display for job submission |
| `components/flow/RunOnceDialog.tsx` | Modify | Add docstring display for run once |
| `components/flow/RoutineDetails.tsx` | Modify | Add docstring display in routine info |
| `components/flow/FlowDetailsSidebar.tsx` | Modify | Add docstring preview in routine list |
| `components/job/RoutineDetailPanel.tsx` | Modify | Add collapsible docstring section |
