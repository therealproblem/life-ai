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
 * 
 * @template TConfig - Agent-specific configuration type extending AgentConfig
 */
export abstract class BaseAgent<TConfig extends AgentConfig = AgentConfig> {
  protected config: TConfig;
  protected session: AgentSession;

  /**
   * Protected constructor - use create() factory method
   * Protected allows subclasses to extend properly
   */
  protected constructor(config: TConfig, session: AgentSession) {
    this.config = config;
    this.session = session;
  }

  /**
   * Factory method to create an agent instance
   * 
   * MUST be overridden by subclasses with their specific implementation.
   * This base implementation throws an error to enforce the pattern.
   * 
   * @template C - The config type extending AgentConfig
   */
  static async create<C extends AgentConfig = AgentConfig>(
    config: C
  ): Promise<Result<BaseAgent>> {
    const error = new Error(
      `create() must be implemented by subclass. ` +
      `BaseAgent is abstract and cannot be instantiated directly.`
    );
    
    logger.error('Attempted to call BaseAgent.create() directly', {
      name: config.name,
    });
    
    return {
      success: false,
      error,
      message: error.message,
    };
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
