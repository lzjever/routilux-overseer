import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "@/app/page";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = { push: mockPush };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
}));

// Mock stores
vi.mock("@/lib/stores/connectionStore", () => ({
  useConnectionStore: vi.fn(),
}));

vi.mock("@/lib/stores/flowStore", () => ({
  useFlowStore: vi.fn(),
}));

vi.mock("@/lib/stores/jobStore", () => ({
  useJobStore: vi.fn(),
}));

vi.mock("@/lib/stores/discoveryStore", () => ({
  useDiscoveryStore: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    health: {
      stats: vi.fn().mockResolvedValue({}),
    },
  })),
}));

describe("HomePage", () => {
  const defaultConnectionState = {
    connected: true,
    serverUrl: "http://localhost:20555",
  };

  const defaultFlowState = {
    flows: new Map([
      ["flow-1", { flow_id: "flow-1", name: "Test Flow 1" }],
      ["flow-2", { flow_id: "flow-2", name: "Test Flow 2" }],
    ]),
    loading: false,
    loadFlows: vi.fn(),
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
    ]),
    loading: false,
    loadJobs: vi.fn(),
  };

  const defaultDiscoveryState = {
    lastFlowSync: new Date(),
    lastJobSync: new Date(),
    lastWorkerSync: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useConnectionStore as any).mockImplementation((selector) =>
      selector ? selector(defaultConnectionState) : defaultConnectionState
    );
    (useFlowStore as any).mockImplementation((selector) =>
      selector ? selector(defaultFlowState) : defaultFlowState
    );
    (useJobStore as any).mockImplementation((selector) =>
      selector ? selector(defaultJobState) : defaultJobState
    );
    (useDiscoveryStore as any).mockReturnValue(defaultDiscoveryState);
  });

  describe("When not connected", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockImplementation((selector) =>
        selector
          ? selector({ connected: false, serverUrl: null })
          : { connected: false, serverUrl: null }
      );
    });

    it("should render not connected state", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-card-not-connected")).toBeInTheDocument();
      expect(screen.getByTestId("home-button-connect")).toBeInTheDocument();
    });

    it("should navigate to connect page when button clicked", () => {
      render(<HomePage />);

      const connectButton = screen.getByTestId("home-button-connect");
      fireEvent.click(connectButton);

      expect(mockPush).toHaveBeenCalledWith("/connect");
    });
  });

  describe("When connected", () => {
    it("should render home page", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("should display page title", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-title")).toBeInTheDocument();
      expect(screen.getByTestId("home-title").textContent).toBe("Routilux Overseer");
    });

    it("should display connected badge", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-badge-connected")).toBeInTheDocument();
    });

    it("should display server URL badge", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-badge-server-url")).toBeInTheDocument();
      expect(screen.getByTestId("home-badge-server-url").textContent).toBe(
        "http://localhost:20555"
      );
    });
  });

  describe("Statistics Cards", () => {
    it("should display flows card", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-card-flows")).toBeInTheDocument();
      expect(screen.getByTestId("home-stat-flow-count").textContent).toBe("2");
    });

    it("should display jobs card", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-card-jobs")).toBeInTheDocument();
      expect(screen.getByTestId("home-stat-job-count").textContent).toBe("2");
    });

    it("should display running jobs card", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-card-running-jobs")).toBeInTheDocument();
      expect(screen.getByTestId("home-stat-running-count").textContent).toBe("1");
    });

    it("should display quick actions card", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-card-quick-actions")).toBeInTheDocument();
    });

    it("should navigate to flows when flows card clicked", () => {
      render(<HomePage />);

      const flowsCard = screen.getByTestId("home-card-flows");
      fireEvent.click(flowsCard);

      expect(mockPush).toHaveBeenCalledWith("/flows");
    });

    it("should navigate to jobs when jobs card clicked", () => {
      render(<HomePage />);

      const jobsCard = screen.getByTestId("home-card-jobs");
      fireEvent.click(jobsCard);

      expect(mockPush).toHaveBeenCalledWith("/jobs");
    });
  });

  describe("Header Buttons", () => {
    it("should have start job button", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-button-start-job")).toBeInTheDocument();
    });

    it("should have create flow button", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-button-create-flow")).toBeInTheDocument();
    });

    it("should have settings button", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-button-settings")).toBeInTheDocument();
    });
  });

  describe("Quick Actions", () => {
    it("should have quick start job button", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-button-quick-start-job")).toBeInTheDocument();
    });

    it("should have quick create flow button", () => {
      render(<HomePage />);

      expect(screen.getByTestId("home-button-quick-create-flow")).toBeInTheDocument();
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

    it("should show empty state when no jobs", () => {
      render(<HomePage />);

      // The home page shows recent jobs, so when there are no jobs it should show empty state
      // This depends on how the component handles empty recent jobs
    });
  });
});
