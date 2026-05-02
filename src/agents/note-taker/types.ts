/**
 * Type definitions for Note-taker Agent
 */

/**
 * Note categories (maps to folder structure)
 */
export enum NoteCategory {
  Trading = 'trading',
  Learning = 'learning',
  Japanese = 'japanese',
  Projects = 'projects',
  Meetings = 'meetings',
  Ideas = 'ideas',
  DailyNotes = 'daily-notes',
}

/**
 * Confidence level in categorization/processing
 */
export enum NoteConfidence {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

/**
 * Note frontmatter (YAML metadata)
 */
export interface NoteFrontmatter {
  title: string;
  tags: string[];
  category: NoteCategory;
  subcategory?: string;
  created: string; // ISO 8601 date
  modified: string; // ISO 8601 date
  related?: string[]; // Related note titles
  confidence?: NoteConfidence;
  [key: string]: unknown; // Allow additional custom fields
}

/**
 * Note metadata
 */
export interface NoteMetadata {
  timestamp: Date;
  wordCount: number;
  hasLinks: boolean;
  confidence: NoteConfidence;
  filePath?: string;
  fileName?: string;
}

/**
 * Complete note structure
 */
export interface Note {
  frontmatter: NoteFrontmatter;
  content: string;
  metadata: NoteMetadata;
}

/**
 * Wiki link structure
 */
export interface WikiLink {
  text: string; // The linked text (e.g., "Trading")
  target: string; // The note title to link to (e.g., "Trading Psychology")
  alias?: string; // Optional display alias
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Link suggestion from auto-linker
 */
export interface LinkSuggestion {
  original: string; // Original text
  suggestion: WikiLink;
  confidence: number; // 0-1 similarity score
  reason: string; // Why this link is suggested
}

/**
 * Knowledge graph node
 */
export interface GraphNode {
  id: string; // Unique identifier (usually note title or file path)
  title: string;
  category: NoteCategory;
  tags: string[];
  created: Date;
  modified: Date;
  backlinks: string[]; // IDs of notes linking to this one
  outlinks: string[]; // IDs of notes this one links to
  metadata?: Record<string, unknown>;
}

/**
 * Knowledge graph edge (connection between notes)
 */
export interface GraphEdge {
  from: string; // Source node ID
  to: string; // Target node ID
  weight: number; // Strength of connection (e.g., number of links)
  type: 'wikilink' | 'tag' | 'category' | 'related';
}

/**
 * Complete knowledge graph
 */
export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  lastUpdated: Date;
}

/**
 * Processed note (output from LLM/skill)
 * This is the JSON structure returned by the quick-note skill
 */
export interface ProcessedNote {
  title: string;
  content: string; // Content with wiki-links added
  category: string; // Will be converted to NoteCategory enum
  subcategory?: string;
  tags: string[];
  relatedNotes?: string[];
  metadata: {
    timestamp: string; // ISO 8601
    wordCount: number;
    hasLinks: boolean;
    confidence: NoteConfidence;
  };
}

/**
 * QuickCapture sub-agent configuration
 */
export interface QuickCaptureConfig {
  skillName: string; // Name of the Pi skill to use
  defaultCategory?: NoteCategory;
  minWordCount?: number;
  maxWordCount?: number;
}

/**
 * AutoLinker sub-agent configuration
 */
export interface AutoLinkerConfig {
  similarityThreshold: number; // 0-1, minimum similarity for auto-linking
  maxLinksPerNote: number; // Maximum wiki-links to add
  tfIdfMinDocFreq: number; // Minimum document frequency for TF-IDF
  excludeCommonWords: boolean; // Filter out common words
}

/**
 * Organizer sub-agent configuration
 */
export interface OrganizerConfig {
  vaultPath: string; // Path to Obsidian vault
  createSubfolders: boolean; // Auto-create subcategory folders
  overwriteExisting: boolean; // Overwrite if file exists
  addTimestamp: boolean; // Add timestamp to filename
}

/**
 * KnowledgeGraph sub-agent configuration
 */
export interface KnowledgeGraphConfig {
  graphPath: string; // Path to save graph JSON
  autoUpdate: boolean; // Auto-update on note changes
  includeBacklinks: boolean; // Track backlinks
  minEdgeWeight: number; // Minimum weight to include edge
}

/**
 * Note-taker agent configuration (sub-agent configs only)
 */
export interface NoteTakerConfig {
  vaultPath: string;
  quickCapture: QuickCaptureConfig;
  autoLinker: AutoLinkerConfig;
  organizer: OrganizerConfig;
  knowledgeGraph: KnowledgeGraphConfig;
}

import type { AgentConfig } from '../../types.js';

/**
 * Complete Note-taker agent configuration
 * Extends base AgentConfig with Note-taker specific settings
 */
export interface NoteTakerAgentConfig extends AgentConfig {
  vaultPath: string;
  quickCapture: QuickCaptureConfig;
  autoLinker: AutoLinkerConfig;
  organizer: OrganizerConfig;
  knowledgeGraph: KnowledgeGraphConfig;
}

/**
 * Result of note capture operation
 */
export interface CaptureResult {
  note: Note;
  filePath: string;
  wikiLinksAdded: number;
  relatedNotesFound: number;
  graphUpdated: boolean;
}
