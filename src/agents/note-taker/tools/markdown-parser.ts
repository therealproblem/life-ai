/**
 * Markdown Parser Tool
 * Parses markdown files to extract frontmatter and special content blocks
 */

import matter from 'gray-matter';
import type { Result } from '../../../types.js';
import { logger } from '../../../utils/logger.js';

/**
 * Mermaid diagram block
 */
export interface MermaidBlock {
  content: string;
  startLine: number;
}

/**
 * Math block (LaTeX)
 */
export interface MathBlock {
  content: string;
  type: 'inline' | 'block';
  startIndex: number;
}

/**
 * Code block
 */
export interface CodeBlock {
  content: string;
  language?: string;
  startLine: number;
}

/**
 * Image reference
 */
export interface ImageReference {
  altText: string;
  path: string;
  startIndex: number;
}

/**
 * Parsed note structure
 */
export interface ParsedNote {
  frontmatter: Record<string, unknown>;
  content: string;
  contentWithoutSpecialBlocks: string;
  mermaidBlocks: MermaidBlock[];
  mathBlocks: MathBlock[];
  codeBlocks: CodeBlock[];
  inlineCode: string[];
  images: ImageReference[];
}

/**
 * Parse frontmatter from markdown
 * Uses gray-matter to extract YAML frontmatter
 */
export function parseFrontmatter(
  markdown: string
): Result<Record<string, unknown>> {
  try {
    const parsed = matter(markdown);
    
    logger.debug('Frontmatter parsed', {
      hasData: Object.keys(parsed.data).length > 0,
    });
    
    return {
      success: true,
      data: parsed.data,
    };
  } catch (error) {
    const errorMessage = `Failed to parse frontmatter: ${
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
 * Extract mermaid diagram blocks
 * Finds ```mermaid code blocks
 */
export function extractMermaidBlocks(content: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  const lines = content.split('\n');
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const mermaidContent = match[1].trim();
    
    // Find the line number where this block starts
    const beforeMatch = content.substring(0, match.index);
    const startLine = beforeMatch.split('\n').length;
    
    blocks.push({
      content: mermaidContent,
      startLine,
    });
  }
  
  logger.debug('Mermaid blocks extracted', { count: blocks.length });
  return blocks;
}

/**
 * Extract LaTeX math blocks
 * Finds both inline ($...$) and block ($$...$$) math
 */
export function extractMathBlocks(content: string): MathBlock[] {
  const blocks: MathBlock[] = [];
  
  // Block math: $$...$$
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let match;
  
  while ((match = blockRegex.exec(content)) !== null) {
    blocks.push({
      content: match[1].trim(),
      type: 'block',
      startIndex: match.index,
    });
  }
  
  // Inline math: $...$
  // Need to avoid matching block math ($$)
  const inlineRegex = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;
  
  while ((match = inlineRegex.exec(content)) !== null) {
    blocks.push({
      content: match[1].trim(),
      type: 'inline',
      startIndex: match.index,
    });
  }
  
  logger.debug('Math blocks extracted', {
    inline: blocks.filter((b) => b.type === 'inline').length,
    block: blocks.filter((b) => b.type === 'block').length,
  });
  
  return blocks;
}

/**
 * Extract fenced code blocks
 * Finds ```language blocks
 */
export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const language = match[1] || undefined;
    const codeContent = match[2].trim();
    
    // Skip mermaid blocks (handled separately)
    if (language === 'mermaid') {
      continue;
    }
    
    // Find the line number where this block starts
    const beforeMatch = content.substring(0, match.index);
    const startLine = beforeMatch.split('\n').length;
    
    blocks.push({
      content: codeContent,
      language,
      startLine,
    });
  }
  
  logger.debug('Code blocks extracted', { count: blocks.length });
  return blocks;
}

/**
 * Extract inline code
 * Finds `code` snippets
 */
export function extractInlineCode(content: string): string[] {
  const inlineCode: string[] = [];
  const regex = /`([^`]+)`/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    inlineCode.push(match[1]);
  }
  
  logger.debug('Inline code extracted', { count: inlineCode.length });
  return inlineCode;
}

/**
 * Extract image references
 * Finds ![alt](path) markdown images
 */
export function extractImages(content: string): ImageReference[] {
  const images: ImageReference[] = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    images.push({
      altText: match[1],
      path: match[2],
      startIndex: match.index,
    });
  }
  
  logger.debug('Images extracted', { count: images.length });
  return images;
}

/**
 * Remove special blocks from content
 * Used to create clean text for TF-IDF similarity matching
 */
function removeSpecialBlocks(content: string): string {
  let cleaned = content;
  
  // Remove code blocks (including mermaid)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  
  // Remove block math
  cleaned = cleaned.replace(/\$\$[\s\S]*?\$\$/g, '');
  
  // Remove inline math
  cleaned = cleaned.replace(/\$[^$]+\$/g, '');
  
  // Remove inline code
  cleaned = cleaned.replace(/`[^`]+`/g, '');
  
  // Remove images (but keep alt text as it might be meaningful)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n\n+/g, '\n\n').trim();
  
  return cleaned;
}

/**
 * Parse a complete markdown note
 * Extracts frontmatter and all special content blocks
 */
export function parseNote(markdown: string): Result<ParsedNote> {
  try {
    // Parse frontmatter
    const matterResult = matter(markdown);
    const frontmatter = matterResult.data;
    const content = matterResult.content;
    
    // Extract all special blocks
    const mermaidBlocks = extractMermaidBlocks(content);
    const mathBlocks = extractMathBlocks(content);
    const codeBlocks = extractCodeBlocks(content);
    const inlineCode = extractInlineCode(content);
    const images = extractImages(content);
    
    // Create cleaned content for TF-IDF
    const contentWithoutSpecialBlocks = removeSpecialBlocks(content);
    
    logger.debug('Note parsed successfully', {
      hasFrontmatter: Object.keys(frontmatter).length > 0,
      contentLength: content.length,
      cleanedLength: contentWithoutSpecialBlocks.length,
      blocks: {
        mermaid: mermaidBlocks.length,
        math: mathBlocks.length,
        code: codeBlocks.length,
        inlineCode: inlineCode.length,
        images: images.length,
      },
    });
    
    return {
      success: true,
      data: {
        frontmatter,
        content,
        contentWithoutSpecialBlocks,
        mermaidBlocks,
        mathBlocks,
        codeBlocks,
        inlineCode,
        images,
      },
    };
  } catch (error) {
    const errorMessage = `Failed to parse note: ${
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
