import { describe, it, expect, beforeEach } from "vitest";
import { useSearchStore } from "../searchStore";

describe("searchStore", () => {
  beforeEach(() => {
    useSearchStore.setState({
      isOpen: false,
      query: "",
    });
  });

  it("should initialize with default state", () => {
    const state = useSearchStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe("");
  });

  it("should open search", () => {
    useSearchStore.getState().open();
    expect(useSearchStore.getState().isOpen).toBe(true);
  });

  it("should close search", () => {
    useSearchStore.getState().open();
    useSearchStore.getState().close();
    expect(useSearchStore.getState().isOpen).toBe(false);
    expect(useSearchStore.getState().query).toBe("");
  });

  it("should set query", () => {
    useSearchStore.getState().setQuery("test query");
    expect(useSearchStore.getState().query).toBe("test query");
  });
});
