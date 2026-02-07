import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobStore } from '@/lib/stores/jobStore';
import { configureAPI, resetAPI } from '@/lib/services/api-client';
import { queryService } from '@/lib/services/query-service';

// Mock queryService
vi.mock('@/lib/services/query-service', () => ({
  queryService: {
    jobs: {
      list: vi.fn(() => Promise.resolve([
        { job_id: '1', flow_id: 'flow1', status: 'pending' },
        { job_id: '2', flow_id: 'flow1', status: 'running' },
      ])),
      get: vi.fn((id: string) => Promise.resolve({
        job_id: id,
        flow_id: 'flow1',
        status: 'completed',
      })),
      submit: vi.fn((request: any) => Promise.resolve({
        job_id: 'new-job',
        flow_id: request.flow_id,
        status: 'pending',
      })),
      getMonitoringData: vi.fn((id: string) => Promise.resolve({
        job_id: id,
        routines: [],
      })),
      getMetrics: vi.fn((id: string) => Promise.resolve({
        job_id: id,
        total_duration_ms: 1000,
      })),
    },
  },
}));

// Mock handleError
vi.mock('@/lib/errors', () => ({
  handleError: vi.fn((error: Error, context: string) => {
    console.error(`[${context}]`, error.message);
  }),
}));

// Mock WebSocketManager
vi.mock('@/lib/websocket/websocket-manager', () => ({
  getWebSocketManager: vi.fn(() => ({
    isConnected: vi.fn(() => false),
    connect: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
  })),
  disposeWebSocketManager: vi.fn(),
}));

describe('useJobStore', () => {
  beforeEach(() => {
    resetAPI();
    configureAPI('http://localhost:8000');
    vi.clearAllMocks();
  });

  describe('loadJobs', () => {
    it('should load jobs successfully', async () => {
      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobs('http://localhost:8000');
      });

      expect(result.current.jobs.size).toBe(2);
      expect(result.current.jobs.get('1')?.status).toBe('pending');
      expect(result.current.jobs.get('2')?.status).toBe('running');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should filter jobs by workerId', async () => {
      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobs('http://localhost:8000', 'worker1');
      });

      expect(vi.mocked(queryService.jobs.list)).toHaveBeenCalledWith({
        workerId: 'worker1',
      });
    });

    it('should set loading state during load', async () => {
      const { result } = renderHook(() => useJobStore());

      act(() => {
        result.current.loadJobs('http://localhost:8000');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle API errors', async () => {
      vi.mocked(queryService.jobs.list).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobs('http://localhost:8000');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('loadJob', () => {
    it('should load a single job', async () => {
      const { result } = renderHook(() => useJobStore());

      const job = await act(async () => {
        return await result.current.loadJob('1', 'http://localhost:8000');
      });

      expect(job).toBeDefined();
      expect(job?.job_id).toBe('1');
      expect(result.current.jobs.get('1')).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    it('should handle missing job', async () => {
      vi.mocked(queryService.jobs.get).mockRejectedValueOnce(
        new Error('Job not found')
      );

      const { result } = renderHook(() => useJobStore());

      await expect(async () => {
        await act(async () => {
          await result.current.loadJob('999', 'http://localhost:8000');
        });
      }).rejects.toThrow();
    });
  });

  describe('submitJob', () => {
    it('should submit a new job', async () => {
      const { result } = renderHook(() => useJobStore());

      const request = {
        flow_id: 'flow1',
        input_data: {},
      };

      const job = await act(async () => {
        return await result.current.submitJob(request, 'http://localhost:8000');
      });

      expect(job).toBeDefined();
      expect(job?.job_id).toBe('new-job');
      expect(result.current.jobs.get('new-job')).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    it('should handle submission errors', async () => {
      vi.mocked(queryService.jobs.submit).mockRejectedValueOnce(
        new Error('Invalid flow')
      );

      const { result } = renderHook(() => useJobStore());

      await expect(async () => {
        await act(async () => {
          await result.current.submitJob(
            { flow_id: 'invalid', input_data: {} },
            'http://localhost:8000'
          );
        });
      }).rejects.toThrow();
    });
  });

  describe('loadJobMonitoringData', () => {
    it('should load monitoring data', async () => {
      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobMonitoringData('1', 'http://localhost:8000');
      });

      expect(result.current.monitoringData.get('1')).toBeDefined();
    });

    it('should handle monitoring data errors', async () => {
      const mockGetMonitoringData = vi.mocked(queryService.jobs.getMonitoringData);
      mockGetMonitoringData.mockRejectedValueOnce(
        new Error('Monitoring data not available')
      );

      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobMonitoringData('2', 'http://localhost:8000');
      });

      // Error should be handled silently - no data should be set for job 2
      expect(result.current.monitoringData.get('2')).toBeUndefined();
      // Job 1 should still exist from previous test
      expect(result.current.monitoringData.get('1')).toBeDefined();
    });
  });

  describe('loadJobMetrics', () => {
    it('should load job metrics', async () => {
      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobMetrics('1', 'http://localhost:8000');
      });

      expect(result.current.metricsData.get('1')).toBeDefined();
      expect(result.current.metricsData.get('1')?.total_duration_ms).toBe(1000);
    });

    it('should handle metrics errors', async () => {
      const mockGetMetrics = vi.mocked(queryService.jobs.getMetrics);
      mockGetMetrics.mockRejectedValueOnce(
        new Error('Metrics not available')
      );

      const { result } = renderHook(() => useJobStore());

      await act(async () => {
        await result.current.loadJobMetrics('2', 'http://localhost:8000');
      });

      // Error should be handled silently - no data should be set for job 2
      expect(result.current.metricsData.get('2')).toBeUndefined();
      // Job 1 should still exist from previous test
      expect(result.current.metricsData.get('1')).toBeDefined();
    });
  });

  describe('setJobs', () => {
    it('should set jobs from array', () => {
      const { result } = renderHook(() => useJobStore());

      const jobs = [
        { job_id: '1', flow_id: 'flow1', status: 'pending' },
        { job_id: '2', flow_id: 'flow1', status: 'running' },
      ] as any;

      act(() => {
        result.current.setJobs(jobs);
      });

      expect(result.current.jobs.size).toBe(2);
      expect(result.current.jobs.get('1')?.job_id).toBe('1');
    });
  });
});
