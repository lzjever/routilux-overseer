import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreakpointStore } from '@/lib/stores/breakpointStore';
import { configureAPI, resetAPI } from '@/lib/services/api-client';
import { queryService } from '@/lib/services/query-service';

// Mock queryService
vi.mock('@/lib/services/query-service', () => ({
  queryService: {
    breakpoints: {
      list: vi.fn((jobId: string) => Promise.resolve({
        breakpoints: [
          { breakpoint_id: 'bp1', routine_id: 'routine1', enabled: true },
          { breakpoint_id: 'bp2', routine_id: 'routine2', enabled: false },
        ],
      })),
      create: vi.fn((jobId: string, request: any) => Promise.resolve({
        breakpoint_id: 'bp3',
        routine_id: request.routine_id,
        enabled: true,
      })),
      delete: vi.fn(() => Promise.resolve()),
    },
    workers: {
      updateBreakpoint: vi.fn(() => Promise.resolve()),
    },
  },
}));

// Mock handleError
vi.mock('@/lib/errors', () => ({
  handleError: vi.fn((error: Error, context: string) => {
    console.error(`[${context}]`, error.message);
  }),
}));

describe('useBreakpointStore', () => {
  beforeEach(() => {
    resetAPI();
    configureAPI('http://localhost:8000');
    vi.clearAllMocks();
    // Reset the store state
    const { result } = renderHook(() => useBreakpointStore());
    act(() => {
      result.current.clearBreakpoints();
    });
  });

  describe('loadBreakpoints', () => {
    it('should load breakpoints for a job', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      const breakpoints = result.current.breakpoints.get('job1');
      expect(breakpoints).toBeDefined();
      expect(breakpoints).toHaveLength(2);
      expect(breakpoints?.[0].breakpoint_id).toBe('bp1');
      expect(breakpoints?.[1].breakpoint_id).toBe('bp2');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during load', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      act(() => {
        result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle API errors', async () => {
      vi.mocked(queryService.breakpoints.list).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBreakpointStore());

      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('addBreakpoint', () => {
    it('should add a breakpoint', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      const request = {
        routine_id: 'routine3',
        condition: null,
      };

      await act(async () => {
        await result.current.addBreakpoint('job1', request, 'http://localhost:8000');
      });

      const breakpoints = result.current.breakpoints.get('job1');
      expect(breakpoints).toBeDefined();
      expect(breakpoints).toHaveLength(1);
      expect(breakpoints?.[0].breakpoint_id).toBe('bp3');
    });

    it('should handle creation errors', async () => {
      vi.mocked(queryService.breakpoints.create).mockRejectedValueOnce(
        new Error('Invalid routine')
      );

      const { result } = renderHook(() => useBreakpointStore());

      await expect(async () => {
        await act(async () => {
          await result.current.addBreakpoint(
            'job1',
            { routine_id: 'invalid', condition: null },
            'http://localhost:8000'
          );
        });
      }).rejects.toThrow();
    });
  });

  describe('removeBreakpoint', () => {
    it('should remove a breakpoint', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      // First load breakpoints
      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      expect(result.current.breakpoints.get('job1')).toHaveLength(2);

      // Remove one
      await act(async () => {
        await result.current.removeBreakpoint('job1', 'bp1', 'http://localhost:8000');
      });

      const breakpoints = result.current.breakpoints.get('job1');
      expect(breakpoints).toHaveLength(1);
      expect(breakpoints?.[0].breakpoint_id).toBe('bp2');
    });

    it('should handle removal errors', async () => {
      vi.mocked(queryService.breakpoints.delete).mockRejectedValueOnce(
        new Error('Breakpoint not found')
      );

      const { result } = renderHook(() => useBreakpointStore());

      await act(async () => {
        await result.current.removeBreakpoint('job1', 'bp999', 'http://localhost:8000');
      });

      // Error should be handled
      expect(result.current.error).toBeDefined();
    });
  });

  describe('toggleBreakpoint', () => {
    it('should toggle breakpoint enabled state', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      // First load breakpoints
      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      const bpBefore = result.current.breakpoints.get('job1')?.[0];
      expect(bpBefore?.enabled).toBe(true);

      // Toggle
      await act(async () => {
        await result.current.toggleBreakpoint('job1', 'bp1', 'worker1', 'http://localhost:8000');
      });

      const bpAfter = result.current.breakpoints.get('job1')?.[0];
      expect(bpAfter?.enabled).toBe(false);
    });

    it('should do nothing if breakpoint not found', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      const countBefore = result.current.breakpoints.get('job1')?.length;

      await act(async () => {
        await result.current.toggleBreakpoint('job1', 'non-existent', 'worker1', 'http://localhost:8000');
      });

      const countAfter = result.current.breakpoints.get('job1')?.length;
      expect(countAfter).toBe(countBefore);
    });

    it('should handle toggle errors', async () => {
      vi.mocked(queryService.workers.updateBreakpoint).mockRejectedValueOnce(
        new Error('Failed to toggle')
      );

      const { result } = renderHook(() => useBreakpointStore());

      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      await act(async () => {
        await result.current.toggleBreakpoint('job1', 'bp1', 'worker1', 'http://localhost:8000');
      });

      // Error should be handled
      expect(result.current.error).toBeDefined();
    });
  });

  describe('clearBreakpoints', () => {
    it('should clear all breakpoints', async () => {
      const { result } = renderHook(() => useBreakpointStore());

      // First load breakpoints
      await act(async () => {
        await result.current.loadBreakpoints('job1', 'http://localhost:8000');
      });

      expect(result.current.breakpoints.size).toBe(1);

      // Clear
      act(() => {
        result.current.clearBreakpoints();
      });

      expect(result.current.breakpoints.size).toBe(0);
    });
  });
});
