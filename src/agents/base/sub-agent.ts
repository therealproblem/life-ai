/**
 * Base SubAgent class for specialized helper modules
 * SubAgents do NOT have their own LLM session - they perform focused tasks
 */

import type { Result } from '../../types.js';
import { logger } from '../../utils/logger.js';

/**
 * Base SubAgent class with generic configuration
 * Each subclass can define its own config type
 */
export abstract class SubAgent<TConfig = Record<string, unknown>, TInput = unknown, TOutput = unknown> {
  protected config: TConfig;
  private name: string;

  /**
   * Constructor
   * @param name - SubAgent name
   * @param config - SubAgent-specific configuration
   */
  constructor(name: string, config: TConfig) {
    this.name = name;
    this.config = config;
  }

  /**
   * Initialize the sub-agent
   * Override this to perform setup (load files, validate config, etc.)
   * Default implementation does nothing
   */
  async initialize(): Promise<Result<void>> {
    logger.debug('SubAgent initializing', { name: this.name });
    return { success: true, data: undefined };
  }

  /**
   * Validate input before execution
   * Override this to add input validation
   * Default implementation accepts all input
   */
  async validate(input: TInput): Promise<Result<void>> {
    logger.debug('SubAgent validating input', { name: this.name });
    return { success: true, data: undefined };
  }

  /**
   * Execute the sub-agent's main task
   * Must be implemented by subclasses
   */
  abstract execute(input: TInput): Promise<Result<TOutput>>;

  /**
   * Handle errors during execution
   * Override this to customize error handling
   * Default implementation logs the error
   */
  protected async onError(error: Error): Promise<void> {
    logger.error('SubAgent error', {
      name: this.name,
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Cleanup resources
   * Override this to perform teardown (close connections, flush buffers, etc.)
   * Default implementation does nothing
   */
  async cleanup(): Promise<void> {
    logger.debug('SubAgent cleaning up', { name: this.name });
  }

  /**
   * Get sub-agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get sub-agent configuration
   */
  getConfig(): TConfig {
    return this.config;
  }

  /**
   * Execute with full lifecycle (validate → execute → handle errors)
   * This is a convenience method that wraps the full flow
   */
  async run(input: TInput): Promise<Result<TOutput>> {
    try {
      // Validate input
      const validationResult = await this.validate(input);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
          message: `Validation failed: ${validationResult.message}`,
        };
      }

      // Execute
      const result = await this.execute(input);
      
      if (!result.success) {
        await this.onError(result.error);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await this.onError(err);
      
      return {
        success: false,
        error: err,
        message: `SubAgent execution failed: ${err.message}`,
      };
    }
  }
}
