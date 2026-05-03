/**
 * Note-taker Agent
 * Intelligent note processing with auto-tagging, linking, and organization
 */

import {
  createAgentSession,
  type AgentSession,
  SessionManager,
} from '@mariozechner/pi-coding-agent';
import { BaseAgent } from '../base/agent.js';
import type { AgentRequest, AgentResponse, Result } from '../../types.js';
import { logger } from '../../utils/logger.js';
import type {
  NoteTakerAgentConfig,
  CaptureResult,
  Note,
  ProcessedNote,
} from './types.js';
import { NoteCategory } from './types.js';
import { QuickCapture } from './sub-agents/quick-capture.js';
import { AutoLinker } from './sub-agents/auto-linker.js';
import { Organizer } from './sub-agents/organizer.js';
import { KnowledgeGraph } from './sub-agents/knowledge-graph.js';

/**
 * Note-taker Agent
 * Processes user notes with intelligent tagging, linking, and organization
 */
// @ts-expect-error - Intentional create() signature override with more specific config type
export class NoteTakerAgent extends BaseAgent<NoteTakerAgentConfig> {
  private quickCapture: QuickCapture;
  private autoLinker: AutoLinker;
  private organizer: Organizer;
  private knowledgeGraph: KnowledgeGraph;

  /**
   * Private constructor - use create() factory method
   */
  private constructor(
    config: NoteTakerAgentConfig,
    session: AgentSession,
    subAgents: {
      quickCapture: QuickCapture;
      autoLinker: AutoLinker;
      organizer: Organizer;
      knowledgeGraph: KnowledgeGraph;
    }
  ) {
    // Call parent constructor
    super(config, session);
    
    // Store sub-agents
    this.quickCapture = subAgents.quickCapture;
    this.autoLinker = subAgents.autoLinker;
    this.organizer = subAgents.organizer;
    this.knowledgeGraph = subAgents.knowledgeGraph;
  }

  /**
   * Factory method to create NoteTakerAgent instance
   * Overrides BaseAgent.create() with NoteTaker-specific config
   */
  static async create(
    config: NoteTakerAgentConfig
  ): Promise<Result<NoteTakerAgent>> {
    try {
      logger.info('Creating NoteTakerAgent', { name: config.name });

      // Create session directory path
      const sessionPath = `data/sessions/${config.name.toLowerCase().replace(/\s+/g, '-')}`;
      const cwd = process.cwd();

      // Create Pi agent session with write capabilities
      const { session } = await createAgentSession({
        cwd,
        tools: ['read', 'write', 'grep', 'find', 'ls'],
        sessionManager: SessionManager.create(sessionPath),
      });

      logger.info('Pi session created for NoteTakerAgent');

      // Create and initialize sub-agents
      logger.debug('Creating sub-agents');

      const quickCapture = new QuickCapture(
        'QuickCapture',
        config.quickCapture
      );
      await quickCapture.initialize();

      const autoLinker = new AutoLinker(
        'AutoLinker',
        config.autoLinker
      );
      await autoLinker.initialize();

      const organizer = new Organizer(
        'Organizer',
        config.organizer
      );
      await organizer.initialize();

      const knowledgeGraph = new KnowledgeGraph(
        'KnowledgeGraph',
        config.knowledgeGraph
      );
      await knowledgeGraph.initialize();

      logger.info('All sub-agents initialized');

      // Create NoteTakerAgent instance
      const agent = new NoteTakerAgent(
        config,
        session,
        {
          quickCapture,
          autoLinker,
          organizer,
          knowledgeGraph,
        }
      );

      return {
        success: true,
        data: agent,
      };
    } catch (error) {
      const errorMessage = `Failed to create NoteTakerAgent: ${
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
   * Execute note capture and processing
   * Orchestrates all sub-agents to process user input into organized notes
   */
  async execute(request: AgentRequest): Promise<Result<AgentResponse>> {
    try {
      logger.info('NoteTakerAgent executing', { input: request.input });

      // Step 1: Use LLM (via Pi session) to process the note with quick-note skill
      // This will use the skill to extract tags, category, links, etc.
      logger.debug('Step 1: Processing note with LLM');
      const quickCaptureResult = await this.quickCapture.run({
        content: request.input,
      });
      
      if (!quickCaptureResult.success) {
        return {
          success: false,
          error: quickCaptureResult.error,
          message: `QuickCapture failed: ${quickCaptureResult.message}`,
        };
      }

      const processedNote = quickCaptureResult.data;
      logger.debug('Note processed', { title: processedNote.title });

      // Step 2: Auto-link to existing notes
      logger.debug('Step 2: Auto-linking to existing notes');
      const autoLinkerResult = await this.autoLinker.run(processedNote);
      
      let linkedNote: Note;
      
      if (!autoLinkerResult.success) {
        logger.warn('Auto-linking failed, creating basic note structure', {
          error: autoLinkerResult.message,
        });
        
        // Convert ProcessedNote to Note if auto-linking failed
        linkedNote = this.processedNoteToNote(processedNote);
      } else {
        linkedNote = autoLinkerResult.data;
      }

      // Step 3: Organize and save the note
      logger.debug('Step 3: Organizing and saving note');
      const organizerResult = await this.organizer.run(linkedNote);
      
      if (!organizerResult.success) {
        return {
          success: false,
          error: organizerResult.error,
          message: `Organizer failed: ${organizerResult.message}`,
        };
      }

      const savedNote = organizerResult.data;
      logger.debug('Note saved', { path: savedNote.metadata.filePath });

      // Step 4: Update knowledge graph
      logger.debug('Step 4: Updating knowledge graph');
      const graphResult = await this.knowledgeGraph.run(savedNote);
      
      if (!graphResult.success) {
        logger.warn('Graph update failed, continuing', {
          error: graphResult.message,
        });
      }

      // Build capture result
      const captureResult: CaptureResult = {
        note: savedNote,
        filePath: savedNote.metadata.filePath || '',
        wikiLinksAdded: linkedNote.content.match(/\[\[.*?\]\]/g)?.length || 0,
        relatedNotesFound: processedNote.relatedNotes?.length || 0,
        graphUpdated: graphResult.success,
      };

      logger.info('Note capture completed', {
        title: savedNote.frontmatter.title,
        path: captureResult.filePath,
      });

      // Return response
      return {
        success: true,
        data: {
          output: `Note captured successfully: ${savedNote.frontmatter.title}`,
          artifacts: [captureResult.filePath],
          metadata: {
            captureResult,
            wikiLinksAdded: captureResult.wikiLinksAdded,
            relatedNotesFound: captureResult.relatedNotesFound,
            graphUpdated: captureResult.graphUpdated,
          },
          status: 'success',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const errorMessage = `NoteTakerAgent execution failed: ${
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
   * Helper to convert ProcessedNote to Note structure
   */
  private processedNoteToNote(processedNote: ProcessedNote): Note {
    return {
      frontmatter: {
        title: processedNote.title,
        tags: processedNote.tags,
        category: processedNote.category as any, // Will be validated
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
   * Cleanup agent and sub-agents
   */
  override dispose(): void {
    logger.info('Disposing NoteTakerAgent');
    
    // Cleanup sub-agents
    this.quickCapture.cleanup();
    this.autoLinker.cleanup();
    this.organizer.cleanup();
    this.knowledgeGraph.cleanup();
    
    // Cleanup base agent (Pi session)
    super.dispose();
  }
}
