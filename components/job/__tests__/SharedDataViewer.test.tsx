import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SharedDataViewer } from "../SharedDataViewer";

describe("SharedDataViewer", () => {
  it("should render shared data viewer", () => {
    const sharedData = { key1: "value1", key2: { nested: "value2" } };

    render(<SharedDataViewer sharedData={sharedData} />);

    expect(screen.getByText("Shared Data")).toBeInTheDocument();
  });

  it("should display shared data keys", () => {
    const sharedData = { key1: "value1", key2: "value2" };

    render(<SharedDataViewer sharedData={sharedData} />);

    expect(screen.getByText("key1")).toBeInTheDocument();
    expect(screen.getByText("key2")).toBeInTheDocument();
  });

  it("should display empty state when no shared data", () => {
    render(<SharedDataViewer sharedData={{}} />);

    expect(screen.getByText("No shared data")).toBeInTheDocument();
  });

  it("should handle nested objects", () => {
    const sharedData = {
      user: { name: "John", age: 30 },
      settings: { theme: "dark" },
    };

    render(<SharedDataViewer sharedData={sharedData} />);

    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("settings")).toBeInTheDocument();
  });

  it("should display description", () => {
    const sharedData = { key: "value" };

    render(<SharedDataViewer sharedData={sharedData} />);

    expect(
      screenByText("Execution-wide data storage accessible by all routines")
    ).toBeInTheDocument();
  });
});

// Helper function for text matching
function screenByText(text: string): HTMLElement | never {
  const element = screen.queryByText(text);
  if (!element) {
    throw new Error(`Element with text "${text}" not found`);
  }
  return element;
}
