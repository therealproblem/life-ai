---
name: quick-note
description: Intelligent note processing with automatic tagging, linking, and organization
version: 1.0.0
author: Life AI
---

# Quick Note Skill

## Purpose

Process user notes intelligently by:
- Extracting meaningful tags from content
- Identifying related existing notes for wiki-linking
- Determining the appropriate category/folder
- Generating a clear, descriptive title
- Adding relevant metadata

## Input Format

User provides raw note content in natural language:
- Single sentence or multiple paragraphs
- May include explicit tags (e.g., "#trading #psychology")
- May reference topics that should link to existing notes
- May be voice transcription (less structured)

**Examples:**
```
"Note: Trading psychology is crucial. Fear and greed drive most losses."
"I learned about React hooks today - useState and useEffect are powerful"
"Meeting with Sarah about Q2 roadmap. Priority: mobile app launch"
```

## Processing Steps

### 1. Content Analysis

Analyze the note content to understand:
- **Main topic**: What is this note primarily about?
- **Key concepts**: What are the important ideas mentioned?
- **Context**: Is this related to work, learning, trading, personal development?
- **Tone**: Is it a fact, observation, idea, task, or meeting note?

### 2. Tag Extraction

Extract tags using these strategies:

**Explicit tags** (user-provided):
- Look for `#tagname` patterns
- Extract and clean (remove #, lowercase)

**Implicit tags** (content-derived):
- Identify main topics (nouns, key concepts)
- Include domain-specific terms (e.g., "XAUUSD", "React", "product roadmap")
- Limit to 3-5 most relevant tags
- Prefer specific over generic (e.g., "technical-analysis" not "trading")

**Tag guidelines:**
- Use lowercase with hyphens (e.g., "machine-learning")
- Be consistent (use existing tags when possible)
- Avoid redundancy (don't tag "trading" and "day-trading" for same note)

### 3. Category Detection

Map notes to appropriate folders based on content:

**Categories:**
- `trading/` - Trading analysis, strategies, journal entries, market insights
- `learning/` - Educational content, tutorials, courses, study notes
- `japanese/` - Language learning, vocabulary, grammar, practice
- `projects/` - Work projects, requirements, technical specs, decisions
- `meetings/` - Meeting notes, discussions, action items
- `ideas/` - Random thoughts, brainstorming, future possibilities
- `daily-notes/` - Daily journal, reflections, personal logs

**Detection rules:**
- Keywords: "trade", "XAUUSD", "position" → `trading/`
- Keywords: "learn", "study", "tutorial", "understand" → `learning/`
- Keywords: "kanji", "vocabulary", "JLPT", "Japanese" → `japanese/`
- Keywords: "meeting", "discussed", "team", "agenda" → `meetings/`
- Keywords: "project", "requirement", "feature", "spec" → `projects/`
- Keywords: "idea", "maybe", "could", "what if" → `ideas/`
- Mentions dates/today/reflection → `daily-notes/`
- Default (unclear) → `ideas/`

**Subcategories:**
- For `trading/`: Could be `trading/analysis/`, `trading/journal/`, `trading/strategies/`
- For `learning/`: Could be `learning/programming/`, `learning/psychology/`
- Use subcategories when topic is clear

### 4. Title Generation

Create a clear, descriptive title:

**Guidelines:**
- 3-8 words
- Descriptive but concise
- Capture main topic
- Use title case
- No special characters except hyphens

**Examples:**
```
Input: "Trading psychology is crucial..."
Title: "Trading Psychology and Emotional Control"

Input: "I learned about React hooks today..."
Title: "React Hooks - useState and useEffect"

Input: "Meeting with Sarah about Q2 roadmap..."
Title: "Q2 Roadmap Planning - Sarah"
```

### 5. Wiki-Link Suggestions

Identify concepts that should link to other notes:

**Link when:**
- Concept is a major topic (e.g., "Trading", "React", "Psychology")
- Likely to have or need its own note
- Referenced multiple times across notes
- Part of a knowledge domain

**Link format:**
- Use `[[Note Title]]` syntax
- Match existing note titles when possible
- Create new links for new concepts

**Examples:**
```
"Trading psychology is crucial" 
→ "[[Trading]] [[Psychology]] is crucial"

"React hooks like useState are powerful"
→ "[[React]] hooks like [[useState]] are powerful"
```

**Don't over-link:**
- Skip common words (and, the, is, etc.)
- Skip very general terms unless they're main topics
- Typically 2-5 links per note

### 6. Related Notes Detection

Suggest existing notes that are related:

**Similarity signals:**
- Shared tags
- Similar topics/keywords
- Same category
- Explicit references

**Output format:**
```json
"relatedNotes": [
  "Trading Strategy Framework",
  "Psychology of Risk Management"
]
```

## Output Format

Return a JSON object with this structure:

```json
{
  "title": "Trading Psychology and Emotional Control",
  "content": "[[Trading]] [[Psychology]] is crucial. Fear and greed drive most losses.",
  "category": "trading",
  "subcategory": "journal",
  "tags": ["trading", "psychology", "emotions", "risk-management"],
  "relatedNotes": [
    "Trading Strategy Framework",
    "Psychology of Risk Management"
  ],
  "metadata": {
    "timestamp": "2026-05-03T10:30:00Z",
    "wordCount": 12,
    "hasLinks": true,
    "confidence": "high"
  }
}
```

## Field Specifications

### `title` (required)
- Type: string
- Clear, descriptive title (3-8 words)
- Title case

### `content` (required)
- Type: string
- Original content with `[[wiki-links]]` added
- Preserve user's wording, only add links

### `category` (required)
- Type: string
- One of: `trading`, `learning`, `japanese`, `projects`, `meetings`, `ideas`, `daily-notes`

### `subcategory` (optional)
- Type: string
- Specific subfolder within category
- Examples: `analysis`, `journal`, `programming`, `grammar`

### `tags` (required)
- Type: array of strings
- 3-5 relevant tags
- Lowercase with hyphens
- Specific over generic

### `relatedNotes` (optional)
- Type: array of strings
- Titles of existing notes that are related
- Leave empty if no obvious relations

### `metadata` (required)
- Type: object
- `timestamp`: ISO 8601 format
- `wordCount`: Number of words in content
- `hasLinks`: Boolean, true if wiki-links were added
- `confidence`: "high", "medium", or "low" - how confident in the categorization

## Examples

### Example 1: Trading Note

**Input:**
```
"Note: XAUUSD broke resistance at 2050. Looking for pullback to enter long. Risk 20 pips, targeting 2080."
```

**Output:**
```json
{
  "title": "XAUUSD Breakout Trade Setup",
  "content": "[[XAUUSD]] broke resistance at 2050. Looking for pullback to enter long. Risk 20 pips, targeting 2080.",
  "category": "trading",
  "subcategory": "analysis",
  "tags": ["xauusd", "breakout", "resistance", "long-trade"],
  "relatedNotes": [
    "XAUUSD Trading Strategy",
    "Support and Resistance Levels"
  ],
  "metadata": {
    "timestamp": "2026-05-03T10:30:00Z",
    "wordCount": 18,
    "hasLinks": true,
    "confidence": "high"
  }
}
```

### Example 2: Learning Note

**Input:**
```
"Learned about React hooks today. useState manages state, useEffect handles side effects. Much cleaner than class components."
```

**Output:**
```json
{
  "title": "React Hooks Overview",
  "content": "Learned about [[React]] hooks today. [[useState]] manages state, [[useEffect]] handles side effects. Much cleaner than class components.",
  "category": "learning",
  "subcategory": "programming",
  "tags": ["react", "hooks", "usestate", "useeffect", "javascript"],
  "relatedNotes": [
    "React Fundamentals",
    "Modern JavaScript Patterns"
  ],
  "metadata": {
    "timestamp": "2026-05-03T10:30:00Z",
    "wordCount": 19,
    "hasLinks": true,
    "confidence": "high"
  }
}
```

### Example 3: Meeting Note

**Input:**
```
"Meeting with Sarah and Tom. Discussed Q2 roadmap. Priority: mobile app launch. Sarah owns backend API. Tom handles iOS. Launch target: June 15."
```

**Output:**
```json
{
  "title": "Q2 Roadmap Planning Meeting",
  "content": "Meeting with Sarah and Tom. Discussed Q2 roadmap. Priority: [[Mobile App Launch]]. Sarah owns backend API. Tom handles iOS. Launch target: June 15.",
  "category": "meetings",
  "tags": ["roadmap", "q2", "mobile-app", "launch", "planning"],
  "relatedNotes": [
    "Mobile App Requirements",
    "Q2 OKRs"
  ],
  "metadata": {
    "timestamp": "2026-05-03T10:30:00Z",
    "wordCount": 24,
    "hasLinks": true,
    "confidence": "high"
  }
}
```

### Example 4: Idea Note

**Input:**
```
"What if we built an AI that learns your trading patterns and warns you before making emotional decisions?"
```

**Output:**
```json
{
  "title": "AI Trading Pattern Recognition Idea",
  "content": "What if we built an [[AI]] that learns your [[Trading]] patterns and warns you before making emotional decisions?",
  "category": "ideas",
  "tags": ["ai", "trading", "pattern-recognition", "emotions", "automation"],
  "relatedNotes": [
    "Trading Psychology",
    "AI Applications"
  ],
  "metadata": {
    "timestamp": "2026-05-03T10:30:00Z",
    "wordCount": 16,
    "hasLinks": true,
    "confidence": "medium"
  }
}
```

## Edge Cases

### Very Short Notes
```
Input: "XAUUSD long 2050"
Output: Still extract tags, create title, but confidence: "low"
```

### Ambiguous Category
```
Input: "Need to learn about trading psychology"
Touches: learning AND trading
Decision: Primary topic is "learning", subcategory could be "trading"
Category: "learning", tags include "trading"
```

### No Clear Links
```
Input: "Beautiful sunset today"
Output: hasLinks: false, category: "daily-notes", minimal tags
```

### Multiple Topics
```
Input: "Finished React course. Tomorrow start trading course."
Decision: Split into two notes OR use primary topic (learning)
Category: "learning", tags: ["react", "trading", "courses"]
```

## Quality Guidelines

1. **Be conservative with links** - Only link substantive concepts
2. **Use existing vocabulary** - Check for existing tags/note titles
3. **Confidence matters** - Mark "low" when unclear
4. **Preserve user voice** - Don't rewrite, only add links
5. **Context awareness** - Consider user's typical usage patterns

## Integration with Sub-agents

This skill provides the intelligence layer. Sub-agents handle execution:

1. **QuickCapture sub-agent**: Receives this JSON output
2. **AutoLinker sub-agent**: Validates links against existing notes
3. **Organizer sub-agent**: Creates file at correct path
4. **KnowledgeGraph sub-agent**: Updates graph with new node and edges

The LLM (using this skill) decides WHAT to do.
The sub-agents (code) execute HOW to do it.
