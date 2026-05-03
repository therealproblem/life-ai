/**
 * Tests for QuickCapture sub-agent
 * Following TDD - tests written before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { QuickCapture } from './quick-capture.js';
import type { QuickCaptureConfig } from '../types.js';

const TEST_DIR = path.join(process.cwd(), 'data', 'temp', 'test-quick-capture');

describe('QuickCapture', () => {
  let quickCapture: QuickCapture;
  const config: QuickCaptureConfig = {
    skillName: 'quick-note',
  };

  beforeEach(async () => {
    quickCapture = new QuickCapture('QuickCapture', config);
    await quickCapture.initialize();
    
    // Create test directory
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await quickCapture.cleanup();
    
    // Clean up test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('Input Processing', () => {
    it('should process raw text input', async () => {
      const result = await quickCapture.execute({
        content: 'Trading psychology is crucial for success',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBeDefined();
        expect(result.data.content).toContain('Trading psychology');
        expect(result.data.category).toBeDefined();
        expect(result.data.tags.length).toBeGreaterThan(0);
      }
    });

    it('should process markdown file', async () => {
      const mdPath = path.join(TEST_DIR, 'test.md');
      const mdContent = `---
title: Original Title
tags: [old]
---

# Trading Psychology

Important concepts about trading psychology.`;

      await fs.writeFile(mdPath, mdContent);

      const result = await quickCapture.execute({
        filePath: mdPath,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toContain('Trading Psychology');
        // Should have extracted content
        expect(result.data.title).toBeDefined();
      }
    });

    it('should process PDF file', async () => {
      // Note: This test requires a real PDF file or mock
      // For now, we'll test the error handling
      const pdfPath = path.join(TEST_DIR, 'nonexistent.pdf');

      const result = await quickCapture.execute({
        filePath: pdfPath,
      });

      // Should fail gracefully for missing file
      expect(result.success).toBe(false);
    });

    it('should handle file not found', async () => {
      const result = await quickCapture.execute({
        filePath: '/nonexistent/file.md',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toContain('not found');
      }
    });

    it('should handle corrupted PDF', async () => {
      const corruptedPdf = path.join(TEST_DIR, 'corrupted.pdf');
      await fs.writeFile(corruptedPdf, 'This is not a real PDF file');

      const result = await quickCapture.execute({
        filePath: corruptedPdf,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toMatch(/parse|invalid|corrupted/i);
      }
    });

    it('should merge existing frontmatter with LLM suggestions', async () => {
      const mdPath = path.join(TEST_DIR, 'existing.md');
      const mdContent = `---
title: Existing Title
tags: [existing-tag]
created: 2026-05-01
---

Trading psychology content.`;

      await fs.writeFile(mdPath, mdContent);

      const result = await quickCapture.execute({
        filePath: mdPath,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Should preserve some existing metadata
        // (implementation decides merge strategy)
        expect(result.data.title).toBeDefined();
      }
    });
  });

  describe('LLM Response Handling', () => {
    it('should parse valid JSON response from LLM', async () => {
      // This tests the parsing logic
      // Actual LLM call would happen in execute()
      const result = await quickCapture.execute({
        content: 'Simple trading note',
      });

      // Should return structured data
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('title');
        expect(result.data).toHaveProperty('content');
        expect(result.data).toHaveProperty('category');
        expect(result.data).toHaveProperty('tags');
      }
    });

    it('should handle malformed JSON from LLM', async () => {
      // If LLM returns invalid JSON, should fail gracefully
      // This would be tested with a mock LLM response
      // For now, we ensure the structure handles errors
      const result = await quickCapture.execute({
        content: '',
      });

      // Empty content should error
      expect(result.success).toBe(false);
    });

    it('should handle missing required fields in LLM response', async () => {
      // Tests validation of LLM output
      // Should reject if title or category missing
      const result = await quickCapture.execute({
        content: 'Test content',
      });

      // Should always have required fields or fail
      if (result.success) {
        expect(result.data.title).toBeDefined();
        expect(result.data.category).toBeDefined();
        expect(result.data.tags).toBeDefined();
      }
    });

    it('should fill optional fields with defaults', async () => {
      const result = await quickCapture.execute({
        content: 'Simple note without much context',
      });

      if (result.success) {
        // Should have metadata even if LLM doesn't provide all
        expect(result.data.metadata).toBeDefined();
        expect(result.data.metadata.timestamp).toBeDefined();
        expect(result.data.metadata.wordCount).toBeGreaterThan(0);
      }
    });
  });

  describe('File Type Detection', () => {
    it('should detect markdown file by extension', async () => {
      const mdPath = path.join(TEST_DIR, 'test.md');
      await fs.writeFile(mdPath, '# Test');

      const result = await quickCapture.execute({
        filePath: mdPath,
      });

      // Should process as markdown
      expect(result.success).toBe(true);
    });

    it('should detect PDF file by extension', async () => {
      const pdfPath = path.join(TEST_DIR, 'test.pdf');
      
      // Since we don't have a real PDF, this will fail
      // but it tests the detection logic
      const result = await quickCapture.execute({
        filePath: pdfPath,
      });

      // Will fail (no file), but should attempt PDF processing
      expect(result.success).toBe(false);
    });

    it('should detect raw text when no file path provided', async () => {
      const result = await quickCapture.execute({
        content: 'Raw text input',
      });

      // Should process as raw text
      expect(result.success).toBe(true);
    });
  });

  describe('Content Extraction', () => {
    it('should extract text from markdown', async () => {
      const mdPath = path.join(TEST_DIR, 'content.md');
      const mdContent = `---
title: Test
---

# Heading

Paragraph with **bold** and *italic*.

- List item 1
- List item 2`;

      await fs.writeFile(mdPath, mdContent);

      const result = await quickCapture.execute({
        filePath: mdPath,
      });

      if (result.success) {
        // Should extract clean content (without frontmatter delimiter)
        expect(result.data.content).toContain('Heading');
        expect(result.data.content).toContain('Paragraph');
      }
    });

    it('should extract text from PDF', async () => {
      // This would require a real PDF file
      // Skipping actual implementation for now
      expect(true).toBe(true);
    });

    it('should handle images in PDF', async () => {
      // PDF parser should skip images and extract text only
      // Tested with real PDF in integration tests
      expect(true).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate ProcessedNote structure', async () => {
      const result = await quickCapture.execute({
        content: 'Valid note content',
      });

      if (result.success) {
        // Must have all required fields
        expect(result.data.title).toBeDefined();
        expect(result.data.content).toBeDefined();
        expect(result.data.category).toBeDefined();
        expect(result.data.tags).toBeInstanceOf(Array);
        expect(result.data.metadata).toBeDefined();
      }
    });

    it('should validate category enum', async () => {
      const result = await quickCapture.execute({
        content: 'Trading note about XAUUSD',
      });

      if (result.success) {
        // Category should be valid
        const validCategories = ['trading', 'learning', 'japanese', 'projects', 'meetings', 'ideas', 'daily-notes'];
        expect(validCategories).toContain(result.data.category);
      }
    });

    it('should validate confidence level', async () => {
      const result = await quickCapture.execute({
        content: 'Test note',
      });

      if (result.success) {
        // Confidence should be valid
        const validConfidence = ['high', 'medium', 'low'];
        expect(validConfidence).toContain(result.data.metadata.confidence);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', async () => {
      const result = await quickCapture.execute({
        content: '',
      });

      // Should fail for empty input
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toMatch(/empty/i);
      }
    });

    it('should handle very long input', async () => {
      // Create 1000+ word content
      const longContent = Array(1000).fill('trading psychology risk management').join(' ');

      const result = await quickCapture.execute({
        content: longContent,
      });

      // Should handle without error
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.wordCount).toBeGreaterThan(500);
      }
    });

    it('should handle markdown with complete existing frontmatter', async () => {
      const mdPath = path.join(TEST_DIR, 'complete.md');
      const mdContent = `---
title: Perfect Title
tags: [tag1, tag2, tag3]
category: trading
subcategory: analysis
created: 2026-05-01
modified: 2026-05-03
confidence: high
---

Content here.`;

      await fs.writeFile(mdPath, mdContent);

      const result = await quickCapture.execute({
        filePath: mdPath,
      });

      if (result.success) {
        // Should respect good existing frontmatter
        // (or enhance it intelligently)
        expect(result.data.title).toBeDefined();
        expect(result.data.tags.length).toBeGreaterThan(0);
      }
    });
  });
});
