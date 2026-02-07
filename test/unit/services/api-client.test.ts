import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { configureAPI, resetAPI, apiClient } from '@/lib/services/api-client';
import { OpenAPI } from '@/lib/api/generated';

describe('APIClient', () => {
  beforeEach(() => {
    resetAPI();
  });

  afterEach(() => {
    resetAPI();
  });

  describe('configure', () => {
    it('should configure API with server URL', () => {
      const api = configureAPI('http://localhost:8000', 'test-key');

      expect(api).toBeDefined();
      expect(OpenAPI.BASE).toBe('http://localhost:8000');
    });

    it('should reuse existing API if configuration unchanged', () => {
      const api1 = configureAPI('http://localhost:8000', 'key1');
      const api2 = configureAPI('http://localhost:8000', 'key1');

      expect(api1).toBe(api2);
    });

    it('should create new API if server URL changes', () => {
      const api1 = configureAPI('http://localhost:8000', 'key1');
      const api2 = configureAPI('http://localhost:8001', 'key1');

      expect(api1).not.toBe(api2);
    });

    it('should set API key header', () => {
      configureAPI('http://localhost:8000', 'secret-key');

      expect(OpenAPI.HEADERS).toEqual({ 'X-API-Key': 'secret-key' });
    });
  });

  describe('getAPI', () => {
    it('should return API instance after configuration', () => {
      configureAPI('http://localhost:8000');
      const api = apiClient.getAPI();

      expect(api).toBeDefined();
    });

    it('should throw error if not configured', () => {
      resetAPI();

      expect(() => apiClient.getAPI()).toThrow('APIClient not configured');
    });
  });

  describe('reset', () => {
    it('should clear API instance', () => {
      configureAPI('http://localhost:8000');
      resetAPI();

      expect(() => apiClient.getAPI()).toThrow('APIClient not configured');
    });

    it('should clear OpenAPI configuration', () => {
      configureAPI('http://localhost:8000', 'key');
      resetAPI();

      expect(OpenAPI.BASE).toBe('');
      expect(OpenAPI.HEADERS).toBeUndefined();
    });
  });

  describe('getConnectionInfo', () => {
    it('should return connection info', () => {
      configureAPI('http://localhost:8000', 'key');
      const info = apiClient.getConnectionInfo();

      expect(info).toEqual({
        serverUrl: 'http://localhost:8000',
        apiKey: 'key',
      });
    });

    it('should return null when not configured', () => {
      resetAPI();
      const info = apiClient.getConnectionInfo();

      expect(info).toEqual({
        serverUrl: null,
        apiKey: null,
      });
    });
  });
});
