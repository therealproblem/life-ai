/**
 * File Operations Tool
 * Safe file system operations for the Obsidian vault
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { Result } from '../../../types.js';
import { logger } from '../../../utils/logger.js';

/**
 * Read a file from disk
 */
export async function readFile(filePath: string): Promise<Result<string>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    logger.debug('File read successfully', { path: filePath });
    
    return {
      success: true,
      data: content,
    };
  } catch (error) {
    const errorMessage = `Failed to read file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: filePath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * Write content to a file
 * Creates parent directories if they don't exist
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<Result<void>> {
  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    const ensureResult = await ensureDir(dir);
    
    if (!ensureResult.success) {
      return ensureResult;
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    logger.debug('File written successfully', { path: filePath });
    
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const errorMessage = `Failed to write file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: filePath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * Append content to a file
 * Creates file if it doesn't exist
 */
export async function appendFile(
  filePath: string,
  content: string
): Promise<Result<void>> {
  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    const ensureResult = await ensureDir(dir);
    
    if (!ensureResult.success) {
      return ensureResult;
    }
    
    await fs.appendFile(filePath, content, 'utf-8');
    logger.debug('Content appended to file', { path: filePath });
    
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const errorMessage = `Failed to append to file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: filePath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<Result<void>> {
  try {
    await fs.unlink(filePath);
    logger.debug('File deleted', { path: filePath });
    
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const errorMessage = `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: filePath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists
 * Creates it recursively if it doesn't exist
 */
export async function ensureDir(dirPath: string): Promise<Result<void>> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug('Directory ensured', { path: dirPath });
    
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const errorMessage = `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: dirPath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * List files in a directory
 * Optionally filter by pattern
 */
export async function listFiles(
  dirPath: string,
  pattern?: RegExp
): Promise<Result<string[]>> {
  try {
    // Check if directory exists
    const exists = await fileExists(dirPath);
    if (!exists) {
      return {
        success: true,
        data: [],
      };
    }
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    let files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(dirPath, entry.name));
    
    // Filter by pattern if provided
    if (pattern) {
      files = files.filter((file) => pattern.test(file));
    }
    
    logger.debug('Files listed', { path: dirPath, count: files.length });
    
    return {
      success: true,
      data: files,
    };
  } catch (error) {
    const errorMessage = `Failed to list files: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { path: dirPath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}

/**
 * Read a note from the Obsidian vault
 * Combines vaultPath with notePath
 */
export async function readNote(
  vaultPath: string,
  notePath: string
): Promise<Result<string>> {
  const fullPath = path.join(vaultPath, notePath);
  return readFile(fullPath);
}

/**
 * Write a note to the Obsidian vault
 * Combines vaultPath with notePath
 * Creates parent directories if needed
 */
export async function writeNote(
  vaultPath: string,
  notePath: string,
  content: string
): Promise<Result<void>> {
  const fullPath = path.join(vaultPath, notePath);
  return writeFile(fullPath, content);
}

/**
 * List all notes in the vault
 * Returns paths relative to vaultPath
 */
export async function listNotes(
  vaultPath: string,
  categoryPath?: string
): Promise<Result<string[]>> {
  const searchPath = categoryPath
    ? path.join(vaultPath, categoryPath)
    : vaultPath;
  
  try {
    const result = await listFiles(searchPath, /\.md$/);
    
    if (!result.success) {
      return result;
    }
    
    // Make paths relative to vault
    const relativePaths = result.data.map((file) =>
      path.relative(vaultPath, file)
    );
    
    return {
      success: true,
      data: relativePaths,
    };
  } catch (error) {
    const errorMessage = `Failed to list notes: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage, { vaultPath, categoryPath });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      message: errorMessage,
    };
  }
}
