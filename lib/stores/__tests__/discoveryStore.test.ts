import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDiscoveryStore } from "../discoveryStore";
import { createAPI } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    discovery: {
      discoverFlows: vi.fn(() => Promise.resolve({ flows: [] })),
      syncFlows: vi.fn(() => Promise.resolve({ flows: [] })),
      discoverJobs: vi.fn(() => Promise.resolve({ jobs: [] })),
      syncJobs: vi.fn(() => Promise.resolve({ jobs: [] })),
    },
  })),
}));

describe("discoveryStore", () => {
  beforeEach(() => {
    useDiscoveryStore.setState({
      discoveredFlows: [],
      discoveredJobs: [],
      loadingFlows: false,
      loadingJobs: false,
      lastFlowSync: null,
      lastJobSync: null,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const state = useDiscoveryStore.getState();
    expect(state.discoveredFlows).toEqual([]);
    expect(state.discoveredJobs).toEqual([]);
    expect(state.loadingFlows).toBe(false);
    expect(state.loadingJobs).toBe(false);
  });

  it("should sync flows", async () => {
    const mockFlows = [{ flow_id: "flow-1" }];
    const mockAPI = {
      discovery: {
        syncFlows: vi.fn(() => Promise.resolve({ flows: mockFlows })),
      },
    };
    vi.mocked(createAPI).mockReturnValue(mockAPI as any);

    await useDiscoveryStore.getState().syncFlows("http://localhost:20555");

    const state = useDiscoveryStore.getState();
    expect(state.lastFlowSync).toBeInstanceOf(Date);
    expect(state.syncingFlows).toBe(false);
  });

  it("should sync jobs", async () => {
    const mockJobs = [{ job_id: "job-1" }];
    const mockAPI = {
      discovery: {
        syncJobs: vi.fn(() => Promise.resolve({ jobs: mockJobs })),
      },
    };
    vi.mocked(createAPI).mockReturnValue(mockAPI as any);

    await useDiscoveryStore.getState().syncJobs("http://localhost:20555");

    const state = useDiscoveryStore.getState();
    expect(state.lastJobSync).toBeInstanceOf(Date);
    expect(state.syncingJobs).toBe(false);
  });

  it("should handle sync errors", async () => {
    vi.mocked(createAPI).mockReturnValue({
      discovery: {
        syncFlows: vi.fn(() => Promise.reject(new Error("Sync failed"))),
      },
    } as any);

    await useDiscoveryStore.getState().syncFlows("http://localhost:20555");

    const state = useDiscoveryStore.getState();
    expect(state.error).toBe("Sync failed");
    expect(state.loadingFlows).toBe(false);
  });

  it("should handle errors", async () => {
    const mockAPI = {
      discovery: {
        syncFlows: vi.fn(() => Promise.reject(new Error("Sync failed"))),
      },
    };
    vi.mocked(createAPI).mockReturnValue(mockAPI as any);

    await expect(
      useDiscoveryStore.getState().syncFlows("http://localhost:20555")
    ).rejects.toThrow("Sync failed");

    const state = useDiscoveryStore.getState();
    expect(state.syncingFlows).toBe(false);
  });
});
