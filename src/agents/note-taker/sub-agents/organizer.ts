/**
 * Organizer Sub-agent
 * Categorizes and saves notes to appropriate folders
 */

import { SubAgent } from '../../base/sub-agent.js';
import type { Result } from '../../../types.js';
import type { OrganizerConfig, Note } from '../types.js';
import { NoteCategory } from '../types.js';
import { logger } from '../../../utils/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Organizer Sub-agent
 * Saves notes to the correct category folder in Obsidian vault
 */
export class Organizer extends SubAgent<OrganizerConfig, Note, Note> {
  /**
   * Execute organization and file saving
   */
  async execute(input: Note): Promise<Result<Note>> {
    try {
      logger.debug('Organizer executing', { title: input.frontmatter.title });

      // Step 1: Determine folder path (category + optional subcategory)
      const folderPath = this.determineFolderPath(input);

      // Step 2: Create folder if it doesn't exist
      await this.ensureFolderExists(folderPath);

      // Step 3: Generate filename from title (slugified)
      let fileName = this.slugifyTitle(input.frontmatter.title);

      // Step 4: Check for file collision and handle it
      const filePath = await this.resolveFilePath(folderPath, fileName, input);

      // Step 5: Generate markdown content with frontmatter
      const markdownContent = this.generateMarkdown(input);

      // Step 6: Write file to disk
      await fs.writeFile(filePath, markdownContent, 'utf-8');

      // Step 7: Update note metadata with file info
      const updatedNote = { ...input };
      updatedNote.metadata.filePath = filePath;
      updatedNote.metadata.fileName = path.basename(filePath);

      logger.info('Note saved successfully', {
        title: input.frontmatter.title,
        filePath,
      });

      return {
        success: true,
        data: updatedNote,
      };
    } catch (error) {
      const errorMessage = `Organizer failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      logger.error(errorMessage);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        message: errorMessage,
      };
    }
  }

  /**
   * Determine folder path based on category and subcategory
   */
  private determineFolderPath(note: Note): string {
    const categoryFolder = note.frontmatter.category.toString();

    if (note.frontmatter.subcategory && this.config.createSubfolders) {
      return path.join(
        this.config.vaultPath,
        categoryFolder,
        note.frontmatter.subcategory
      );
    }

    return path.join(this.config.vaultPath, categoryFolder);
  }

  /**
   * Ensure folder exists, create if needed
   */
  private async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      await fs.access(folderPath);
      logger.debug('Folder exists', { folderPath });
    } catch {
      // Folder doesn't exist, create it
      logger.debug('Creating folder', { folderPath });
      await fs.mkdir(folderPath, { recursive: true });
    }
  }

  /**
   * Slugify title to create filename
   * Converts to lowercase, replaces spaces with hyphens, removes special chars
   */
  private slugifyTitle(title: string): string {
    return title
      .toLowerCase()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Remove consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
      // Add .md extension
      + '.md';
  }

  /**
   * Resolve file path, handling collisions
   */
  private async resolveFilePath(
    folderPath: string,
    fileName: string,
    note: Note
  ): Promise<string> {
    const fullPath = path.join(folderPath, fileName);

    // Check if file exists
    try {
      await fs.access(fullPath);
      // File exists - handle collision

      if (this.config.overwriteExisting) {
        logger.warn('Overwriting existing file', { filePath: fullPath });
        return fullPath;
      }

      // Append timestamp to filename
      // Format: YYYY-MM-DD-HH-MM-SS
      const timestamp = note.metadata.timestamp
        .toISOString()
        .replace('T', '-')
        .replace(/:/g, '-')
        .split('.')[0]; // Remove milliseconds and Z

      const baseName = path.basename(fileName, '.md');
      const newFileName = `${baseName}-${timestamp}.md`;
      const newPath = path.join(folderPath, newFileName);

      logger.debug('File collision detected, using timestamped name', {
        original: fullPath,
        new: newPath,
      });

      return newPath;
    } catch {
      // File doesn't exist, use original path
      return fullPath;
    }
  }

  /**
   * Generate markdown content with frontmatter
   */
  private generateMarkdown(note: Note): string {
    const frontmatter = this.generateFrontmatter(note);
    const content = note.content;

    return `---
${frontmatter}---

${content}`;
  }

  /**
   * Generate YAML frontmatter from note
   */
  private generateFrontmatter(note: Note): string {
    const fm = note.frontmatter;
    const lines: string[] = [];

    // Required fields
    lines.push(`title: ${fm.title}`);

    // Tags
    if (fm.tags.length > 0) {
      lines.push(`tags: [${fm.tags.join(', ')}]`);
    } else {
      lines.push('tags: []');
    }

    // Category (use string value, not enum)
    lines.push(`category: ${fm.category.toString()}`);

    // Subcategory (optional)
    if (fm.subcategory) {
      lines.push(`subcategory: ${fm.subcategory}`);
    }

    // Timestamps
    lines.push(`created: ${fm.created}`);
    lines.push(`modified: ${fm.modified}`);

    // Related notes (optional)
    if (fm.related && fm.related.length > 0) {
      lines.push(`related: [${fm.related.join(', ')}]`);
    }

    // Confidence (optional)
    if (fm.confidence) {
      lines.push(`confidence: ${fm.confidence}`);
    }

    // Add newline after each field
    return lines.join('\n') + '\n';
  }
}
