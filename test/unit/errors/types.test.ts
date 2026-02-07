import { describe, it, expect } from 'vitest';
import { AppError, NetworkError, APIError, ConnectionError, ValidationError, AuthenticationError } from '@/lib/errors/types';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create base error', () => {
      const error = new AppError('Test error', 'TEST_CODE', 500);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });
  });

  describe('NetworkError', () => {
    it('should create network error with default message', () => {
      const error = new NetworkError();
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe('Network error occurred');
    });

    it('should create network error with custom message', () => {
      const error = new NetworkError('Custom network error');
      expect(error.message).toBe('Custom network error');
    });
  });

  describe('APIError', () => {
    it('should create API error with status code', () => {
      const error = new APIError('Not found', 404);
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConnectionError', () => {
    it('should create connection error', () => {
      const error = new ConnectionError();
      expect(error.code).toBe('CONNECTION_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error', () => {
      const error = new AuthenticationError();
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });
});
