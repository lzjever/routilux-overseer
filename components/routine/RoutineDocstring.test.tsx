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
