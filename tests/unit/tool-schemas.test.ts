import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool Schema Validation Tests
 * These tests ensure our MCP tool schemas match Venice API requirements.
 */

// Venice API expected schemas (derived from API documentation)
const VENICE_API_SCHEMAS = {
  'images/generations': {
    required: ['prompt', 'model'],
    optional: ['size', 'style_preset', 'negative_prompt', 'cfg_scale', 'steps', 'seed'],
    invalid: ['width', 'height'],  // These are NOT valid parameters!
    parameterFormats: {
      size: /^\d+x\d+$/,  // Must be "WxH" format like "1024x1024"
    },
  },
  'chat/completions': {
    required: ['model', 'messages'],
    optional: ['temperature', 'max_tokens', 'stream', 'top_p'],
    messageFormat: { role: 'string', content: 'string' },
  },
  'audio/speech': {
    required: ['model', 'input'],
    optional: ['voice', 'response_format', 'speed'],
  },
  'embeddings': {
    required: ['model', 'input'],
    optional: [],
  },
};

describe('Tool Schema Validation', () => {
  
  let inferenceSource: string;
  let allSources: string;
  
  beforeAll(() => {
    // Read all relevant source files
    const srcDir = path.join(process.cwd(), 'src');
    const files = [
      'tools/inference/index.ts',
      'tools/discovery/index.ts', 
      'tools/admin/index.ts',
    ];
    
    allSources = '';
    for (const file of files) {
      const filePath = path.join(srcDir, file);
      if (fs.existsSync(filePath)) {
        allSources += fs.readFileSync(filePath, 'utf-8') + '\n';
      }
    }
    
    const inferencePath = path.join(srcDir, 'tools/inference/index.ts');
    inferenceSource = fs.existsSync(inferencePath) 
      ? fs.readFileSync(inferencePath, 'utf-8')
      : '';
  });

  describe('Image Generation Tool', () => {
    const schema = VENICE_API_SCHEMAS['images/generations'];

    it('should NOT have width parameter', () => {
      // This test would have caught the bug!
      // Check for width as a tool parameter definition
      const hasWidthAsToolParam = /z\.number\(\)[^}]*\.describe\([^)]*width/i.test(inferenceSource) ||
                                   /width:\s*z\.number/i.test(inferenceSource);
      
      expect(hasWidthAsToolParam).toBe(false);
      expect(schema.invalid).toContain('width');
    });

    it('should NOT have height parameter', () => {
      // This test would have caught the bug!
      const hasHeightAsToolParam = /z\.number\(\)[^}]*\.describe\([^)]*height/i.test(inferenceSource) ||
                                    /height:\s*z\.number/i.test(inferenceSource);
      
      expect(hasHeightAsToolParam).toBe(false);
      expect(schema.invalid).toContain('height');
    });

    it('should have size parameter as string', () => {
      // size should be a string like "1024x1024"
      const hasSizeAsString = /size:\s*z\.string\(\)/m.test(inferenceSource);
      expect(hasSizeAsString).toBe(true);
    });

    it('should have required parameters (prompt, model)', () => {
      expect(inferenceSource).toMatch(/prompt:\s*z\.string\(\)/);
      expect(inferenceSource).toMatch(/model:\s*z\.string\(\)/);
    });

    it('should default size to valid WxH format', () => {
      // Check that default size is in correct format
      const defaultMatch = inferenceSource.match(/size.*default\(["']([^"']+)["']\)/);
      expect(defaultMatch).not.toBeNull();
      if (defaultMatch) {
        expect(defaultMatch[1]).toMatch(/^\d+x\d+$/);
      }
    });
  });

  describe('Chat Tool', () => {

    it('should have required parameters', () => {
      expect(inferenceSource).toMatch(/venice_chat/);
      expect(inferenceSource).toMatch(/model:\s*z\.string\(\)/);
      expect(inferenceSource).toMatch(/message:\s*z\.string\(\)/);
    });

    it('should construct messages array correctly', () => {
      // Check that messages are formatted with role/content
      expect(inferenceSource).toMatch(/role.*system|role.*user/);
      expect(inferenceSource).toMatch(/content/);
    });
  });

  describe('TTS Tool', () => {

    it('should have required parameters', () => {
      expect(inferenceSource).toMatch(/venice_text_to_speech/);
      expect(inferenceSource).toMatch(/text:\s*z\.string\(\)/);
      expect(inferenceSource).toMatch(/model:\s*z\.string\(\)/);
    });

    it('should send input field to API (not text)', () => {
      // API expects "input" but we accept "text" from user
      expect(inferenceSource).toMatch(/input:\s*text/);
    });
  });

  describe('Request Body Construction', () => {
    
    it('should NOT construct body with width/height for images', () => {
      // Make sure we're not sending width/height to the API
      const bodySection = inferenceSource.match(/const body.*=.*{[^}]+}/s);
      if (bodySection) {
        expect(bodySection[0]).not.toMatch(/width/);
        expect(bodySection[0]).not.toMatch(/height/);
      }
    });

    it('should construct body with size parameter for images', () => {
      // The body should include size
      const bodySection = inferenceSource.match(/const body.*=.*{[^}]+}/s);
      expect(bodySection).not.toBeNull();
      if (bodySection) {
        expect(bodySection[0]).toMatch(/size/);
      }
    });
  });
});
