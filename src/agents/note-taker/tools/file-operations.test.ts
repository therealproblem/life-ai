/**
 * Tests for file-operations tool
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  readFile,
  writeFile,
  appendFile,
  deleteFile,
  fileExists,
  ensureDir,
  listFiles,
  readNote,
  writeNote,
  listNotes,
} from './file-operations.js';

// Test directory - will be created and cleaned up
const TEST_DIR = path.join(process.cwd(), 'data', 'temp', 'test-file-ops');

describe('file-operations', () => {
  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('readFile', () => {
    it('should read file successfully', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      const content = 'Hello, World!';
      
      // Create file manually
      await fs.mkdir(TEST_DIR, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      
      const result = await readFile(filePath);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(content);
      }
    });

    it('should fail when file does not exist', async () => {
      const filePath = path.join(TEST_DIR, 'nonexistent.txt');
      
      const result = await readFile(filePath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.message).toContain('Failed to read file');
      }
    });
  });

  describe('writeFile', () => {
    it('should write file successfully', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      const content = 'Test content';
      
      const result = await writeFile(filePath, content);
      
      expect(result.success).toBe(true);
      
      // Verify file was written
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe(content);
    });

    it('should create parent directories', async () => {
      const filePath = path.join(TEST_DIR, 'nested', 'deep', 'test.txt');
      const content = 'Nested content';
      
      const result = await writeFile(filePath, content);
      
      expect(result.success).toBe(true);
      
      // Verify file and directories were created
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe(content);
    });

    it('should overwrite existing file', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      
      await writeFile(filePath, 'Original content');
      const result = await writeFile(filePath, 'New content');
      
      expect(result.success).toBe(true);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe('New content');
    });
  });

  describe('appendFile', () => {
    it('should append to existing file', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      
      await writeFile(filePath, 'Line 1\n');
      const result = await appendFile(filePath, 'Line 2\n');
      
      expect(result.success).toBe(true);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe('Line 1\nLine 2\n');
    });

    it('should create file if it does not exist', async () => {
      const filePath = path.join(TEST_DIR, 'new.txt');
      
      const result = await appendFile(filePath, 'First line\n');
      
      expect(result.success).toBe(true);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      expect(fileContent).toBe('First line\n');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      
      await writeFile(filePath, 'Content');
      const result = await deleteFile(filePath);
      
      expect(result.success).toBe(true);
      
      // Verify file was deleted
      const exists = await fileExists(filePath);
      expect(exists).toBe(false);
    });

    it('should fail when file does not exist', async () => {
      const filePath = path.join(TEST_DIR, 'nonexistent.txt');
      
      const result = await deleteFile(filePath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      
      await writeFile(filePath, 'Content');
      const exists = await fileExists(filePath);
      
      expect(exists).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      const filePath = path.join(TEST_DIR, 'nonexistent.txt');
      
      const exists = await fileExists(filePath);
      
      expect(exists).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should create directory', async () => {
      const dirPath = path.join(TEST_DIR, 'newdir');
      
      const result = await ensureDir(dirPath);
      
      expect(result.success).toBe(true);
      
      // Verify directory was created
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create nested directories', async () => {
      const dirPath = path.join(TEST_DIR, 'level1', 'level2', 'level3');
      
      const result = await ensureDir(dirPath);
      
      expect(result.success).toBe(true);
      
      // Verify nested directories were created
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should succeed when directory already exists', async () => {
      const dirPath = path.join(TEST_DIR, 'existing');
      
      await ensureDir(dirPath);
      const result = await ensureDir(dirPath);
      
      expect(result.success).toBe(true);
    });
  });

  describe('listFiles', () => {
    beforeEach(async () => {
      // Create test directory with files
      await ensureDir(TEST_DIR);
      await writeFile(path.join(TEST_DIR, 'file1.txt'), 'Content 1');
      await writeFile(path.join(TEST_DIR, 'file2.md'), 'Content 2');
      await writeFile(path.join(TEST_DIR, 'file3.txt'), 'Content 3');
    });

    it('should list all files', async () => {
      const result = await listFiles(TEST_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        expect(result.data.map(f => path.basename(f)).sort()).toEqual([
          'file1.txt',
          'file2.md',
          'file3.txt',
        ]);
      }
    });

    it('should filter files by pattern', async () => {
      const result = await listFiles(TEST_DIR, /\.txt$/);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data.every(f => f.endsWith('.txt'))).toBe(true);
      }
    });

    it('should return empty array when directory does not exist', async () => {
      const result = await listFiles(path.join(TEST_DIR, 'nonexistent'));
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('readNote', () => {
    it('should read note from vault', async () => {
      const vaultPath = TEST_DIR;
      const notePath = 'notes/test.md';
      const content = '# Test Note\n\nContent here.';
      
      // Create note manually
      await writeFile(path.join(vaultPath, notePath), content);
      
      const result = await readNote(vaultPath, notePath);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(content);
      }
    });
  });

  describe('writeNote', () => {
    it('should write note to vault', async () => {
      const vaultPath = TEST_DIR;
      const notePath = 'notes/test.md';
      const content = '# Test Note\n\nContent here.';
      
      const result = await writeNote(vaultPath, notePath, content);
      
      expect(result.success).toBe(true);
      
      // Verify note was written
      const fullPath = path.join(vaultPath, notePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      expect(fileContent).toBe(content);
    });

    it('should create category directories', async () => {
      const vaultPath = TEST_DIR;
      const notePath = 'trading/analysis/xauusd.md';
      const content = '# XAUUSD Analysis';
      
      const result = await writeNote(vaultPath, notePath, content);
      
      expect(result.success).toBe(true);
      
      // Verify nested directories were created
      const fullPath = path.join(vaultPath, notePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      expect(fileContent).toBe(content);
    });
  });

  describe('listNotes', () => {
    beforeEach(async () => {
      // Create vault with notes
      const vaultPath = TEST_DIR;
      await writeNote(vaultPath, 'note1.md', '# Note 1');
      await writeNote(vaultPath, 'note2.md', '# Note 2');
      await writeNote(vaultPath, 'trading/trade1.md', '# Trade 1');
      await writeNote(vaultPath, 'trading/trade2.md', '# Trade 2');
      await writeFile(path.join(vaultPath, 'README.txt'), 'Not a note');
    });

    it('should list all notes in vault', async () => {
      const result = await listNotes(TEST_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(4);
        expect(result.data.every(f => f.endsWith('.md'))).toBe(true);
      }
    });

    it('should list notes in specific category', async () => {
      const result = await listNotes(TEST_DIR, 'trading');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data.every(f => f.includes('trading'))).toBe(true);
      }
    });

    it('should return relative paths', async () => {
      const result = await listNotes(TEST_DIR);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Paths should be relative to vault
        expect(result.data.every(f => !f.startsWith('/'))).toBe(true);
        expect(result.data.some(f => f === 'note1.md')).toBe(true);
        expect(result.data.some(f => f.includes('trading'))).toBe(true);
      }
    });
  });
});
