import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryService } from '@/lib/services/query-service';
import { configureAPI, resetAPI } from '@/lib/services/api-client';

describe('QueryService', () => {
  let queryService: QueryService;
  let fetchFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset API client
    resetAPI();
    configureAPI('http://localhost:8000', 'test-key');

    // Create fresh QueryService instance for each test
    queryService = new QueryService();

    // Mock fetch function
    fetchFn = vi.fn();
  });

  describe('query', () => {
    it('should cache by default', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // First call
      const result1 = await queryService.query('test-key', fetchFn);
      expect(result1).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await queryService.query('test-key', fetchFn);
      expect(result2).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1); // Still 1, cache was used
    });

    it('should not cache when disabled', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // First call with disabled cache
      const result1 = await queryService.query('test-key', fetchFn, { enabled: false });
      expect(result1).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Second call should also fetch
      const result2 = await queryService.query('test-key', fetchFn, { enabled: false });
      expect(result2).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(2); // Called twice
    });

    it('should deduplicate concurrent requests', async () => {
      let resolveCount = 0;
      let resolvePromise: (value: unknown) => void;

      fetchFn.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveCount++;
          if (resolveCount === 1) {
            // Store resolver for first call
            resolvePromise = resolve;
          }
          // Second call will be deduplicated
        });
      });

      // Start both requests concurrently
      const promise1 = queryService.query('test-key', fetchFn);
      const promise2 = queryService.query('test-key', fetchFn);

      // Resolve the first request
      resolvePromise!({ data: 'test' });

      await promise1;
      await promise2;

      // Should only call fetchFn once due to deduplication
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should respect cacheTTL', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // First call
      const result1 = await queryService.query('test-key', fetchFn, { cacheTTL: 100 });
      expect(result1).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Second call immediately - should use cache
      const result2 = await queryService.query('test-key', fetchFn, { cacheTTL: 100 });
      expect(result2).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Third call after expiry - should fetch again
      const result3 = await queryService.query('test-key', fetchFn, { cacheTTL: 100 });
      expect(result3).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should apply transform function', async () => {
      fetchFn.mockResolvedValue({ value: 1 });

      const transform = (data: { value: number }) => ({ value: data.value * 2 });

      const result = await queryService.query('test-key', fetchFn, { transform });
      expect(result).toEqual({ value: 2 });
    });
  });

  describe('invalidate', () => {
    it('should invalidate specific cache entry', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // First call
      const result1 = await queryService.query('test-key', fetchFn);
      expect(result1).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Invalidate cache
      queryService.invalidate('test-key');

      // Second call should fetch again
      const result2 = await queryService.query('test-key', fetchFn);
      expect(result2).toEqual({ data: 'test' });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache when no key provided', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // Cache multiple entries
      await queryService.query('key1', fetchFn);
      await queryService.query('key2', fetchFn);
      await queryService.query('key3', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(queryService.getCacheSize()).toBe(3);

      // Clear all cache
      queryService.invalidate();

      expect(queryService.getCacheSize()).toBe(0);

      // All entries should be refetched
      await queryService.query('key1', fetchFn);
      await queryService.query('key2', fetchFn);
      await queryService.query('key3', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(6); // 3 initial + 3 after clear
    });
  });

  describe('configure', () => {
    it('should update configuration', () => {
      queryService.configure({ cacheTTL: 10000, enabled: false });

      const config = queryService.getConfig();
      expect(config.cacheTTL).toBe(10000);
      expect(config.enabled).toBe(false);
    });

    it('should partially update configuration', () => {
      queryService.configure({ cacheTTL: 10000 });

      const config = queryService.getConfig();
      expect(config.cacheTTL).toBe(10000);
      expect(config.enabled).toBe(true); // Default value preserved
    });
  });

  describe('clearCache', () => {
    it('should clear all cache', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      // Cache some entries
      await queryService.query('key1', fetchFn);
      await queryService.query('key2', fetchFn);

      expect(queryService.getCacheSize()).toBe(2);

      // Clear cache
      queryService.clearCache();

      expect(queryService.getCacheSize()).toBe(0);
    });
  });

  describe('getCacheSize', () => {
    it('should return cache size', async () => {
      fetchFn.mockResolvedValue({ data: 'test' });

      expect(queryService.getCacheSize()).toBe(0);

      await queryService.query('key1', fetchFn);
      expect(queryService.getCacheSize()).toBe(1);

      await queryService.query('key2', fetchFn);
      expect(queryService.getCacheSize()).toBe(2);
    });
  });

  describe('flows methods', () => {
    it('should call listFlows with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.flows, 'list').mockResolvedValue({ flows: [] });

      await queryService.listFlows();

      expect(api.flows.list).toHaveBeenCalledTimes(1);
    });

    it('should call getFlow with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.flows, 'get').mockResolvedValue({ id: 'flow-1' });

      await queryService.getFlow('flow-1');

      expect(api.flows.get).toHaveBeenCalledWith('flow-1');
    });

    it('should call getFlowMetrics with shorter cache TTL', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.flows, 'getMetrics').mockResolvedValue({ metrics: {} });

      await queryService.getFlowMetrics('flow-1');

      expect(api.flows.getMetrics).toHaveBeenCalledWith('flow-1');
    });
  });

  describe('jobs methods', () => {
    it('should call listJobs with filters', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.jobs, 'list').mockResolvedValue({ jobs: [] });

      await queryService.listJobs({ status: 'running', flowId: 'flow-1' });

      expect(api.jobs.list).toHaveBeenCalledWith(null, 'flow-1', 'running');
    });

    it('should call getJob with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.jobs, 'get').mockResolvedValue({ id: 'job-1' });

      await queryService.getJob('job-1');

      expect(api.jobs.get).toHaveBeenCalledWith('job-1');
    });

    it('should call getJobMonitoringData with shorter cache TTL', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.jobs, 'getMonitoringData').mockResolvedValue({ monitoring: {} });

      await queryService.getJobMonitoringData('job-1');

      expect(api.jobs.getMonitoringData).toHaveBeenCalledWith('job-1');
    });
  });

  describe('workers methods', () => {
    it('should call listWorkers with filters', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.workers, 'list').mockResolvedValue({ workers: [] });

      await queryService.listWorkers({ status: 'active' });

      expect(api.workers.list).toHaveBeenCalledWith(null, 'active');
    });

    it('should call getWorker with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.workers, 'get').mockResolvedValue({ id: 'worker-1' });

      await queryService.getWorker('worker-1');

      expect(api.workers.get).toHaveBeenCalledWith('worker-1');
    });
  });

  describe('runtimes methods', () => {
    it('should call listRuntimes with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.runtimes, 'list').mockResolvedValue({ runtimes: [] });

      await queryService.listRuntimes();

      expect(api.runtimes.list).toHaveBeenCalledTimes(1);
    });

    it('should call getRuntime with caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.runtimes, 'get').mockResolvedValue({ id: 'runtime-1' });

      await queryService.getRuntime('runtime-1');

      expect(api.runtimes.get).toHaveBeenCalledWith('runtime-1');
    });
  });

  describe('discovery methods', () => {
    it('should call syncFlows without caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.discovery, 'syncFlows').mockResolvedValue({ synced: 5 });

      // Call twice
      await queryService.syncFlows();
      await queryService.syncFlows();

      // Should be called twice (no caching)
      expect(api.discovery.syncFlows).toHaveBeenCalledTimes(2);
    });

    it('should call syncJobs without caching', async () => {
      const api = await import('@/lib/services/api-client').then((m) => m.getAPI());
      vi.spyOn(api.discovery, 'syncJobs').mockResolvedValue({ synced: 3 });

      // Call twice
      await queryService.syncJobs();
      await queryService.syncJobs();

      // Should be called twice (no caching)
      expect(api.discovery.syncJobs).toHaveBeenCalledTimes(2);
    });
  });
});
