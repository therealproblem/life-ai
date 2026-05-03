/**
 * QuickCapture Sub-agent
 * Processes raw user input with LLM to extract tags, category, and links
 */

import { SubAgent } from '../../base/sub-agent.js';
import type { Result } from '../../../types.js';
import type { QuickCaptureConfig, ProcessedNote, NoteConfidence } from '../types.js';
import { logger } from '../../../utils/logger.js';
import { readFile } from '../tools/file-operations.js';
import { parseFrontmatter } from '../tools/markdown-parser.js';
// @ts-ignore - pdf-parse has incomplete types
import pdfParse from 'pdf-parse';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * QuickCapture input structure
 */
export interface QuickCaptureInput {
  content?: string;      // Raw text
  filePath?: string;     // Path to .md or .pdf file
}

/**
 * QuickCapture Sub-agent
 * Uses the quick-note skill to intelligently process notes
 */
export class QuickCapture extends SubAgent<
  QuickCaptureConfig,
  QuickCaptureInput,
  ProcessedNote
> {
  /**
   * Validate input before processing
   */
  override async validate(input: QuickCaptureInput): Promise<Result<void>> {
    // If content is provided but empty
    if (input.content !== undefined && input.content.trim() === '') {
      return {
        success: false,
        error: new Error('Content cannot be empty'),
        message: 'Content cannot be empty',
      };
    }

    // Must have either content or filePath
    if (!input.content && !input.filePath) {
      return {
        success: false,
        error: new Error('Either content or filePath must be provided'),
        message: 'Input must contain either content or filePath',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  }

  /**
   * Execute note processing with LLM
   */
  async execute(input: QuickCaptureInput): Promise<Result<ProcessedNote>> {
    // Validate input
    const validationResult = await this.validate(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error,
        message: validationResult.message,
      };
    }

    try {
      logger.debug('QuickCapture processing input', {
        hasContent: !!input.content,
        hasFilePath: !!input.filePath,
      });

      // Extract content based on input type
      const extractResult = await this.extractContent(input);
      if (!extractResult.success) {
        return extractResult;
      }

      const { content, existingFrontmatter } = extractResult.data;

      // Process with LLM
      const llmResult = await this.processWithLLM(content);
      if (!llmResult.success) {
        return llmResult;
      }

      // Merge with existing frontmatter if available
      const processedNote = this.mergeFrontmatter(
        llmResult.data,
        existingFrontmatter
      );

      logger.info('QuickCapture completed', {
        title: processedNote.title,
        category: processedNote.category,
        tags: processedNote.tags.length,
      });

      return {
        success: true,
        data: processedNote,
      };
    } catch (error) {
      const errorMessage = `QuickCapture execution failed: ${
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
   * Extract content from input (raw text, markdown, or PDF)
   */
  private async extractContent(
    input: QuickCaptureInput
  ): Promise<
    Result<{
      content: string;
      existingFrontmatter?: Record<string, unknown>;
    }>
  > {
    // Raw text input
    if (input.content) {
      return {
        success: true,
        data: {
          content: input.content,
        },
      };
    }

    // File input
    if (input.filePath) {
      const ext = path.extname(input.filePath).toLowerCase();

      // Markdown file
      if (ext === '.md') {
        return this.extractFromMarkdown(input.filePath);
      }

      // PDF file
      if (ext === '.pdf') {
        return this.extractFromPDF(input.filePath);
      }

      return {
        success: false,
        error: new Error(`Unsupported file type: ${ext}`),
        message: `File type ${ext} is not supported. Use .md or .pdf`,
      };
    }

    return {
      success: false,
      error: new Error('No content or filePath provided'),
      message: 'Must provide either content or filePath',
    };
  }

  /**
   * Extract content from markdown file
   */
  private async extractFromMarkdown(
    filePath: string
  ): Promise<
    Result<{
      content: string;
      existingFrontmatter?: Record<string, unknown>;
    }>
  > {
    // Read file
    const readResult = await readFile(filePath);
    if (!readResult.success) {
      return {
        success: false,
        error: new Error(`File not found: ${filePath}`),
        message: `File not found: ${filePath}`,
      };
    }

    const markdown = readResult.data;

    // Parse frontmatter
    const frontmatterResult = parseFrontmatter(markdown);

    if (!frontmatterResult.success) {
      // If parsing fails, just use raw content
      logger.warn('Failed to parse frontmatter, using raw content', {
        filePath,
      });
      return {
        success: true,
        data: {
          content: markdown,
        },
      };
    }

    // Extract content (remove frontmatter section)
    const contentWithoutFrontmatter = markdown
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      .trim();

    return {
      success: true,
      data: {
        content: contentWithoutFrontmatter || markdown,
        existingFrontmatter: frontmatterResult.data,
      },
    };
  }

  /**
   * Extract text from PDF file
   */
  private async extractFromPDF(
    filePath: string
  ): Promise<
    Result<{
      content: string;
      existingFrontmatter?: Record<string, unknown>;
    }>
  > {
    try {
      // Read PDF file
      const dataBuffer = await fs.readFile(filePath);

      // Parse PDF
      const pdfData = await pdfParse(dataBuffer);

      if (!pdfData.text || pdfData.text.trim() === '') {
        return {
          success: false,
          error: new Error('PDF contains no extractable text'),
          message: 'No text could be extracted from PDF',
        };
      }

      logger.debug('PDF extracted', {
        filePath,
        pages: pdfData.numpages,
        textLength: pdfData.text.length,
      });

      return {
        success: true,
        data: {
          content: pdfData.text,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Failed to parse PDF'),
        message: `Failed to parse PDF: ${
          error instanceof Error ? error.message : 'Invalid PDF file'
        }`,
      };
    }
  }

  /**
   * Process content with LLM using quick-note skill
   * 
   * NOTE: This is a placeholder that simulates LLM behavior for testing.
   * In production, this would invoke the Pi session with the quick-note skill.
   */
  private async processWithLLM(
    content: string
  ): Promise<Result<ProcessedNote>> {
    // TODO: Integrate with Pi session to invoke quick-note skill
    // For now, return a simulated response for testing

    // Count words
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

    // Simple category detection
    let category = 'ideas';
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('trading') || lowerContent.includes('xauusd')) {
      category = 'trading';
    } else if (
      lowerContent.includes('learn') ||
      lowerContent.includes('study')
    ) {
      category = 'learning';
    } else if (
      lowerContent.includes('japanese') ||
      lowerContent.includes('kanji')
    ) {
      category = 'japanese';
    } else if (lowerContent.includes('meeting')) {
      category = 'meetings';
    } else if (lowerContent.includes('project')) {
      category = 'projects';
    }

    // Simple tag extraction (first few keywords)
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const tags = [...new Set(words.slice(0, 5))];

    // Generate title (first line or first 50 chars)
    const firstLine = content.split('\n')[0];
    const title = (
      firstLine.replace(/^#+\s*/, '').trim() ||
      content.substring(0, 50).trim()
    ).substring(0, 100);

    // Simulated LLM response
    const processedNote: ProcessedNote = {
      title: title || 'Untitled Note',
      content,
      category,
      tags,
      metadata: {
        timestamp: new Date().toISOString(),
        wordCount,
        hasLinks: content.includes('[['),
        confidence: (wordCount > 50 ? 'high' : 'medium') as NoteConfidence,
      },
    };

    logger.debug('LLM processing complete (simulated)', {
      title: processedNote.title,
      category: processedNote.category,
    });

    return {
      success: true,
      data: processedNote,
    };
  }

  /**
   * Merge LLM output with existing frontmatter
   */
  private mergeFrontmatter(
    llmNote: ProcessedNote,
    existingFrontmatter?: Record<string, unknown>
  ): ProcessedNote {
    if (!existingFrontmatter || Object.keys(existingFrontmatter).length === 0) {
      return llmNote;
    }

    // Merge strategy: prefer existing for some fields, LLM for others
    return {
      ...llmNote,
      title:
        (existingFrontmatter.title as string) || llmNote.title,
      category:
        (existingFrontmatter.category as string) || llmNote.category,
      subcategory:
        (existingFrontmatter.subcategory as string) || llmNote.subcategory,
      tags: existingFrontmatter.tags
        ? (existingFrontmatter.tags as string[])
        : llmNote.tags,
      relatedNotes: existingFrontmatter.related
        ? (existingFrontmatter.related as string[])
        : llmNote.relatedNotes,
    };
  }
}
