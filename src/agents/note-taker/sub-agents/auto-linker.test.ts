/**
 * AutoLinker Sub-agent Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutoLinker } from './auto-linker.js';
import type { ProcessedNote } from '../types.js';
import { NoteCategory, NoteConfidence } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('AutoLinker', () => {
  const testVaultPath = 'data/test-vault';
  let autoLinker: AutoLinker;

  beforeEach(async () => {
    // Create test vault
    await fs.mkdir(testVaultPath, { recursive: true });
    await fs.mkdir(path.join(testVaultPath, 'trading'), { recursive: true });
    
    // Create AutoLinker instance with lower threshold for short test notes
    autoLinker = new AutoLinker('AutoLinker', {
      similarityThreshold: 0.1, // Lower threshold for short notes
      maxLinksPerNote: 5,
      tfIdfMinDocFreq: 1,
      excludeCommonWords: true,
    });
    
    await autoLinker.initialize();
  });

  afterEach(async () => {
    autoLinker.cleanup();
    
    // Clean up test vault
    try {
      await fs.rm(testVaultPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('execute', () => {
    it('should add wiki-links to similar existing notes', async () => {
      // Create existing notes in vault
      const existingNote1 = `---
title: XAUUSD Analysis April 2026
tags: [trading, xauusd, gold]
category: trading
created: 2026-04-15T10:00:00Z
modified: 2026-04-15T10:00:00Z
---

# XAUUSD Analysis April 2026

Gold XAUUSD is showing strong support at 2000 level. Looking for breakout above 2050 resistance. This is a key trading opportunity for XAUUSD breakout strategy. The resistance level at 2050 has been tested multiple times.`;

      const existingNote2 = `---
title: Support and Resistance Levels
tags: [trading, technical-analysis]
category: trading
created: 2026-04-10T10:00:00Z
modified: 2026-04-10T10:00:00Z
---

# Support and Resistance Levels

Key levels to watch for trading: Support at 2000, resistance at 2050. Understanding resistance levels is crucial for breakout trading strategies. XAUUSD often respects these technical levels.`;

      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'xauusd-analysis-april-2026.md'),
        existingNote1
      );
      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'support-resistance.md'),
        existingNote2
      );

      // New note to process
      const newNote: ProcessedNote = {
        title: 'XAUUSD Breakout Strategy',
        content: 'Planning to trade XAUUSD breakout above 2050 resistance level. This trading strategy focuses on the key resistance at 2050 for gold. XAUUSD breakout patterns show strong potential when resistance is broken.',
        category: 'trading',
        tags: ['trading', 'xauusd', 'breakout'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 30,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      // Execute auto-linking
      const result = await autoLinker.execute(newNote);

      // Verify success
      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Should have added wiki-links
      expect(linkedNote.content).toContain('[[');
      expect(linkedNote.content).toContain(']]');

      // Should link to similar notes
      expect(
        linkedNote.content.includes('[[XAUUSD Analysis April 2026]]') ||
        linkedNote.content.includes('[[Support and Resistance Levels]]')
      ).toBe(true);

      // Should have "Related" section
      expect(linkedNote.content).toContain('## Related');

      // Metadata should show links added
      expect(linkedNote.metadata.hasLinks).toBe(true);
    });

    it('should respect maxLinksPerNote limit', async () => {
      // Create 10 existing notes
      for (let i = 1; i <= 10; i++) {
        const note = `---
title: Trading Note ${i}
tags: [trading]
category: trading
created: 2026-04-${String(i).padStart(2, '0')}T10:00:00Z
modified: 2026-04-${String(i).padStart(2, '0')}T10:00:00Z
---

Trading analysis number ${i} about XAUUSD and gold markets.`;

        await fs.writeFile(
          path.join(testVaultPath, 'trading', `trading-note-${i}.md`),
          note
        );
      }

      const newNote: ProcessedNote = {
        title: 'New Trading Analysis',
        content: 'Analysis of XAUUSD and gold markets.',
        category: 'trading',
        tags: ['trading'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 7,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Count wiki-links in Related section
      const relatedSection = linkedNote.content.split('## Related')[1] || '';
      const linkMatches = relatedSection.match(/\[\[.*?\]\]/g) || [];

      // Should not exceed maxLinksPerNote (5)
      expect(linkMatches.length).toBeLessThanOrEqual(5);
    });

    it('should only link notes above similarity threshold', async () => {
      // Create a completely unrelated note
      const unrelatedNote = `---
title: Japanese Grammar Lesson
tags: [japanese, grammar]
category: japanese
created: 2026-04-15T10:00:00Z
modified: 2026-04-15T10:00:00Z
---

Learning particles は and が in Japanese grammar.`;

      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'japanese-grammar.md'),
        unrelatedNote
      );

      const newNote: ProcessedNote = {
        title: 'XAUUSD Trading Strategy',
        content: 'Gold trading strategy for breakout above resistance.',
        category: 'trading',
        tags: ['trading', 'xauusd'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 8,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Should NOT link to unrelated Japanese note
      expect(linkedNote.content).not.toContain('[[Japanese Grammar Lesson]]');
    });

    it('should handle empty vault (no existing notes)', async () => {
      const newNote: ProcessedNote = {
        title: 'First Note',
        content: 'This is the very first note in the vault.',
        category: 'ideas',
        tags: ['first'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 9,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Should not have links (no existing notes to link to)
      expect(linkedNote.metadata.hasLinks).toBe(false);
      
      // Content should remain unchanged
      expect(linkedNote.content).toBe(newNote.content);
    });

    it('should preserve existing wiki-links in content', async () => {
      const existingNote = `---
title: Trading Psychology
tags: [trading, psychology]
category: trading
created: 2026-04-15T10:00:00Z
modified: 2026-04-15T10:00:00Z
---

Understanding trading psychology and risk management.`;

      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'trading-psychology.md'),
        existingNote
      );

      const newNote: ProcessedNote = {
        title: 'Risk Management Guide',
        content: 'See [[Trading Psychology]] for more on managing emotions. Risk management is crucial.',
        category: 'trading',
        tags: ['trading', 'risk'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 12,
          hasLinks: true,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Should preserve existing link
      expect(linkedNote.content).toContain('[[Trading Psychology]]');

      // Should still add Related section if similar notes found
      expect(linkedNote.metadata.hasLinks).toBe(true);
    });

    it('should not duplicate links', async () => {
      const existingNote1 = `---
title: Trading Psychology
tags: [trading, psychology]
category: trading
created: 2026-04-15T10:00:00Z
modified: 2026-04-15T10:00:00Z
---

# Trading Psychology

Understanding trading psychology and risk management is crucial. Trading psychology helps traders manage emotions and make better trading decisions. The psychology of markets affects trading behavior and success.`;

      const existingNote2 = `---
title: Risk Management Basics
tags: [trading, risk]
category: trading
created: 2026-04-10T10:00:00Z
modified: 2026-04-10T10:00:00Z
---

# Risk Management Basics

Risk management is essential for trading success. Proper risk management techniques help protect capital.`;

      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'trading-psychology.md'),
        existingNote1
      );
      
      await fs.writeFile(
        path.join(testVaultPath, 'trading', 'risk-management.md'),
        existingNote2
      );

      const newNote: ProcessedNote = {
        title: 'Psychology in Trading',
        content: 'Trading psychology is crucial for success. Understanding trading psychology helps manage emotions and make better decisions. The psychology of markets and trading mindset are key factors in risk management.',
        category: 'trading',
        tags: ['trading', 'psychology'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 30,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Count occurrences of the same link
      const linkPattern = /\[\[Trading Psychology\]\]/g;
      const matches = linkedNote.content.match(linkPattern) || [];

      // Should only appear once (in Related section)
      expect(matches.length).toBe(1);
    });

    it('should convert ProcessedNote to Note with proper types', async () => {
      const newNote: ProcessedNote = {
        title: 'Test Note',
        content: 'Test content',
        category: 'ideas',
        tags: ['test'],
        metadata: {
          timestamp: '2026-05-03T10:00:00Z',
          wordCount: 2,
          hasLinks: false,
          confidence: NoteConfidence.High,
        },
      };

      const result = await autoLinker.execute(newNote);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const linkedNote = result.data;

      // Verify Note structure
      expect(linkedNote.frontmatter).toBeDefined();
      expect(linkedNote.frontmatter.title).toBe('Test Note');
      expect(linkedNote.frontmatter.tags).toEqual(['test']);
      expect(linkedNote.frontmatter.category).toBe(NoteCategory.Ideas);
      expect(linkedNote.frontmatter.created).toBe('2026-05-03T10:00:00Z');
      expect(linkedNote.frontmatter.modified).toBe('2026-05-03T10:00:00Z');
      
      expect(linkedNote.metadata).toBeDefined();
      expect(linkedNote.metadata.timestamp).toBeInstanceOf(Date);
      expect(linkedNote.metadata.wordCount).toBe(2);
      expect(linkedNote.metadata.confidence).toBe(NoteConfidence.High);
    });
  });
});
