/**
 * QuickCapture Sub-agent
 * Processes raw user input with LLM to extract tags, category, and links
 */

import { SubAgent } from '../../base/sub-agent.js';
import type { Result } from '../../../types.js';
import type { QuickCaptureConfig, ProcessedNote } from '../types.js';

/**
 * QuickCapture Sub-agent
 * Uses the quick-note skill to intelligently process notes
 */
export class QuickCapture extends SubAgent<QuickCaptureConfig, string, ProcessedNote> {
  /**
   * Execute note processing with LLM
   */
  async execute(input: string): Promise<Result<ProcessedNote>> {
    // TODO: Implement QuickCapture logic
    // Will use Pi session to invoke quick-note skill
    
    throw new Error('QuickCapture.execute() not yet implemented');
  }
}
