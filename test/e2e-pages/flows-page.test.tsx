import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlowsPage from "@/app/flows/page";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: vi.fn(() => "/flows"),
}));

// Mock stores
vi.mock("@/lib/stores/flowStore", () => ({
  useFlowStore: vi.fn(),
}));

vi.mock("@/lib/stores/connectionStore", () => ({
  useConnectionStore: vi.fn(),
}));

vi.mock("@/lib/stores/discoveryStore", () => ({
  useDiscoveryStore: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    health: { readiness: vi.fn().mockResolvedValue({ status: "ready" }) },
  })),
}));

describe("FlowsPage", () => {
  const defaultConnectionState = {
    connected: true,
    serverUrl: "http://localhost:20555",
  };

  const defaultFlowState = {
    flows: new Map([
      ["flow-1", { flow_id: "flow-1", name: "Test Flow 1", routines: {}, connections: [] }],
      ["flow-2", { flow_id: "flow-2", name: "Test Flow 2", routines: {}, connections: [] }],
    ]),
    loading: false,
    error: null,
    loadFlows: vi.fn(),
  };

  const defaultDiscoveryState = {
    discoveredFlows: [],
    syncingFlows: false,
    lastFlowSync: new Date(),
    discoverFlows: vi.fn(),
    syncFlows: vi.fn().mockResolvedValue(2),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useConnectionStore as any).mockReturnValue(defaultConnectionState);
    (useFlowStore as any).mockImplementation((selector) =>
      selector ? selector(defaultFlowState) : defaultFlowState
    );
    (useDiscoveryStore as any).mockReturnValue(defaultDiscoveryState);
  });

  describe("When not connected", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue({
        connected: false,
        serverUrl: null,
      });
    });

    it("should render not connected state", () => {
      render(<FlowsPage />);

      // Should show not connected card - use more specific selector
      expect(screen.getByTestId("flows-not-connected")).toBeInTheDocument();
    });
  });

  describe("When connected", () => {
    it("should render flows page", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-page")).toBeInTheDocument();
    });

    it("should display refresh button", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-button-refresh")).toBeInTheDocument();
    });

    it("should display sync button", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-button-sync")).toBeInTheDocument();
    });

    it("should display search input", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-input-search")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    beforeEach(() => {
      (useFlowStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultFlowState, loading: true })
          : { ...defaultFlowState, loading: true }
      );
    });

    it("should show loading state", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-loading")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    beforeEach(() => {
      (useFlowStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultFlowState, flows: new Map() })
          : { ...defaultFlowState, flows: new Map() }
      );
    });

    it("should show empty state when no flows", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-empty-state")).toBeInTheDocument();
    });
  });

  describe("Flow List", () => {
    it("should display flow cards", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-card-flow-1")).toBeInTheDocument();
      expect(screen.getByTestId("flows-card-flow-2")).toBeInTheDocument();
    });

    it("should display flow checkboxes", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-checkbox-flow-1")).toBeInTheDocument();
      expect(screen.getByTestId("flows-checkbox-flow-2")).toBeInTheDocument();
    });

    it("should display view buttons for each flow", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-button-view-flow-1")).toBeInTheDocument();
      expect(screen.getByTestId("flows-button-view-flow-2")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    beforeEach(() => {
      (useFlowStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultFlowState, error: "Failed to load flows" })
          : { ...defaultFlowState, error: "Failed to load flows" }
      );
    });

    it("should show error state", () => {
      render(<FlowsPage />);

      expect(screen.getByTestId("flows-error")).toBeInTheDocument();
    });
  });

  describe("Refresh Action", () => {
    it("should call loadFlows when refresh button clicked", async () => {
      const mockLoadFlows = vi.fn();
      (useFlowStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultFlowState, loadFlows: mockLoadFlows })
          : { ...defaultFlowState, loadFlows: mockLoadFlows }
      );

      render(<FlowsPage />);

      const refreshButton = screen.getByTestId("flows-button-refresh");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockLoadFlows).toHaveBeenCalled();
      });
    });
  });
});
