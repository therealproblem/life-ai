/**
 * AutoLinker Sub-agent
 * Finds related notes and adds wiki-links
 */

import { SubAgent } from '../../base/sub-agent.js';
import type { Result } from '../../../types.js';
import type { AutoLinkerConfig, ProcessedNote, Note } from '../types.js';

/**
 * AutoLinker Sub-agent
 * Uses TF-IDF to find similar notes and add [[wiki-links]]
 */
export class AutoLinker extends SubAgent<AutoLinkerConfig, ProcessedNote, Note> {
  /**
   * Execute auto-linking
   */
  async execute(input: ProcessedNote): Promise<Result<Note>> {
    // TODO: Implement AutoLinker logic
    // Will use TF-IDF tool to find similar notes
    // Will add [[wiki-links]] to content
    
    throw new Error('AutoLinker.execute() not yet implemented');
  }
}
