import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobStateSummary } from "../JobStateSummary";
import { mockJobState } from "@/test/test-utils";

describe("JobStateSummary", () => {
  it("should render job state summary", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.getByText("Job State Summary")).toBeInTheDocument();
  });

  it("should display current routine", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.getByText("Current Routine")).toBeInTheDocument();
    expect(screen.getByText("routine-1")).toBeInTheDocument();
  });

  it("should display job status", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("should display timestamps", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
  });

  it("should display pause points when available", () => {
    const jobStateWithPausePoints = {
      ...mockJobState,
      pause_points: [
        {
          timestamp: "2025-01-15T10:00:00Z",
          reason: "breakpoint",
          current_routine_id: "routine-1",
          checkpoint: { data: "test" },
        },
      ],
    };

    render(<JobStateSummary jobState={jobStateWithPausePoints} />);

    expect(screen.getByText(/Pause History/i)).toBeInTheDocument();
    expect(screen.getByText("breakpoint")).toBeInTheDocument();
  });

  it("should display deferred events when available", () => {
    const jobStateWithDeferredEvents = {
      ...mockJobState,
      deferred_events: [
        {
          routine_id: "routine-1",
          event_name: "test_event",
          data: { key: "value" },
          timestamp: "2025-01-15T10:00:00Z",
        },
      ],
    };

    render(<JobStateSummary jobState={jobStateWithDeferredEvents} />);

    expect(screen.getByText(/1 Deferred Events/i)).toBeInTheDocument();
  });

  it("should not display pause points when none exist", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.queryByText("Pause History")).not.toBeInTheDocument();
  });

  it("should not display deferred events when none exist", () => {
    render(<JobStateSummary jobState={mockJobState} />);

    expect(screen.queryByText(/Deferred Events/i)).not.toBeInTheDocument();
  });
});
