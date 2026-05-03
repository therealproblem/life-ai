/**
 * Organizer Sub-agent Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Organizer } from './organizer.js';
import type { Note } from '../types.js';
import { NoteCategory, NoteConfidence } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Organizer', () => {
  const testVaultPath = 'data/test-vault-organizer';
  let organizer: Organizer;

  beforeEach(async () => {
    // Clean up any existing test vault
    try {
      await fs.rm(testVaultPath, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }

    // Create fresh test vault
    await fs.mkdir(testVaultPath, { recursive: true });

    // Create Organizer instance
    organizer = new Organizer('Organizer', {
      vaultPath: testVaultPath,
      createSubfolders: true,
      overwriteExisting: false,
      addTimestamp: false,
    });

    await organizer.initialize();
  });

  afterEach(async () => {
    organizer.cleanup();

    // Clean up test vault
    try {
      await fs.rm(testVaultPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('execute', () => {
    it('should save note to correct category folder', async () => {
      const note: Note = {
        frontmatter: {
          title: 'XAUUSD Trading Strategy',
          tags: ['trading', 'xauusd'],
          category: NoteCategory.Trading,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'Gold trading strategy content.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 4,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const savedNote = result.data;

      // Should have filePath set
      expect(savedNote.metadata.filePath).toBeDefined();
      expect(savedNote.metadata.filePath).toContain('trading/');
      expect(savedNote.metadata.filePath).toContain('xauusd-trading-strategy.md');

      // File should exist
      const filePath = savedNote.metadata.filePath!;
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // File should have correct content
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toContain('title: XAUUSD Trading Strategy');
      expect(fileContent).toContain('tags: [trading, xauusd]');
      expect(fileContent).toContain('category: trading');
      expect(fileContent).toContain('Gold trading strategy content.');
    });

    it('should create category folder if it does not exist', async () => {
      const note: Note = {
        frontmatter: {
          title: 'Japanese Grammar Lesson',
          tags: ['japanese', 'grammar'],
          category: NoteCategory.Japanese,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'Learning particles.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      // Folder should exist
      const folderPath = path.join(testVaultPath, 'japanese');
      const folderExists = await fs
        .access(folderPath)
        .then(() => true)
        .catch(() => false);
      expect(folderExists).toBe(true);

      // File should exist in folder
      expect(result.data.metadata.filePath).toContain('japanese/');
    });

    it('should slugify filename from title', async () => {
      const note: Note = {
        frontmatter: {
          title: 'How to Trade XAUUSD: A Complete Guide!',
          tags: ['trading'],
          category: NoteCategory.Trading,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'Guide content.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      // Should convert to slug: lowercase, hyphens, no special chars
      expect(result.data.metadata.filePath).toContain(
        'how-to-trade-xauusd-a-complete-guide.md'
      );
    });

    it('should handle file collision by appending timestamp', async () => {
      const note1: Note = {
        frontmatter: {
          title: 'Trading Note',
          tags: ['trading'],
          category: NoteCategory.Trading,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'First note.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const note2: Note = {
        frontmatter: {
          title: 'Trading Note',
          tags: ['trading'],
          category: NoteCategory.Trading,
          created: '2026-05-03T11:00:00Z',
          modified: '2026-05-03T11:00:00Z',
        },
        content: 'Second note.',
        metadata: {
          timestamp: new Date('2026-05-03T11:00:00Z'),
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      // Save first note
      const result1 = await organizer.execute(note1);
      expect(result1.success).toBe(true);

      // Save second note with same title
      const result2 = await organizer.execute(note2);
      expect(result2.success).toBe(true);
      if (!result2.success) return;

      // Second note should have timestamp appended
      expect(result2.data.metadata.filePath).toContain('trading-note-');
      expect(result2.data.metadata.filePath).toMatch(/trading-note-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.md/);

      // Both files should exist
      const file1Exists = await fs
        .access(result1.data.metadata.filePath!)
        .then(() => true)
        .catch(() => false);
      const file2Exists = await fs
        .access(result2.data.metadata.filePath!)
        .then(() => true)
        .catch(() => false);

      expect(file1Exists).toBe(true);
      expect(file2Exists).toBe(true);

      // Files should have different content
      const content1 = await fs.readFile(result1.data.metadata.filePath!, 'utf-8');
      const content2 = await fs.readFile(result2.data.metadata.filePath!, 'utf-8');
      expect(content1).toContain('First note.');
      expect(content2).toContain('Second note.');
    });

    it('should save with subcategory folder if provided', async () => {
      const note: Note = {
        frontmatter: {
          title: 'Price Action Patterns',
          tags: ['trading', 'technical-analysis'],
          category: NoteCategory.Trading,
          subcategory: 'strategies',
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'Price action patterns.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 3,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      // Should be in subcategory folder
      expect(result.data.metadata.filePath).toContain('trading/strategies/');
      
      // Folder structure should exist
      const folderPath = path.join(testVaultPath, 'trading', 'strategies');
      const folderExists = await fs
        .access(folderPath)
        .then(() => true)
        .catch(() => false);
      expect(folderExists).toBe(true);
    });

    it('should preserve frontmatter fields in saved file', async () => {
      const note: Note = {
        frontmatter: {
          title: 'Test Note',
          tags: ['test', 'demo'],
          category: NoteCategory.Ideas,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
          related: ['Other Note', 'Another Note'],
          confidence: NoteConfidence.High,
        },
        content: 'Test content with [[Other Note]] link.\n\n## Related\n\n- [[Another Note]]',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 8,
          hasLinks: true,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const fileContent = await fs.readFile(result.data.metadata.filePath!, 'utf-8');

      // Check frontmatter
      expect(fileContent).toContain('title: Test Note');
      expect(fileContent).toContain('tags: [test, demo]');
      expect(fileContent).toContain('category: ideas');
      expect(fileContent).toContain('created: 2026-05-03T10:00:00Z');
      expect(fileContent).toContain('modified: 2026-05-03T10:00:00Z');
      expect(fileContent).toContain('related: [Other Note, Another Note]');
      expect(fileContent).toContain('confidence: high');

      // Check content
      expect(fileContent).toContain('Test content with [[Other Note]] link.');
      expect(fileContent).toContain('## Related');
    });

    it('should set fileName in metadata', async () => {
      const note: Note = {
        frontmatter: {
          title: 'Quick Idea',
          tags: ['idea'],
          category: NoteCategory.Ideas,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: 'Quick thought.',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      // Should have fileName set
      expect(result.data.metadata.fileName).toBe('quick-idea.md');
    });

    it('should handle empty content gracefully', async () => {
      const note: Note = {
        frontmatter: {
          title: 'Empty Note',
          tags: [],
          category: NoteCategory.Ideas,
          created: '2026-05-03T10:00:00Z',
          modified: '2026-05-03T10:00:00Z',
        },
        content: '',
        metadata: {
          timestamp: new Date('2026-05-03T10:00:00Z'),
          wordCount: 0,
          hasLinks: false,
          confidence: NoteConfidence.Low,
        },
      };

      const result = await organizer.execute(note);

      expect(result.success).toBe(true);
      if (!result.success) return;

      // File should exist even with empty content
      const fileContent = await fs.readFile(result.data.metadata.filePath!, 'utf-8');
      expect(fileContent).toContain('title: Empty Note');
      expect(fileContent).toContain('---'); // Frontmatter delimiters
    });
  });
});
