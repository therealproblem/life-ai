/**
 * Base Agent class for all Life AI agents
 * Uses Pi SDK for LLM session management
 */

import {
  createAgentSession,
  type AgentSession,
  SessionManager,
} from '@mariozechner/pi-coding-agent';
import { z } from 'zod';
import type {
  AgentConfig,
  AgentContext,
  AgentRequest,
  AgentResponse,
  Result,
} from '../../types.js';
import { logger } from '../../utils/logger.js';

/**
 * Zod schema for AgentContext
 */
const AgentContextSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  conversationHistory: z.array(z.any()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for AgentRequest
 */
export const AgentRequestSchema = z.object({
  input: z.string().min(1, 'Input cannot be empty'),
  context: AgentContextSchema.optional(),
  attachments: z.array(z.string()).optional(),
  id: z.string().optional(),
  timestamp: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for AgentResponse
 */
export const AgentResponseSchema = z.object({
  output: z.string(),
  artifacts: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  id: z.string().optional(),
  timestamp: z.date().optional(),
  status: z.enum(['success', 'partial', 'error']).optional(),
  tokens: z
    .object({
      prompt: z.number(),
      completion: z.number(),
    })
    .optional(),
});

/**
 * Base Agent class
 * All specialized agents extend this
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected session: AgentSession;

  /**
   * Private constructor - use create() factory method
   */
  private constructor(config: AgentConfig, session: AgentSession) {
    this.config = config;
    this.session = session;
  }

  /**
   * Factory method to create an agent instance
   */
  static async create<T extends BaseAgent>(
    this: new (config: AgentConfig, session: AgentSession) => T,
    config: AgentConfig
  ): Promise<Result<T>> {
    try {
      logger.info('Creating agent', { name: config.name });

      // Create session directory path
      const sessionPath = `data/sessions/${config.name.toLowerCase().replace(/\s+/g, '-')}`;

      const cwd = process.cwd();

      // Create Pi agent session with read-only tools
      const { session } = await createAgentSession({
        cwd,
        tools: ['read', 'grep', 'find', 'ls'],
        sessionManager: SessionManager.create(sessionPath),
      });

      logger.info('Agent session created', { name: config.name });

      // Create instance using the subclass constructor
      const instance = new this(config, session);

      return {
        success: true,
        data: instance,
      };
    } catch (error) {
      const errorMessage = `Failed to create agent: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage, { name: config.name });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        message: errorMessage,
      };
    }
  }

  /**
   * Abstract execute method - implemented by subclasses
   */
  abstract execute(request: AgentRequest): Promise<Result<AgentResponse>>;

  /**
   * Send a prompt to the Pi session
   */
  protected async prompt(message: string): Promise<void> {
    logger.debug('Sending prompt', { agent: this.config.name, message });
    await this.session.prompt(message);
  }

  /**
   * Cleanup agent resources
   */
  dispose(): void {
    logger.info('Disposing agent', { name: this.config.name });
    this.session.dispose();
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get agent description
   */
  getDescription(): string {
    return this.config.description;
  }
}
