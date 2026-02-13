import { getAPI, type API } from "./api-client";
import type { FlowListResponse } from "@/lib/api/generated/models/FlowListResponse";
import type { FlowResponse } from "@/lib/api/generated/models/FlowResponse";
import type { JobListResponse } from "@/lib/api/generated/models/JobListResponse";
import type { JobResponse } from "@/lib/api/generated/models/JobResponse";
import type { WorkerListResponse } from "@/lib/api/generated/models/WorkerListResponse";
import type { WorkerResponse } from "@/lib/api/generated/models/WorkerResponse";
import type { RuntimeListResponse } from "@/lib/api/generated/models/RuntimeListResponse";
import type { RuntimeResponse } from "@/lib/api/generated/models/RuntimeResponse";
import type { BreakpointListResponse } from "@/lib/api/generated/models/BreakpointListResponse";
import type { BreakpointResponse } from "@/lib/api/generated/models/BreakpointResponse";

/**
 * Query cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Query options
 */
interface QueryOptions<T = unknown> {
  enabled?: boolean;
  cacheTTL?: number;
  transform?: (data: T) => T;
}

/**
 * Query service configuration
 */
interface QueryServiceConfig {
  cacheTTL: number;
  enabled: boolean;
  maxCacheSize: number; // Maximum number of cached entries
}

/**
 * Pending request for deduplication
 */
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * QueryService - Caching and deduplication for API calls
 */
class QueryService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, PendingRequest<unknown>>();
  private config: QueryServiceConfig = {
    cacheTTL: 30000,
    enabled: true,
    maxCacheSize: 100, // Default max cache size
  };

  // Domain wrappers (attached after instantiation)
  declare flows: {
    list: (options?: QueryOptions) => Promise<FlowListResponse>;
    get: (flowId: string, options?: QueryOptions) => Promise<FlowResponse>;
    getMetrics: (flowId: string, options?: QueryOptions) => Promise<any>;
  };
  declare jobs: {
    list: (
      filters?: { workerId?: string; flowId?: string; status?: string },
      options?: QueryOptions
    ) => Promise<JobListResponse>;
    get: (jobId: string, options?: QueryOptions) => Promise<JobResponse>;
    getMonitoringData: (jobId: string, options?: QueryOptions) => Promise<any>;
    getMetrics: (jobId: string, options?: QueryOptions) => Promise<any>;
    submit: (request: any, options?: QueryOptions) => Promise<any>;
  };
  declare workers: {
    list: (
      filters?: { flowId?: string; status?: string },
      options?: QueryOptions
    ) => Promise<WorkerListResponse>;
    get: (workerId: string, options?: QueryOptions) => Promise<WorkerResponse>;
    create: (request: any, options?: QueryOptions) => Promise<any>;
    stop: (workerId: string, options?: QueryOptions) => Promise<any>;
    pause: (workerId: string, options?: QueryOptions) => Promise<any>;
    resume: (workerId: string, options?: QueryOptions) => Promise<any>;
    updateBreakpoint: (workerId: string, breakpointId: string, enabled: boolean) => Promise<any>;
  };
  declare runtimes: {
    list: (options?: QueryOptions) => Promise<RuntimeListResponse>;
    get: (runtimeId: string, options?: QueryOptions) => Promise<RuntimeResponse>;
  };
  declare breakpoints: {
    list: (jobId: string, options?: QueryOptions) => Promise<BreakpointListResponse>;
    create: (jobId: string, request: any, options?: QueryOptions) => Promise<BreakpointResponse>;
    delete: (jobId: string, breakpointId: string, options?: QueryOptions) => Promise<any>;
  };

  /**
   * Execute a query with caching and deduplication
   */
  async query<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: QueryOptions<T> = {}
  ): Promise<T> {
    const { enabled = this.config.enabled, cacheTTL = this.config.cacheTTL, transform } = options;

    // If caching is disabled, just fetch
    if (!enabled) {
      const data = await fetchFn();
      return transform ? transform(data) : data;
    }

    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data as T;
    }

    // Check for pending request (deduplication)
    const pending = this.pendingRequests.get(key);
    if (pending && Date.now() - pending.timestamp < cacheTTL) {
      return pending.promise as Promise<T>;
    }

    // Create new request
    const promise = fetchFn()
      .then((data) => {
        const result = transform ? transform(data) : data;
        // Evict old entries if cache is full
        this.evictIfNeeded();
        this.cache.set(key, { data: result, timestamp: Date.now() });
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  /**
   * Evict oldest cache entries if cache size exceeds maxCacheSize
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest 20% of entries (LRU-style eviction)
      const entriesToDelete = Math.ceil(this.config.maxCacheSize * 0.2);
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      for (let i = 0; i < entriesToDelete && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Invalidate cache entries
   */
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  /**
   * Get API client
   */
  getAPI(): API {
    return getAPI();
  }

  // ==================== Flows ====================

  /**
   * List all flows
   */
  async listFlows(options?: QueryOptions): Promise<any> {
    return this.query("flows:list", () => this.getAPI().flows.list(), options);
  }

  /**
   * Get a specific flow
   */
  async getFlow(flowId: string, options?: QueryOptions): Promise<any> {
    return this.query(`flows:get:${flowId}`, () => this.getAPI().flows.get(flowId), options);
  }

  /**
   * Get flow metrics
   */
  async getFlowMetrics(flowId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `flows:metrics:${flowId}`,
      () => this.getAPI().flows.getMetrics(flowId),
      { ...options, cacheTTL: 5000 } // Shorter cache for metrics
    );
  }

  // ==================== Jobs ====================

  /**
   * List jobs with optional filters
   */
  async listJobs(
    filters?: { workerId?: string; flowId?: string; status?: string },
    options?: QueryOptions
  ): Promise<any> {
    const filterKey = filters
      ? `:${filters.workerId || ""}:${filters.flowId || ""}:${filters.status || ""}`
      : "";
    return this.query(
      `jobs:list${filterKey}`,
      () =>
        this.getAPI().jobs.list(
          filters?.workerId || null,
          filters?.flowId || null,
          filters?.status || null
        ),
      { ...options, cacheTTL: 5000 } // Shorter cache for lists
    );
  }

  /**
   * Get a specific job
   */
  async getJob(jobId: string, options?: QueryOptions): Promise<any> {
    return this.query(`jobs:get:${jobId}`, () => this.getAPI().jobs.get(jobId), options);
  }

  /**
   * Get job monitoring data
   */
  async getJobMonitoringData(jobId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `jobs:monitoring:${jobId}`,
      () => this.getAPI().jobs.getMonitoringData(jobId),
      { ...options, cacheTTL: 5000 } // Shorter cache for monitoring data
    );
  }

  /**
   * Get job metrics
   */
  async getJobMetrics(jobId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `jobs:metrics:${jobId}`,
      () => this.getAPI().jobs.getMetrics(jobId),
      { ...options, cacheTTL: 5000 } // Shorter cache for metrics
    );
  }

  /**
   * Submit a job
   */
  async submitJob(request: any, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().jobs.submit(request);
  }

  // ==================== Workers ====================

  /**
   * List workers with optional filters
   */
  async listWorkers(
    filters?: { flowId?: string; status?: string },
    options?: QueryOptions
  ): Promise<any> {
    const filterKey = filters ? `:${filters.flowId || ""}:${filters.status || ""}` : "";
    return this.query(
      `workers:list${filterKey}`,
      () => this.getAPI().workers.list(filters?.flowId || null, filters?.status || null),
      { ...options, cacheTTL: 5000 } // Shorter cache for lists
    );
  }

  /**
   * Get a specific worker
   */
  async getWorker(workerId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `workers:get:${workerId}`,
      () => this.getAPI().workers.get(workerId),
      options
    );
  }

  /**
   * Create a worker
   */
  async createWorker(request: any, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().workers.create(request);
  }

  /**
   * Stop a worker
   */
  async stopWorker(workerId: string, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().workers.stop(workerId);
  }

  /**
   * Pause a worker
   */
  async pauseWorker(workerId: string, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().workers.pause(workerId);
  }

  /**
   * Resume a worker
   */
  async resumeWorker(workerId: string, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().workers.resume(workerId);
  }

  // ==================== Runtimes ====================

  /**
   * List all runtimes
   */
  async listRuntimes(options?: QueryOptions): Promise<any> {
    return this.query("runtimes:list", () => this.getAPI().runtimes.list(), options);
  }

  /**
   * Get a specific runtime
   */
  async getRuntime(runtimeId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `runtimes:get:${runtimeId}`,
      () => this.getAPI().runtimes.get(runtimeId),
      options
    );
  }

  // ==================== Breakpoints ====================

  /**
   * List breakpoints for a job
   */
  async listBreakpoints(jobId: string, options?: QueryOptions): Promise<any> {
    return this.query(
      `breakpoints:list:${jobId}`,
      () => this.getAPI().breakpoints.list(jobId),
      options
    );
  }

  /**
   * Create a breakpoint
   */
  async createBreakpoint(jobId: string, request: any, options?: QueryOptions): Promise<any> {
    // Mutations are never cached
    return this.getAPI().breakpoints.create(jobId, request);
  }

  /**
   * Delete a breakpoint
   */
  async deleteBreakpoint(
    jobId: string,
    breakpointId: string,
    options?: QueryOptions
  ): Promise<any> {
    // Mutations are never cached
    return this.getAPI().breakpoints.delete(jobId, breakpointId);
  }

  // ==================== Discovery ====================

  /**
   * Sync flows from discovery
   */
  async syncFlows(): Promise<any> {
    // Discovery operations are never cached
    return this.getAPI().discovery.syncFlows();
  }

  /**
   * Sync jobs from discovery
   */
  async syncJobs(): Promise<any> {
    // Discovery operations are never cached
    return this.getAPI().discovery.syncJobs();
  }

  /**
   * Update configuration
   */
  configure(config: Partial<QueryServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): QueryServiceConfig {
    return { ...this.config };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.invalidate();
  }

  /**
   * Get cache size (for debugging)
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export global instance
export const queryService = new QueryService();

// Domain-specific API wrappers for cleaner calling syntax
export const flows = {
  list: (options?: QueryOptions) => queryService.listFlows(options),
  get: (flowId: string, options?: QueryOptions) => queryService.getFlow(flowId, options),
  getMetrics: (flowId: string, options?: QueryOptions) =>
    queryService.getFlowMetrics(flowId, options),
};

export const jobs = {
  list: (
    filters?: { workerId?: string; flowId?: string; status?: string },
    options?: QueryOptions
  ) => queryService.listJobs(filters, options),
  get: (jobId: string, options?: QueryOptions) => queryService.getJob(jobId, options),
  getMonitoringData: (jobId: string, options?: QueryOptions) =>
    queryService.getJobMonitoringData(jobId, options),
  getMetrics: (jobId: string, options?: QueryOptions) => queryService.getJobMetrics(jobId, options),
  submit: (request: any, options?: QueryOptions) => queryService.submitJob(request, options),
};

export const workers = {
  list: (filters?: { flowId?: string; status?: string }, options?: QueryOptions) =>
    queryService.listWorkers(filters, options),
  get: (workerId: string, options?: QueryOptions) => queryService.getWorker(workerId, options),
  create: (request: any, options?: QueryOptions) => queryService.createWorker(request, options),
  stop: (workerId: string, options?: QueryOptions) => queryService.stopWorker(workerId, options),
  pause: (workerId: string, options?: QueryOptions) => queryService.pauseWorker(workerId, options),
  resume: (workerId: string, options?: QueryOptions) =>
    queryService.resumeWorker(workerId, options),
  updateBreakpoint: (workerId: string, breakpointId: string, enabled: boolean) =>
    queryService.getAPI().workers.updateBreakpoint(workerId, breakpointId, enabled),
};

export const runtimes = {
  list: (options?: QueryOptions) => queryService.listRuntimes(options),
  get: (runtimeId: string, options?: QueryOptions) => queryService.getRuntime(runtimeId, options),
};

export const breakpoints = {
  list: (jobId: string, options?: QueryOptions) => queryService.listBreakpoints(jobId, options),
  create: (jobId: string, request: any, options?: QueryOptions) =>
    queryService.createBreakpoint(jobId, request, options),
  delete: (jobId: string, breakpointId: string, options?: QueryOptions) =>
    queryService.deleteBreakpoint(jobId, breakpointId, options),
};

// Attach domain wrappers to queryService instance
(queryService as any).flows = flows;
(queryService as any).jobs = jobs;
(queryService as any).workers = workers;
(queryService as any).runtimes = runtimes;
(queryService as any).breakpoints = breakpoints;

// Export class for testing
export { QueryService };
