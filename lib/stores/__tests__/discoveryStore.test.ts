import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDiscoveryStore } from "../discoveryStore";
import { getAPI } from "@/lib/services/api-client";

const mockDiscovery = {
  discoverFlows: vi.fn(() => Promise.resolve({ flows: [] })),
  syncFlows: vi.fn(() => Promise.resolve({ flows: [] })),
  discoverJobs: vi.fn(() => Promise.resolve({ jobs: [] })),
  syncJobs: vi.fn(() => Promise.resolve({ jobs: [] })),
  syncWorkers: vi.fn(() => Promise.resolve({ workers: [] })),
};

vi.mock("@/lib/services/api-client", () => ({
  getAPI: vi.fn(() => ({
    discovery: mockDiscovery,
  })),
}));

describe("discoveryStore", () => {
  beforeEach(() => {
    useDiscoveryStore.setState({
      discoveredFlows: [],
      discoveredJobs: [],
      discoveredWorkers: [],
      syncingFlows: false,
      syncingJobs: false,
      syncingWorkers: false,
      lastFlowSync: null,
      lastJobSync: null,
      lastWorkerSync: null,
      autoSync: false,
    });
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const state = useDiscoveryStore.getState();
    expect(state.discoveredFlows).toEqual([]);
    expect(state.discoveredJobs).toEqual([]);
    expect(state.syncingFlows).toBe(false);
    expect(state.syncingJobs).toBe(false);
  });

  it("should sync flows", async () => {
    const mockFlows = [{ flow_id: "flow-1" }];
    vi.mocked(getAPI).mockReturnValue({
      discovery: { syncFlows: vi.fn(() => Promise.resolve({ flows: mockFlows })) },
    } as any);

    await useDiscoveryStore.getState().syncFlows();

    const state = useDiscoveryStore.getState();
    expect(state.lastFlowSync).toBeInstanceOf(Date);
    expect(state.syncingFlows).toBe(false);
  });

  it("should sync jobs", async () => {
    const mockJobs = [{ job_id: "job-1" }];
    vi.mocked(getAPI).mockReturnValue({
      discovery: { syncJobs: vi.fn(() => Promise.resolve({ jobs: mockJobs })) },
    } as any);

    await useDiscoveryStore.getState().syncJobs();

    const state = useDiscoveryStore.getState();
    expect(state.lastJobSync).toBeInstanceOf(Date);
    expect(state.syncingJobs).toBe(false);
  });

  it("should handle sync errors by throwing", async () => {
    vi.mocked(getAPI).mockReturnValue({
      discovery: { syncFlows: vi.fn(() => Promise.reject(new Error("Sync failed"))) },
    } as any);

    await expect(useDiscoveryStore.getState().syncFlows()).rejects.toThrow("Sync failed");

    const state = useDiscoveryStore.getState();
    expect(state.syncingFlows).toBe(false);
  });

  it("should discover workers", async () => {
    const mockWorkers = [{ worker_id: "worker-1" }];
    vi.mocked(getAPI).mockReturnValue({
      discovery: { syncWorkers: vi.fn(() => Promise.resolve({ workers: mockWorkers })) },
    } as any);

    await useDiscoveryStore.getState().syncWorkers();

    const state = useDiscoveryStore.getState();
    expect(state.lastWorkerSync).toBeInstanceOf(Date);
    expect(state.syncingWorkers).toBe(false);
  });

  it("should clear all discovery state", () => {
    const state = useDiscoveryStore.getState();
    state.clear();

    const clearedState = useDiscoveryStore.getState();
    expect(clearedState.discoveredFlows).toEqual([]);
    expect(clearedState.discoveredJobs).toEqual([]);
    expect(clearedState.lastFlowSync).toBeNull();
    expect(clearedState.lastJobSync).toBeNull();
  });
});
