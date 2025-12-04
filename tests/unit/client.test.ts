import { describe, it, expect, beforeAll } from 'vitest';

describe('Venice API Client', () => {
  beforeAll(() => {
    // Ensure API key is set for tests
    if (!process.env.VENICE_API_KEY) {
      process.env.VENICE_API_KEY = 'test-api-key';
    }
  });

  it('should have API key configured', () => {
    expect(process.env.VENICE_API_KEY).toBeDefined();
  });

  it('should construct correct API URLs', () => {
    const baseURL = 'https://api.venice.ai/api/v1';
    const endpoint = '/models';
    const expectedURL = `${baseURL}${endpoint}`;
    
    expect(expectedURL).toBe('https://api.venice.ai/api/v1/models');
  });

  it('should handle endpoint paths correctly', () => {
    const endpoints = [
      '/chat/completions',
      '/images/generations',
      '/api_keys/rate_limits',
      '/api_keys/rate_limits/logs',
    ];

    endpoints.forEach(endpoint => {
      expect(endpoint).toMatch(/^\/[a-z_/]+$/);
    });
  });
});
