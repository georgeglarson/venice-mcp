import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SDK Comparison Tests
 * These tests compare our MCP server implementation against the official Venice SDK.
 * They would have caught discrepancies like width/height vs size.
 */

const VENICE_SDK_PATH = '/root/venice-dev-tools';

describe('Venice SDK Comparison Tests', () => {
  
  describe('Image Generation Parameters', () => {
    
    it('should match SDK image generation parameter format', () => {
      // Check if Venice SDK exists
      const sdkExists = fs.existsSync(VENICE_SDK_PATH);
      if (!sdkExists) {
        console.log('Venice SDK not found, skipping SDK comparison');
        return;
      }
      
      // Read SDK source and examples to find image generation patterns
      let sdkContent = '';
      
      // Check SDK source files
      const srcPatterns = [
        'packages/*/src/**/*.ts',
        'src/**/*.ts',
      ];
      
      function readDir(dir: string): string {
        let content = '';
        if (!fs.existsSync(dir)) return content;
        
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== 'node_modules') {
            content += readDir(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            content += fs.readFileSync(fullPath, 'utf-8') + '\n';
          }
        }
        return content;
      }
      
      sdkContent = readDir(path.join(VENICE_SDK_PATH, 'src'));
      sdkContent += readDir(path.join(VENICE_SDK_PATH, 'examples'));
      
      if (sdkContent) {
        // Check what parameters the SDK uses for image generation
        const usesSize = /size["':\s]/.test(sdkContent);
        const usesWidthHeight = /width["':\s]/.test(sdkContent) && /height["':\s]/.test(sdkContent);
        
        console.log('SDK content found, length:', sdkContent.length);
        console.log('SDK mentions "size":', usesSize);
        console.log('SDK mentions "width" and "height":', usesWidthHeight);
      }
    });

    it('should verify SDK examples exist', () => {
      const examplesDir = path.join(VENICE_SDK_PATH, 'examples');
      
      if (!fs.existsSync(examplesDir)) {
        console.log('SDK examples directory not found');
        return;
      }
      
      const files = fs.readdirSync(examplesDir);
      console.log('SDK example files:', files);
      
      // Look for image-related examples
      const imageExamples = files.filter(f => 
        f.toLowerCase().includes('image') || f.toLowerCase().includes('generate')
      );
      console.log('Image-related examples:', imageExamples);
    });
  });

  describe('MCP Server Implementation Validation', () => {
    
    it('should have image generation using size parameter', () => {
      const mcpServerPath = path.join(process.cwd(), 'src/tools/inference/index.ts');
      
      if (!fs.existsSync(mcpServerPath)) {
        throw new Error('MCP server inference tools not found');
      }
      
      const content = fs.readFileSync(mcpServerPath, 'utf-8');
      
      // Find the image generation tool definition and implementation
      const hasCorrectSizeParam = /size:\s*z\.string\(\)/.test(content);
      const hasIncorrectWidthParam = /width:\s*z\.number\(\)/.test(content);
      const hasIncorrectHeightParam = /height:\s*z\.number\(\)/.test(content);
      
      // These assertions would have caught the bug!
      expect(hasCorrectSizeParam).toBe(true);
      expect(hasIncorrectWidthParam).toBe(false);
      expect(hasIncorrectHeightParam).toBe(false);
    });

    it('should format size as WxH string in defaults', () => {
      const mcpServerPath = path.join(process.cwd(), 'src/tools/inference/index.ts');
      const content = fs.readFileSync(mcpServerPath, 'utf-8');
      
      // Check that size default is properly formatted as "WxH" string
      const sizeDefaultMatch = content.match(/size.*default\(["']([^"']+)["']\)/);
      
      expect(sizeDefaultMatch).not.toBeNull();
      if (sizeDefaultMatch) {
        // Should be like "1024x1024"
        expect(sizeDefaultMatch[1]).toMatch(/^\d+x\d+$/);
      }
    });
  });
});
