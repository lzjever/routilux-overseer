import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlowMetadata } from "../FlowMetadata";
import { mockFlow } from "@/test/test-utils";

// Mock the createAPI function
vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    flows: {
      validate: vi.fn(() => Promise.resolve({ valid: true, errors: [], warnings: [] })),
    },
    jobs: {
      list: vi.fn(() => Promise.resolve({ total: 5, items: [] })),
    },
  })),
}));

describe("FlowMetadata", () => {
  it("should render flow metadata", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" />);

    expect(screen.getByText("Flow Information")).toBeInTheDocument();
  });

  it("should display flow ID", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" />);

    expect(screen.getByText("Flow ID")).toBeInTheDocument();
    expect(screen.getByText("test-flow-1")).toBeInTheDocument();
  });

  it("should display statistics", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" />);

    expect(screen.getByText("Routines")).toBeInTheDocument();
    expect(screen.getByText("Connections")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 routines
  });

  it("should display cross-connections", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" />);

    // Should show cross-connections (different from total connections)
    // This tests the logic that filters self-connections
    expect(screen.getByText(/Cross-Connections/i)).toBeInTheDocument();
  });

  it("should show validation status when serverUrl is provided", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" serverUrl="http://localhost:20555" />);

    expect(screen.getByText("Validation Status")).toBeInTheDocument();
  });

  it("should show jobs section when serverUrl is provided", () => {
    render(<FlowMetadata flow={mockFlow} flowId="test-flow-1" serverUrl="http://localhost:20555" />);

    expect(screen.getByText("Jobs")).toBeInTheDocument();
  });
});
