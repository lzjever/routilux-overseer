import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import { Activity } from "lucide-react";

describe("EmptyState", () => {
  it("should render with title and description", () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("There are no items to display")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    render(
      <EmptyState
        icon={Activity}
        title="No items"
        description="There are no items to display"
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("should render action button", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
        action={{ label: "Create Item", onClick: handleClick }}
      />
    );
    const button = screen.getByText("Create Item");
    expect(button).toBeInTheDocument();
  });

  it("should render secondary action button", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
        secondaryAction={{ label: "Learn More", onClick: handleClick }}
      />
    );
    const button = screen.getByText("Learn More");
    expect(button).toBeInTheDocument();
  });
});
