import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkersStore } from '@/lib/stores/workersStore';
import { configureAPI, resetAPI } from '@/lib/services/api-client';
import { queryService } from '@/lib/services/query-service';

// Mock queryService
vi.mock('@/lib/services/query-service', () => ({
  queryService: {
    workers: {
      list: vi.fn(() => Promise.resolve([
        { worker_id: '1', flow_id: 'flow1', status: 'running' },
        { worker_id: '2', flow_id: 'flow1', status: 'idle' },
      ])),
      get: vi.fn((id: string) => Promise.resolve({
        worker_id: id,
        flow_id: 'flow1',
        status: 'running',
      })),
      create: vi.fn((request: any) => Promise.resolve({
        worker_id: 'new-worker',
        flow_id: request.flow_id,
        status: 'idle',
      })),
      stop: vi.fn(() => Promise.resolve()),
      pause: vi.fn((id: string) => Promise.resolve({
        worker_id: id,
        status: 'paused',
      })),
      resume: vi.fn((id: string) => Promise.resolve({
        worker_id: id,
        status: 'running',
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

describe('useWorkersStore', () => {
  beforeEach(() => {
    resetAPI();
    configureAPI('http://localhost:8000');
    vi.clearAllMocks();
  });

  describe('loadWorkers', () => {
    it('should load workers successfully', async () => {
      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.loadWorkers('http://localhost:8000');
      });

      expect(result.current.workers.size).toBe(2);
      expect(result.current.workers.get('1')?.status).toBe('running');
      expect(result.current.workers.get('2')?.status).toBe('idle');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should filter workers by flowId', async () => {
      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.loadWorkers('http://localhost:8000', 'flow1');
      });

      expect(vi.mocked(queryService.workers.list)).toHaveBeenCalledWith({
        flowId: 'flow1',
        status: undefined,
      });
    });

    it('should filter workers by status', async () => {
      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.loadWorkers('http://localhost:8000', null, 'running');
      });

      expect(vi.mocked(queryService.workers.list)).toHaveBeenCalledWith({
        flowId: undefined,
        status: 'running',
      });
    });

    it('should set loading state during load', async () => {
      const { result } = renderHook(() => useWorkersStore());

      act(() => {
        result.current.loadWorkers('http://localhost:8000');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle API errors', async () => {
      vi.mocked(queryService.workers.list).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.loadWorkers('http://localhost:8000');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('loadWorker', () => {
    it('should load a single worker', async () => {
      const { result } = renderHook(() => useWorkersStore());

      const worker = await act(async () => {
        return await result.current.loadWorker('1', 'http://localhost:8000');
      });

      expect(worker).toBeDefined();
      expect(worker?.worker_id).toBe('1');
      expect(result.current.workers.get('1')).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    it('should handle missing worker', async () => {
      vi.mocked(queryService.workers.get).mockRejectedValueOnce(
        new Error('Worker not found')
      );

      const { result } = renderHook(() => useWorkersStore());

      await expect(async () => {
        await act(async () => {
          await result.current.loadWorker('999', 'http://localhost:8000');
        });
      }).rejects.toThrow();
    });
  });

  describe('createWorker', () => {
    it('should create a new worker', async () => {
      const { result } = renderHook(() => useWorkersStore());

      const request = {
        flow_id: 'flow1',
        config: {},
      };

      const worker = await act(async () => {
        return await result.current.createWorker(request, 'http://localhost:8000');
      });

      expect(worker).toBeDefined();
      expect(worker?.worker_id).toBe('new-worker');
      expect(result.current.workers.get('new-worker')).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    it('should handle creation errors', async () => {
      vi.mocked(queryService.workers.create).mockRejectedValueOnce(
        new Error('Invalid flow')
      );

      const { result } = renderHook(() => useWorkersStore());

      await expect(async () => {
        await act(async () => {
          await result.current.createWorker(
            { flow_id: 'invalid', config: {} },
            'http://localhost:8000'
          );
        });
      }).rejects.toThrow();
    });
  });

  describe('stopWorker', () => {
    it('should stop a worker', async () => {
      const { result } = renderHook(() => useWorkersStore());

      // First load workers
      await act(async () => {
        await result.current.loadWorkers('http://localhost:8000');
      });

      expect(result.current.workers.get('1')).toBeDefined();

      // Stop worker
      await act(async () => {
        await result.current.stopWorker('1', 'http://localhost:8000');
      });

      expect(result.current.workers.get('1')).toBeUndefined();
    });

    it('should handle stop errors', async () => {
      vi.mocked(queryService.workers.stop).mockRejectedValueOnce(
        new Error('Worker already stopped')
      );

      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.stopWorker('1', 'http://localhost:8000');
      });

      // Error should be handled
      expect(result.current.error).toBeDefined();
    });
  });

  describe('pauseWorker', () => {
    it('should pause a worker', async () => {
      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.pauseWorker('1', 'http://localhost:8000');
      });

      expect(result.current.workers.get('1')?.status).toBe('paused');
    });

    it('should handle pause errors', async () => {
      vi.mocked(queryService.workers.pause).mockRejectedValueOnce(
        new Error('Cannot pause worker')
      );

      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.pauseWorker('1', 'http://localhost:8000');
      });

      // Error should be handled
      expect(result.current.error).toBeDefined();
    });
  });

  describe('resumeWorker', () => {
    it('should resume a worker', async () => {
      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.resumeWorker('1', 'http://localhost:8000');
      });

      expect(result.current.workers.get('1')?.status).toBe('running');
    });

    it('should handle resume errors', async () => {
      vi.mocked(queryService.workers.resume).mockRejectedValueOnce(
        new Error('Cannot resume worker')
      );

      const { result } = renderHook(() => useWorkersStore());

      await act(async () => {
        await result.current.resumeWorker('1', 'http://localhost:8000');
      });

      // Error should be handled
      expect(result.current.error).toBeDefined();
    });
  });
});
