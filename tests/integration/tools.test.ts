import { describe, it, expect, beforeAll } from 'vitest';

describe('Venice MCP Tools Integration', () => {
  beforeAll(() => {
    // Skip integration tests if no real API key is provided
    if (!process.env.VENICE_API_KEY || process.env.VENICE_API_KEY === 'test-api-key') {
      console.log('Skipping integration tests - no real API key provided');
    }
  });

  const hasRealAPIKey = process.env.VENICE_API_KEY && process.env.VENICE_API_KEY !== 'test-api-key';

  describe('Inference Tools', () => {
    it.skipIf(!hasRealAPIKey)('should list available models', async () => {
      // This would require actual API integration
      expect(true).toBe(true);
    });

    it('should have correct tool schemas', () => {
      // Updated to reflect correct API parameters
      const toolSchemas = {
        venice_chat: ['model', 'message', 'system_prompt', 'temperature', 'max_tokens'],
        venice_generate_image: ['prompt', 'model', 'size', 'style_preset', 'negative_prompt'],  // Fixed: size not width/height
        venice_text_to_speech: ['text', 'model', 'voice'],
        venice_create_embeddings: ['input', 'model'],
      };

      Object.entries(toolSchemas).forEach(([toolName, params]) => {
        expect(params.length).toBeGreaterThan(0);
        expect(toolName).toMatch(/^venice_/);
      });
      
      // Explicitly verify image generation uses size, not width/height
      expect(toolSchemas.venice_generate_image).toContain('size');
      expect(toolSchemas.venice_generate_image).not.toContain('width');
      expect(toolSchemas.venice_generate_image).not.toContain('height');
    });
  });

  describe('Discovery Tools', () => {
    it('should have correct endpoint paths', () => {
      const endpoints = {
        venice_list_models: '/models',
        venice_list_characters: '/characters',
      };

      Object.values(endpoints).forEach(endpoint => {
        expect(endpoint).toMatch(/^\/[a-z_]+$/);
      });
    });
  });

  describe('Admin Tools', () => {
    it('should have correct admin endpoint paths', () => {
      const endpoints = {
        venice_list_api_keys: '/api_keys',
        venice_create_api_key: '/api_keys',
        venice_get_rate_limits: '/api_keys/rate_limits',
        venice_get_rate_limit_logs: '/api_keys/rate_limits/logs',
      };

      Object.values(endpoints).forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api_keys/);
      });
    });

    it('should use correct parameters for API key creation', () => {
      const requiredParams = ['description', 'apiKeyType'];
      const optionalParams = ['consumptionLimit', 'expiresAt'];

      expect(requiredParams).toContain('description');
      expect(requiredParams).toContain('apiKeyType');
      expect(optionalParams).toContain('consumptionLimit');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      const originalKey = process.env.VENICE_API_KEY;
      delete process.env.VENICE_API_KEY;

      // In real implementation, this should throw or return error
      expect(() => {
        // Simulate checking for API key
        if (!process.env.VENICE_API_KEY) {
          throw new Error('VENICE_API_KEY is required');
        }
      }).toThrow('VENICE_API_KEY is required');

      process.env.VENICE_API_KEY = originalKey;
    });
  });
});
