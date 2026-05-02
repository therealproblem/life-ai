/**
 * Shared type definitions for Life AI
 */

/**
 * Result type for explicit error handling
 * Every operation should return Result<T> instead of throwing
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error; message: string };

/**
 * Agent status
 */
export type AgentStatus = 'idle' | 'processing' | 'waiting' | 'error';

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  name: string;
  description: string;
  modelTier?: 'tier1' | 'tier2' | 'tier3' | 'local';
  temperature?: number;
  maxTokens?: number;
}

/**
 * Message between agents or user
 */
export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Agent execution context
 */
export interface AgentContext {
  userId?: string;
  sessionId?: string;
  conversationHistory?: Message[];
  metadata?: Record<string, unknown>;
}

/**
 * Agent request structure
 */
export interface AgentRequest {
  input: string;
  context?: AgentContext;
  attachments?: string[];
  id?: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  output: string;
  artifacts?: string[];
  metadata?: Record<string, unknown>;
  id?: string;
  timestamp?: Date;
  status?: 'success' | 'partial' | 'error';
  tokens?: {
    prompt: number;
    completion: number;
  };
}
