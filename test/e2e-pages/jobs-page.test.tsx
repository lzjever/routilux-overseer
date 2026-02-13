import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobsPageContent from "@/app/jobs/page";
import { useJobStore } from "@/lib/stores/jobStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { useFlowStore } from "@/lib/stores/flowStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: vi.fn(() => "/jobs"),
}));

// Mock stores
vi.mock("@/lib/stores/jobStore", () => ({
  useJobStore: vi.fn(),
}));

vi.mock("@/lib/stores/connectionStore", () => ({
  useConnectionStore: vi.fn(),
}));

vi.mock("@/lib/stores/discoveryStore", () => ({
  useDiscoveryStore: vi.fn(),
}));

vi.mock("@/lib/stores/flowStore", () => ({
  useFlowStore: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    health: { readiness: vi.fn().mockResolvedValue({ status: "ready" }) },
    jobs: {
      list: vi.fn().mockResolvedValue({
        jobs: [
          {
            job_id: "job-1",
            flow_id: "flow-1",
            status: "running",
            created_at: new Date().toISOString(),
          },
          {
            job_id: "job-2",
            flow_id: "flow-1",
            status: "completed",
            created_at: new Date().toISOString(),
          },
          {
            job_id: "job-3",
            flow_id: "flow-2",
            status: "failed",
            created_at: new Date().toISOString(),
          },
        ],
      }),
    },
  })),
}));

vi.mock("@/lib/websocket/websocket-manager", () => ({
  getWebSocketManager: vi.fn(() => ({
    connect: vi.fn(),
    on: vi.fn(),
    isConnected: vi.fn(() => false),
  })),
  disposeWebSocketManager: vi.fn(),
}));

describe("JobsPage", () => {
  const defaultConnectionState = {
    connected: true,
    serverUrl: "http://localhost:20555",
  };

  const defaultJobState = {
    jobs: new Map([
      [
        "job-1",
        {
          job_id: "job-1",
          flow_id: "flow-1",
          status: "running",
          created_at: new Date().toISOString(),
        },
      ],
      [
        "job-2",
        {
          job_id: "job-2",
          flow_id: "flow-1",
          status: "completed",
          created_at: new Date().toISOString(),
        },
      ],
      [
        "job-3",
        {
          job_id: "job-3",
          flow_id: "flow-2",
          status: "failed",
          created_at: new Date().toISOString(),
        },
      ],
    ]),
    loading: false,
    error: null,
    loadJobs: vi.fn(),
    setJobs: vi.fn(),
    wsConnected: false,
    connectWebSocket: vi.fn(),
    disconnectWebSocket: vi.fn(),
  };

  const defaultDiscoveryState = {
    discoveredJobs: [],
    syncingJobs: false,
    lastJobSync: new Date(),
    discoverJobs: vi.fn(),
    syncJobs: vi.fn().mockResolvedValue(3),
  };

  const defaultFlowState = {
    flows: new Map([
      ["flow-1", { flow_id: "flow-1", name: "Test Flow 1" }],
      ["flow-2", { flow_id: "flow-2", name: "Test Flow 2" }],
    ]),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useConnectionStore as any).mockReturnValue(defaultConnectionState);
    (useJobStore as any).mockImplementation((selector) =>
      selector ? selector(defaultJobState) : defaultJobState
    );
    (useDiscoveryStore as any).mockReturnValue(defaultDiscoveryState);
    (useFlowStore as any).mockImplementation((selector) =>
      selector ? selector(defaultFlowState) : defaultFlowState
    );
  });

  describe("When not connected", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue({
        connected: false,
        serverUrl: null,
      });
    });

    it("should render not connected state", () => {
      render(<JobsPageContent />);

      expect(screen.getByTestId("jobs-not-connected")).toBeInTheDocument();
    });
  });

  describe("When connected", () => {
    beforeEach(() => {
      // Ensure connected state is set after other test blocks
      (useConnectionStore as any).mockReturnValue(defaultConnectionState);
    });

    it("should render jobs page", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-page")).toBeInTheDocument();
    });

    it("should display refresh button", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-button-refresh")).toBeInTheDocument();
    });

    it("should display sync button", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-button-sync")).toBeInTheDocument();
    });

    it("should display status filter", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-select-status-filter")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    beforeEach(() => {
      (useJobStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultJobState, loading: true })
          : { ...defaultJobState, loading: true }
      );
    });

    it("should show loading state", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-loading")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    beforeEach(() => {
      (useJobStore as any).mockImplementation((selector) =>
        selector
          ? selector({ ...defaultJobState, jobs: new Map() })
          : { ...defaultJobState, jobs: new Map() }
      );
    });

    it("should show empty state when no jobs", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-empty-state")).toBeInTheDocument();
    });
  });

  describe("Job List", () => {
    it("should display jobs list container", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-table-list")).toBeInTheDocument();
    });

    it("should display job rows", async () => {
      render(<JobsPageContent />);

      expect(await screen.findByTestId("jobs-row-job-1")).toBeInTheDocument();
      expect(await screen.findByTestId("jobs-row-job-2")).toBeInTheDocument();
      expect(await screen.findByTestId("jobs-row-job-3")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("should have status filter dropdown", async () => {
      render(<JobsPageContent />);

      const statusFilter = await screen.findByTestId("jobs-select-status-filter");
      expect(statusFilter).toBeInTheDocument();
    });
  });

  describe("Refresh Action", () => {
    it("should have clickable refresh button", async () => {
      render(<JobsPageContent />);

      const refreshButton = await screen.findByTestId("jobs-button-refresh");
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton);
      // The refresh action is handled internally
    });
  });
});
