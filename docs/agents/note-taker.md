# Note-taker Agent 📝

**Status:** ✅ Implemented  
**Implementation:** `src/agents/note-taker/`  
**Tests:** 13/13 passing

---

## Purpose

Obsidian vault management, auto-linking, and knowledge graph construction.

---

## Responsibilities

- Quick note capture
- Auto-generate titles and tags
- Create `[[wiki-links]]` between related notes
- Organize notes into folders
- Build knowledge graph
- Process voice transcripts
- Weekly summaries

---

## Sub-agents

### 1. QuickCapture ✅
**Implemented:** `src/agents/note-taker/sub-agents/quick-capture.ts`

**Responsibilities:**
- Parse raw input (text, markdown, or transcript)
- Extract YAML frontmatter
- Generate titles if missing
- Extract tags
- Clean formatting

**Example:**
```
Input: "Trading idea: XAUUSD breakout above 2050..."

Output:
---
title: Trading Idea - XAUUSD Breakout
tags: [trading, xauusd, breakout]
created: 2026-05-03T10:30:00Z
---

Trading idea: XAUUSD breakout above 2050...
```

---

### 2. AutoLinker ✅
**Implemented:** `src/agents/note-taker/sub-agents/auto-linker.ts`

**Responsibilities:**
- Find related notes using TF-IDF similarity
- Insert `[[wiki-links]]` to related notes
- Avoid over-linking (top 3-5 most relevant)
- Preserve existing links

**Algorithm:**
1. Extract keywords from new note (TF-IDF)
2. Compare with all existing notes
3. Rank by similarity score
4. Insert top 3-5 as wiki-links
5. Deduplicate links

**Example:**
```
Input: "XAUUSD support level at 2000..."

AutoLinker finds:
- [[Trading Strategy - Support and Resistance]]
- [[XAUUSD Analysis - April 2026]]
- [[Risk Management - Position Sizing]]

Output: Note with inserted links
```

---

### 3. Organizer ✅
**Implemented:** `src/agents/note-taker/sub-agents/organizer.ts`

**Responsibilities:**
- Categorize notes by content
- Save to appropriate folder
- Handle collisions (append timestamp)
- Create folders if needed

**Categories:**
- `trading/` - Trading analysis, journal, strategies
- `learning/` - Learning notes, curricula
- `japanese/` - Language learning
- `projects/` - Project docs, specs
- `meetings/` - Meeting notes
- `ideas/` - Quick thoughts
- `daily-notes/` - Daily journal

**Example:**
```
Note with tags: [trading, xauusd]
→ Saved to: data/obsidian-vault/trading/trading-idea-xauusd-breakout.md
```

---

### 4. KnowledgeGraph ✅
**Implemented:** `src/agents/note-taker/sub-agents/knowledge-graph.ts`

**Responsibilities:**
- Build graph from vault notes
- Detect wiki-links
- Track connections
- Export to JSON
- Enable graph queries

**Graph Structure:**
```json
{
  "nodes": [
    {
      "id": "trading-strategy-support-resistance",
      "title": "Trading Strategy - Support and Resistance",
      "path": "trading/trading-strategy-support-resistance.md",
      "tags": ["trading", "technical-analysis"]
    }
  ],
  "edges": [
    {
      "source": "trading-strategy-support-resistance",
      "target": "xauusd-analysis-april-2026",
      "type": "wiki-link"
    }
  ]
}
```

**Queries:**
- Find connected notes
- Find orphan notes (no links)
- Find hub notes (many connections)
- Path between two notes

---

## Technology

- **NLP:** natural library (TF-IDF, tokenization)
- **Frontmatter:** gray-matter (YAML parsing)
- **File ops:** Node.js fs/promises
- **Graph:** Custom implementation (NetworkX-inspired)

---

## Workflow Example

```
User: "Quick note: Trading setup for XAUUSD..."

1. QuickCapture parses input
   → Generates title, tags

2. AutoLinker finds related notes
   → Inserts [[links]] to 3 similar notes

3. Organizer determines category
   → Saves to trading/

4. KnowledgeGraph updates
   → Adds node and edges

Output saved to:
  data/obsidian-vault/trading/trading-setup-xauusd-2026-05-03.md
```

---

## Future Enhancements

- [ ] Voice transcript processing
- [ ] Semantic search (vector embeddings)
- [ ] Weekly summaries
- [ ] Duplicate detection
- [ ] Graph visualization
- [ ] Bi-directional link updates

---

**See also:**
- [Implementation Status](../../IMPLEMENTATION_STATUS.md) - Current progress
- [Test Coverage](../../tests/unit/agents/note-taker.test.ts) - 13 tests
- [Agent Overview](overview.md) - All agents
