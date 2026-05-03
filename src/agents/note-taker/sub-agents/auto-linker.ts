/**
 * AutoLinker Sub-agent
 * Finds related notes and adds wiki-links
 */

import { SubAgent } from '../../base/sub-agent.js';
import type { Result } from '../../../types.js';
import type { AutoLinkerConfig, ProcessedNote, Note } from '../types.js';
import { NoteCategory, NoteConfidence } from '../types.js';
import { logger } from '../../../utils/logger.js';
import { findSimilarDocuments } from '../tools/tf-idf.js';
import { parseNote } from '../tools/markdown-parser.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Information about an existing note in the vault
 */
interface ExistingNoteInfo {
  title: string;
  filePath: string;
  content: string;
  cleanContent: string; // Content without code blocks, etc.
}

/**
 * AutoLinker Sub-agent
 * Uses TF-IDF to find similar notes and add [[wiki-links]]
 */
export class AutoLinker extends SubAgent<AutoLinkerConfig, ProcessedNote, Note> {
  /**
   * Execute auto-linking
   */
  async execute(input: ProcessedNote): Promise<Result<Note>> {
    try {
      logger.debug('AutoLinker executing', { title: input.title });

      // Step 1: Convert ProcessedNote to Note structure
      const note = this.processedNoteToNote(input);

      // Step 2: Load all existing notes from vault
      const existingNotes = await this.loadExistingNotes();

      if (existingNotes.length === 0) {
        logger.debug('No existing notes found in vault, skipping auto-linking');
        return {
          success: true,
          data: note,
        };
      }

      // Step 3: Find similar notes using TF-IDF
      const similarNotes = this.findSimilarNotes(
        input.content,
        existingNotes,
        this.config.similarityThreshold,
        this.config.maxLinksPerNote
      );

      if (similarNotes.length === 0) {
        logger.debug('No similar notes found above threshold');
        return {
          success: true,
          data: note,
        };
      }

      // Step 4: Add wiki-links to content
      const linkedContent = this.addWikiLinks(note.content, similarNotes);

      // Step 5: Update note with linked content
      note.content = linkedContent;
      note.metadata.hasLinks = true;

      // Step 6: Add related notes to frontmatter
      note.frontmatter.related = similarNotes.map((n) => n.title);

      logger.info('AutoLinker completed', {
        title: input.title,
        linksAdded: similarNotes.length,
      });

      return {
        success: true,
        data: note,
      };
    } catch (error) {
      const errorMessage = `AutoLinker failed: ${
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
   * Convert ProcessedNote to Note structure
   */
  private processedNoteToNote(processedNote: ProcessedNote): Note {
    // Convert category string to enum
    let category: NoteCategory;
    const categoryLower = processedNote.category.toLowerCase();

    switch (categoryLower) {
      case 'trading':
        category = NoteCategory.Trading;
        break;
      case 'learning':
        category = NoteCategory.Learning;
        break;
      case 'japanese':
        category = NoteCategory.Japanese;
        break;
      case 'projects':
        category = NoteCategory.Projects;
        break;
      case 'meetings':
        category = NoteCategory.Meetings;
        break;
      case 'daily-notes':
        category = NoteCategory.DailyNotes;
        break;
      case 'ideas':
      default:
        category = NoteCategory.Ideas;
        break;
    }

    return {
      frontmatter: {
        title: processedNote.title,
        tags: processedNote.tags,
        category,
        subcategory: processedNote.subcategory,
        created: processedNote.metadata.timestamp,
        modified: processedNote.metadata.timestamp,
        related: processedNote.relatedNotes,
        confidence: processedNote.metadata.confidence,
      },
      content: processedNote.content,
      metadata: {
        timestamp: new Date(processedNote.metadata.timestamp),
        wordCount: processedNote.metadata.wordCount,
        hasLinks: processedNote.metadata.hasLinks,
        confidence: processedNote.metadata.confidence,
      },
    };
  }

  /**
   * Load all existing notes from vault
   */
  private async loadExistingNotes(): Promise<ExistingNoteInfo[]> {
    const vaultPath = 'data/test-vault'; // TODO: Get from config
    const notes: ExistingNoteInfo[] = [];

    try {
      // Check if vault exists
      await fs.access(vaultPath);
    } catch {
      logger.debug('Vault path does not exist', { vaultPath });
      return notes;
    }

    // Recursively find all .md files
    const mdFiles = await this.findMarkdownFiles(vaultPath);

    // Load and parse each file
    for (const filePath of mdFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parseResult = parseNote(content);

        if (!parseResult.success) {
          logger.warn('Failed to parse note', { filePath });
          continue;
        }

        const parsed = parseResult.data;
        const title = (parsed.frontmatter.title as string) || path.basename(filePath, '.md');

        notes.push({
          title,
          filePath,
          content,
          cleanContent: parsed.contentWithoutSpecialBlocks,
        });
      } catch (error) {
        logger.warn('Failed to read note', { filePath, error });
      }
    }

    logger.debug('Loaded existing notes', { count: notes.length });
    return notes;
  }

  /**
   * Recursively find all markdown files in a directory
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.warn('Failed to read directory', { dir, error });
    }

    return files;
  }

  /**
   * Find similar notes using TF-IDF
   */
  private findSimilarNotes(
    queryContent: string,
    existingNotes: ExistingNoteInfo[],
    threshold: number,
    maxResults: number
  ): ExistingNoteInfo[] {
    // Extract clean content from existing notes
    const documents = existingNotes.map((note) => note.cleanContent);

    // Find similar documents
    const results = findSimilarDocuments(
      queryContent,
      documents,
      threshold,
      maxResults
    );

    // Map results back to note info
    const similarNotes = results.map((result) => {
      const index = documents.indexOf(result.document);
      return existingNotes[index];
    });

    logger.debug('Found similar notes', {
      count: similarNotes.length,
      titles: similarNotes.map((n) => n.title),
    });

    return similarNotes;
  }

  /**
   * Add wiki-links to content
   * Adds a "Related" section at the bottom with links to similar notes
   */
  private addWikiLinks(
    content: string,
    similarNotes: ExistingNoteInfo[]
  ): string {
    // Check if content already has links to these notes
    const existingLinks = new Set<string>();
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      existingLinks.add(match[1]);
    }

    // Filter out notes that are already linked
    const notesToLink = similarNotes.filter(
      (note) => !existingLinks.has(note.title)
    );

    if (notesToLink.length === 0) {
      return content;
    }

    // Add "Related" section at the bottom
    let updatedContent = content.trimEnd();

    // Add spacing before Related section
    if (!updatedContent.endsWith('\n\n')) {
      updatedContent += '\n\n';
    }

    updatedContent += '## Related\n\n';

    // Add wiki-links
    for (const note of notesToLink) {
      updatedContent += `- [[${note.title}]]\n`;
    }

    return updatedContent;
  }
}
