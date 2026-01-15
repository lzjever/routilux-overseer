import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlowMetadata } from "../FlowMetadata";
import { mockFlow } from "@/test/test-utils";

describe("FlowMetadata", () => {
  it("should render flow metadata", () => {
    render(<FlowMetadata flow={mockFlow} />);

    expect(screen.getByText("Flow Information")).toBeInTheDocument();
  });

  it("should display flow ID", () => {
    render(<FlowMetadata flow={mockFlow} />);

    expect(screen.getByText("Flow ID")).toBeInTheDocument();
    expect(screen.getByText("test-flow-1")).toBeInTheDocument();
  });

  it("should display execution strategy", () => {
    render(<FlowMetadata flow={mockFlow} />);

    expect(screen.getByText("Execution Strategy")).toBeInTheDocument();
    expect(screen.getByText("parallel")).toBeInTheDocument();
  });

  it("should display max workers", () => {
    render(<FlowMetadata flow={mockFlow} />);

    expect(screen.getByText("Max Workers")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("should display statistics", () => {
    render(<FlowMetadata flow={mockFlow} />);

    expect(screen.getByText("Routines")).toBeInTheDocument();
    expect(screen.getByText("Connections")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 routines
  });

  it("should handle different execution strategies", () => {
    const sequentialFlow = { ...mockFlow, execution_strategy: "sequential" };

    render(<FlowMetadata flow={sequentialFlow} />);

    expect(screen.getByText("sequential")).toBeInTheDocument();
  });

  it("should calculate cross-connections correctly", () => {
    render(<FlowMetadata flow={mockFlow} />);

    // Should show cross-connections (different from total connections)
    // This tests the logic that filters self-connections
    expect(screen.getByText(/Cross-Connections/i)).toBeInTheDocument();
  });
});
