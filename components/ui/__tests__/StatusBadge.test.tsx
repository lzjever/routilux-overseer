import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("should render pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should render running status with spinner", () => {
    render(<StatusBadge status="running" showSpinner />);
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("should render completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should render failed status", () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("should render paused status", () => {
    render(<StatusBadge status="paused" />);
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("should render cancelled status", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("should render unknown status", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("should hide icon when showIcon is false", () => {
    const { container } = render(<StatusBadge status="running" showIcon={false} />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(0);
  });

  it("should be clickable when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<StatusBadge status="running" onClick={handleClick} />);
    const badge = screen.getByRole("button");
    expect(badge).toBeInTheDocument();
  });
});
