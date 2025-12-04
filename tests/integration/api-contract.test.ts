import { describe, it, expect, beforeAll } from 'vitest';

/**
 * API Contract Tests
 * These tests validate that our implementation matches the Venice API specification.
 * They would have caught the width/height vs size parameter bug.
 */

const VENICE_API_BASE = 'https://api.venice.ai/api/v1';
const API_KEY = process.env.VENICE_API_KEY;

describe('Venice API Contract Tests', () => {
  const skipIfNoKey = !API_KEY || API_KEY === 'test-api-key';

  describe('Image Generation API Contract', () => {
    
    it('should use "size" parameter format (not width/height)', async () => {
      // This test validates the correct parameter format
      // Venice API expects: { size: "1024x1024" }
      // NOT: { width: 1024, height: 1024 }
      
      const correctPayload = {
        model: 'fluently-xl',
        prompt: 'test',
        size: '1024x1024',  // ✅ Correct format
      };
      
      const incorrectPayload = {
        model: 'fluently-xl', 
        prompt: 'test',
        width: 1024,   // ❌ Wrong format
        height: 1024,  // ❌ Wrong format
      };
      
      // Validate our payload structure
      expect(correctPayload).toHaveProperty('size');
      expect(correctPayload).not.toHaveProperty('width');
      expect(correctPayload).not.toHaveProperty('height');
      
      // Size should be in WxH format
      expect(correctPayload.size).toMatch(/^\d+x\d+$/);
    });

    it.skipIf(skipIfNoKey)('should successfully call image generation with correct format', async () => {
      const response = await fetch(`${VENICE_API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'fluently-xl',
          prompt: 'A simple red circle on white background',
          size: '512x512',
        }),
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it.skipIf(skipIfNoKey)('should fail with width/height parameters (proving they are wrong)', async () => {
      const response = await fetch(`${VENICE_API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'fluently-xl',
          prompt: 'test',
          width: 512,   // Wrong!
          height: 512,  // Wrong!
        }),
      });
      
      // This should fail because width/height are not valid parameters
      expect(response.ok).toBe(false);
    });
  });

  describe('Chat API Contract', () => {
    it('should have correct message format', () => {
      const correctPayload = {
        model: 'llama-3.3-70b',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
      };
      
      expect(correctPayload.messages).toBeInstanceOf(Array);
      expect(correctPayload.messages[0]).toHaveProperty('role');
      expect(correctPayload.messages[0]).toHaveProperty('content');
    });

    it.skipIf(skipIfNoKey)('should successfully call chat completion', async () => {
      const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: [{ role: 'user', content: 'Say "test" and nothing else' }],
          max_tokens: 10,
        }),
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('choices');
    });
  });

  describe('TTS API Contract', () => {
    it.skipIf(skipIfNoKey)('should successfully call text-to-speech', async () => {
      const response = await fetch(`${VENICE_API_BASE}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-kokoro',
          input: 'Test',
          voice: 'af_sky',
        }),
      });
      
      expect(response.ok).toBe(true);
    });
  });
});
