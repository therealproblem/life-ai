# Life AI - North Star Document

**Vision:** A comprehensive personal AI agent orchestration system that assists with all aspects of life - trading, work, learning, health, and knowledge management.

**Date Created:** May 3, 2026  
**Status:** Planning Complete - Ready to Begin Phase 1

---

## Table of Contents

1. [Vision & Philosophy](#vision--philosophy)
2. [System Architecture](#system-architecture)
3. [Agent Roster](#agent-roster)
4. [Recommended File Structure](#recommended-file-structure)
5. [Technology Stack](#technology-stack)
6. [Data Flow & Integration](#data-flow--integration)
7. [Phase-by-Phase Implementation Plan](#phase-by-phase-implementation-plan)
8. [Key Design Principles](#key-design-principles)
9. [Integration Points](#integration-points)
10. [Success Metrics](#success-metrics)

---

## Vision & Philosophy

### What Life AI Is

A **privacy-first, locally-controlled, multi-agent AI system** that acts as your:
- **Second brain** (knowledge management)
- **Trading analyst** (XAUUSD analysis)
- **Work assistant** (PM documentation, code prototyping)
- **Learning companion** (curriculum design, Japanese tutoring)
- **Information curator** (news aggregation)
- **System optimizer** (meta-learning patterns)

### Core Philosophy

Based on the **Pi harness philosophy**:

1. **Explicit over Implicit**
   - Agents always ask clarifying questions before acting
   - No surprise actions or silent changes
   - User approval required for handoffs

2. **Problem Decomposition**
   - Complex tasks broken into clear steps
   - Show plan before implementation
   - Each step can be debugged independently

3. **Privacy-First**
   - Sensitive data (trading journals, P&L) stays local
   - PII automatically detected and masked
   - Option to use local models (Ollama) for private data
   - Cloud models for general tasks

4. **Learn Over Time**
   - System observes patterns and preferences
   - Meta-agent suggests optimizations
   - Preferences stored explicitly (not hidden)
   - User confirms all learned behaviors

5. **Minimal Core, Maximum Extensibility**
   - Don't build features you might not use
   - Use sub-agents for specialization
   - Easy to add/remove capabilities

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Terminal   │  │  Web UI      │  │   Mobile     │      │
│  │   (Pi CLI)   │  │  (Dashboard) │  │   (PWA)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   ORCHESTRATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Task Distributor Agent (Router)              │   │
│  │  - Analyzes user input                               │   │
│  │  - Routes to appropriate agent                       │   │
│  │  - Manages handoffs between agents                   │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                              │
│  ┌────────────┴─────────────────────────────────────────┐   │
│  │          Inter-Agent Message Bus                     │   │
│  │  - Facilitates agent communication                   │   │
│  │  - Tracks conversation history                       │   │
│  │  - Explicit handoff management                       │   │
│  └────────────┬─────────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───┴────────────────┐  ┌──┴────────────────┐
│  SPECIALIZED       │  │  INTELLIGENCE     │
│  AGENTS            │  │  LAYER            │
│                    │  │                   │
│  1. Trader         │  │  9. Meta Agent    │
│  2. PM             │  │     - Pattern     │
│  3. Engineer       │  │       detection   │
│  4. Educator       │  │     - Preference  │
│  5. Language       │  │       learning    │
│  6. News           │  │     - System      │
│  7. Note-taker ✅  │  │       optimization│
│  8. Code Analyzer  │  │                   │
│     (Graphify)     │  │                   │
└────────┬───────────┘  └───────────────────┘
         │
┌────────┴────────────────────────────────────────────────────┐
│                   DATA & MEMORY LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Obsidian    │  │  Knowledge   │  │  Sessions    │      │
│  │  Vault       │  │  Graphs      │  │  (Pi)        │      │
│  │  (Notes)     │  │  (JSON)      │  │  (JSONL)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Artifacts   │  │  Preferences │  │  Schedules   │      │
│  │  (Outputs)   │  │  (JSON)      │  │  (Cron)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Roster

### 1. Task Distributor Agent (Router) 🎯

**Purpose:** Smart routing of user requests to appropriate specialized agent

**Responsibilities:**
- Analyze user input (text, voice, files)
- Determine which agent can best handle the request
- Route with context
- Manage agent handoffs
- Handle "general mode" for simple queries

**Sub-agents:**
- Intent Classifier (ML-based routing)
- Context Extractor
- Handoff Coordinator

**Technology:**
- Tier 2 model (GPT-4o-mini, Sonnet)
- Fast response time critical
- Pattern matching + LLM classification

---

### 2. Trader Agent 📈

**Purpose:** XAUUSD trading analysis, journaling, and decision support

**Responsibilities:**
- Technical analysis (support/resistance, patterns)
- Fundamental analysis (ForexFactory news)
- Trade journaling (with screenshots)
- Risk calculation (position sizing, R:R)
- Pre-market/post-market analysis
- Integration with trading knowledge base

**Sub-agents:**
1. **Market Data Agent**
   - Oanda API integration
   - Real-time price feeds
   - Historical data retrieval

2. **Chart Renderer**
   - TradingView Lightweight Charts
   - Interactive browser-based charts
   - Support/resistance level visualization
   - Pattern highlighting

3. **Technical Analysis Agent**
   - Price action analysis
   - Indicator calculations
   - Pattern recognition
   - Breakout/reversal detection

4. **Fundamental News Agent**
   - ForexFactory calendar scraping
   - News event impact analysis
   - Economic data correlation
   - Sentiment analysis

5. **Journal Assistant**
   - Structured trade logging
   - Screenshot annotation
   - Performance tracking
   - Pattern identification in trades

6. **Risk Calculator**
   - Position sizing
   - Risk/Reward calculation
   - Drawdown tracking
   - Account management

**Data Sources:**
- Oanda API (price data)
- ForexFactory (news, calendar)
- User screenshots (chart analysis)
- Trading journal (historical trades)

**Technology:**
- Tier 1 model for analysis (GPT-4, Opus)
- **Local model for journal entries** (privacy)
- TradingView Lightweight Charts
- Beautiful Soup for scraping

**Privacy:**
- Journal entries with P&L → Local model only
- Chart analysis → Cloud model OK
- Account numbers → Auto-masked

**Outputs:**
- Analysis reports (Markdown)
- Annotated charts (PNG)
- Trade journals (Obsidian vault)
- Performance dashboards (XLSX)

---

### 3. PM Agent 📋

**Purpose:** Create product management documents with corporate formatting

**Responsibilities:**
- Generate PRDs, specs, roadmaps
- Apply corporate templates and branding
- Export to DOCX, PPTX, PDF, XLSX
- Maintain document library
- Extract requirements from meetings
- Create presentations

**Sub-agents:**
1. **Document Generator**
   - Content creation from prompts
   - Requirement structuring
   - User story generation

2. **Document Formatter**
   - Apply corporate templates
   - Brand guidelines enforcement
   - Style consistency

3. **Presentation Builder**
   - Slide layout generation
   - Content adaptation for slides
   - Visual element suggestions

4. **Requirement Analyzer**
   - Parse meeting notes
   - Extract action items
   - Identify dependencies
   - Create feature matrices

5. **Export Manager**
   - DOCX generation (docxtemplater)
   - PPTX generation (pptxgenjs)
   - PDF export (Puppeteer)
   - XLSX data exports (ExcelJS)

**Templates:**
- PRD template (corporate format)
- Technical spec template
- One-pager template
- Roadmap template
- Meeting notes template

**Technology:**
- Tier 1 model for content (GPT-4, Opus)
- Tier 3 for formatting (GPT-3.5-turbo)
- docxtemplater, pptxgenjs, Puppeteer, ExcelJS

**Privacy:**
- Confidential docs → Local model option
- Public specs → Cloud model OK
- Company branding templates stored locally

**Outputs:**
- Documents in `artifacts/documents/`
- Obsidian notes in `projects/`

---

### 4. Engineer Agent 💻

**Purpose:** Full-stack prototyping and production-ready code generation

**Responsibilities:**
- Quick POC generation
- Productionize prototypes
- Code review (SOLID, DRY)
- Git workflow management
- UI/UX design
- Architecture planning

**Sub-agents:**
1. **Planner**
   - Problem decomposition
   - Architecture design
   - Technology selection
   - Timeline estimation

2. **UI/UX Designer**
   - Wireframe generation
   - Component design
   - Accessibility guidelines
   - Design system adherence

3. **Frontend POC Agent**
   - React/Next.js prototypes
   - Single-page demos
   - Quick iterations

4. **Backend POC Agent**
   - API prototypes
   - Database schema
   - Authentication flows

5. **Mobile POC Agent**
   - Flutter quick apps
   - Swift/Kotlin simple screens
   - Cross-platform POCs

6. **Script Generator**
   - Python automation
   - Bash scripts
   - Data processing

7. **Productionizer**
   - Full scaffolding
   - Tests, CI/CD
   - Documentation
   - Deployment configs

8. **Code Reviewer**
   - SOLID principles enforcement
   - DRY violations detection
   - Security scanning
   - Performance optimization

9. **Git Manager**
   - Branch strategy
   - Commit messages
   - PR descriptions
   - Merge coordination

10. **Code Analyzer** (Graphify Integration)
    - Codebase knowledge graph
    - God node identification
    - Dependency analysis
    - Architecture visualization

**Workflow:**
1. User requests feature
2. Planner shows decomposition → User approves
3. POC agent builds minimal version
4. User tests → feedback
5. Productionizer creates full implementation
6. Code reviewer checks quality
7. Git manager commits with proper messages

**Technology:**
- Tier 1 for planning (GPT-4, Opus)
- Tier 2 for code generation (Sonnet, GPT-4o)
- Graphify for code analysis
- Tree-sitter for AST parsing

**Templates:**
- Next.js starter
- Flutter template
- Swift boilerplate
- Kotlin starter
- Python script template
- API scaffold

**Outputs:**
- Prototypes in `artifacts/prototypes/`
- Git commits with proper structure
- Architecture diagrams

---

### 5. Educator Agent 🎓

**Purpose:** General learning, curriculum design, and knowledge testing

**Responsibilities:**
- Create personalized learning paths
- Adaptive teaching
- Quiz generation and grading
- Progress tracking
- Spaced repetition scheduling
- Resource recommendations

**Sub-agents:**
1. **Curriculum Designer**
   - Learning path creation
   - Prerequisite mapping
   - Timeline planning
   - Difficulty progression

2. **Teacher**
   - Adaptive explanations
   - Multiple teaching styles
   - Analogies and examples
   - Interactive lessons

3. **Quiz Generator**
   - MCQ, short answer, essay
   - Scenario-based questions
   - Code challenges
   - Difficulty adaptation

4. **Quiz Evaluator**
   - Answer grading
   - Feedback generation
   - Mistake analysis
   - Improvement suggestions

5. **Progress Tracker**
   - Mastery level tracking
   - Knowledge gap identification
   - Learning velocity
   - Retention monitoring

6. **Spaced Repetition Scheduler**
   - SRS algorithm (Anki-style)
   - Review scheduling
   - Difficulty adjustment
   - Long-term retention optimization

7. **Resource Finder**
   - Article recommendations
   - Video suggestions
   - Book recommendations
   - Course matching

**Learning Domains:**
- Programming concepts
- Trading strategies
- Game theory
- Mathematics
- Science
- Psychology
- Any topic on-demand

**Technology:**
- Tier 1 for curriculum design (GPT-4, Opus)
- Tier 2 for teaching (Sonnet)
- Tier 3 for quiz MCQs (GPT-3.5-turbo)

**Outputs:**
- Learning notes in `learning/`
- Quiz history in `learning/quizzes/`
- Progress reports (XLSX)

---

### 6. Language Learning Agent 🇯🇵

**Purpose:** Japanese language learning from scratch (JLPT N5 → N1)

**Responsibilities:**
- Hiragana/Katakana drills
- Kanji recognition and writing
- Vocabulary building (SRS)
- Grammar pattern practice
- Listening comprehension
- Speaking practice feedback
- Reading practice (graded readers)
- Writing composition feedback

**Sub-agents:**
1. **Kana Trainer**
   - Hiragana drills (あいうえお)
   - Katakana drills (アイウエオ)
   - Character recognition games
   - Stroke order practice

2. **Kanji Trainer**
   - Kanji recognition
   - Radicals learning
   - Stroke order animations
   - Meaning and readings (音読み/訓読み)
   - JLPT level progression

3. **Vocabulary Builder**
   - SRS flashcards
   - Context sentences
   - Audio pronunciation
   - Usage examples
   - JLPT vocabulary lists

4. **Grammar Coach**
   - Particle usage (は, が, を, に, で, etc.)
   - Verb conjugations
   - Adjective forms
   - Sentence patterns
   - Grammar point explanations

5. **Listening Trainer**
   - Audio exercises
   - Dictation practice
   - Speed variation
   - Comprehension questions

6. **Speaking Coach**
   - Pronunciation feedback
   - Shadowing exercises
   - Conversation practice
   - Accent correction

7. **Reading Coach**
   - Graded readers
   - Furigana support
   - Comprehension questions
   - Vocabulary highlighting

8. **Writing Coach**
   - Composition feedback
   - Grammar correction
   - Style suggestions
   - Natural expression guidance

**Data Sources:**
- KANJIDIC2 (kanji database)
- JMdict (Japanese-English dictionary)
- JLPT vocabulary lists
- Core 2k/6k vocabulary
- Tatoeba sentence corpus

**Technology:**
- Tier 2 for teaching (Sonnet, GPT-4o)
- TTS for pronunciation
- Whisper for speech recognition

**Daily Practice Routine:**
- 15-20 min session
- Mix of kanji, vocab, grammar
- Spaced repetition reviews
- Progress tracking

**Outputs:**
- Japanese notes in `japanese/`
- Practice logs
- JLPT progress tracking
- Flashcard decks

---

### 7. News Aggregator Agent 📰

**Purpose:** Multi-topic news curation and daily briefing

**Responsibilities:**
- Aggregate news from multiple categories
- Deduplicate and summarize
- Generate daily brief
- Archive historical feeds
- Filter by relevance

**News Categories:**
1. Tech news (HackerNews, TechCrunch)
2. New SaaS products (Product Hunt, BetaList)
3. Programming news (Reddit r/programming, Dev.to)
4. Security/CVE (CVE database, security blogs)
5. Psychology research (PsyPost, journals)
6. AI news (AI papers, product launches)
7. Global economy (Reuters, Bloomberg)
8. Science (ScienceDaily, Nature highlights)
9. Health (medical journals, health news)

**Sub-agents:**
1. **Tech News**
2. **SaaS Tracker**
3. **Programming News**
4. **Security CVE**
5. **Psychology News**
6. **AI News**
7. **Economy News**
8. **Science News**
9. **Health News**
10. **Summarizer** (aggregates all)

**Technology:**
- RSS feed readers
- Web scraping (Beautiful Soup)
- Tier 3 model for summarization (GPT-3.5-turbo)
- Deduplication algorithms

**Schedule:**
- Daily brief at 8:00 AM
- Save to `artifacts/news/daily-briefs/`
- Archive to `artifacts/news/archive/`

**Outputs:**
- Daily brief (Markdown)
- Category-specific summaries
- Trend analysis

---

### 8. Note-taker Agent 📝 ✅ **IMPLEMENTED**

**Purpose:** Obsidian vault management, auto-linking, knowledge graph

**Status:** 📋 **To be implemented** (Phase 1)

**Responsibilities:**
- Quick note capture
- Auto-generate titles and tags
- Create `[[wiki-links]]` between related notes
- Organize notes into folders
- Build knowledge graph
- Process voice transcripts
- Weekly summaries

**Sub-agents:**
1. ✅ **QuickCapture** - Parse raw input, extract tags
2. ✅ **AutoLinker** - Find related notes (TF-IDF), insert links
3. ✅ **Organizer** - Categorize and save notes
4. ✅ **KnowledgeGraph** - Build and maintain graph

**Categories:**
- `trading/` - Trading analysis, journal, strategies
- `learning/` - Learning notes, curricula
- `japanese/` - Language learning
- `projects/` - Project docs, specs
- `meetings/` - Meeting notes
- `ideas/` - Quick thoughts
- `daily-notes/` - Daily journal

**Technology:**
- NLP (natural library for TF-IDF)
- gray-matter (frontmatter parsing)
- NetworkX-style graph (custom implementation)

**See:** `IMPLEMENTATION_STATUS.md` for full details

---

### 9. Meta Agent 🧠

**Purpose:** System optimization and pattern learning

**Responsibilities:**
- Observe all agent interactions
- Detect usage patterns
- Learn user preferences
- Suggest system improvements
- Recommend new tools/sub-agents
- Optimize workflows
- Suggest folder restructuring

**Analysis Areas:**
1. **Usage Patterns**
   - Which agents used most
   - Common workflows
   - Time-of-day patterns
   - Task sequences

2. **Preference Learning**
   - Writing style preferences
   - Code style preferences
   - Learning pace
   - News filtering preferences
   - Response verbosity

3. **Tool Suggestions**
   - Missing capabilities
   - Redundant workflows
   - Integration opportunities

4. **Prompt Optimization**
   - Improve system prompts
   - Better question templates
   - More effective instructions

5. **Subagent Suggestions**
   - New specialized helpers
   - Split complex agents
   - Merge underused agents

6. **Structure Optimization**
   - Better folder organization
   - File naming conventions
   - Tag taxonomy

**Operation:**
- Runs weekly analysis (background)
- Presents suggestions (not auto-apply)
- Requires user confirmation
- Tracks suggestion acceptance rate

**Technology:**
- Tier 2 model for analysis (Sonnet)
- Pattern detection algorithms
- Preference scoring

**Outputs:**
- Weekly optimization report
- Suggested improvements (JSON)
- Preference updates (with user approval)

---

## Recommended File Structure

```
~/Library/Mobile Documents/com~apple~CloudDocs/life-ai/
│
├── README.md                           # Project overview
├── NORTH_STAR.md                       # This document (vision & architecture)
├── IMPLEMENTATION_STATUS.md            # Current progress tracking
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vitest.config.ts                    # Test configuration
├── .env                                # Environment variables (gitignored)
├── .env.example                        # Environment template
├── .gitignore                          # Git ignore rules
│
├── src/
│   ├── index.ts                        # Main entry point (CLI)
│   ├── types.ts                        # Shared TypeScript types
│   │
│   ├── core/                           # Orchestration engine
│   │   ├── orchestrator.ts             # Main orchestration logic
│   │   ├── task-distributor.ts         # Agent #1: Router
│   │   ├── context-manager.ts          # Shared context between agents
│   │   ├── message-bus.ts              # Inter-agent communication
│   │   ├── handoff-manager.ts          # Explicit handoff coordination
│   │   ├── model-manager.ts            # Local vs cloud model selection
│   │   ├── privacy-guard.ts            # PII detection & masking
│   │   └── scheduler.ts                # Proactive task scheduling
│   │
│   ├── agents/
│   │   ├── base/
│   │   │   ├── agent.ts                # ✅ Base agent class
│   │   │   ├── sub-agent.ts            # ✅ Base sub-agent class
│   │   │   └── agent-config.ts         # Agent configuration interface
│   │   │
│   │   ├── trader/                     # Agent #2: Trading
│   │   │   ├── trader-agent.ts
│   │   │   ├── config.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── market-data.ts
│   │   │   │   ├── chart-renderer.ts
│   │   │   │   ├── technical-analysis.ts
│   │   │   │   ├── fundamental-news.ts
│   │   │   │   ├── journal-assistant.ts
│   │   │   │   └── risk-calculator.ts
│   │   │   └── tools/
│   │   │       ├── oanda-client.ts
│   │   │       ├── forex-factory.ts
│   │   │       └── chart-tools.ts
│   │   │
│   │   ├── pm/                         # Agent #3: Product Management
│   │   │   ├── pm-agent.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── document-generator.ts
│   │   │   │   ├── document-formatter.ts
│   │   │   │   ├── presentation-builder.ts
│   │   │   │   ├── requirement-analyzer.ts
│   │   │   │   └── export-manager.ts
│   │   │   ├── tools/
│   │   │   │   ├── docx-generator.ts
│   │   │   │   ├── pptx-generator.ts
│   │   │   │   ├── pdf-exporter.ts
│   │   │   │   └── xlsx-exporter.ts
│   │   │   └── templates/
│   │   │       ├── prd-template.md
│   │   │       ├── tech-spec-template.md
│   │   │       ├── one-pager-template.md
│   │   │       └── roadmap-template.md
│   │   │
│   │   ├── engineer/                   # Agent #4: Software Engineering
│   │   │   ├── engineer-agent.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── planner.ts
│   │   │   │   ├── ui-ux-designer.ts
│   │   │   │   ├── frontend-poc.ts
│   │   │   │   ├── backend-poc.ts
│   │   │   │   ├── mobile-poc.ts
│   │   │   │   ├── script-generator.ts
│   │   │   │   ├── productionizer.ts
│   │   │   │   ├── code-reviewer.ts
│   │   │   │   ├── git-manager.ts
│   │   │   │   └── code-analyzer.ts    # Graphify integration
│   │   │   ├── tools/
│   │   │   │   ├── scaffolder.ts
│   │   │   │   ├── code-quality.ts
│   │   │   │   ├── graphify-wrapper.ts # Wraps Graphify skill
│   │   │   │   └── design-tools.ts
│   │   │   └── templates/
│   │   │       ├── nextjs-poc/
│   │   │       ├── flutter-poc/
│   │   │       ├── swift-poc/
│   │   │       ├── kotlin-poc/
│   │   │       └── automation-script/
│   │   │
│   │   ├── educator/                   # Agent #5: General Learning
│   │   │   ├── educator-agent.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── curriculum-designer.ts
│   │   │   │   ├── teacher.ts
│   │   │   │   ├── quiz-generator.ts
│   │   │   │   ├── quiz-evaluator.ts
│   │   │   │   ├── progress-tracker.ts
│   │   │   │   ├── spaced-repetition.ts
│   │   │   │   └── resource-finder.ts
│   │   │   └── tools/
│   │   │       ├── quiz-engine.ts
│   │   │       ├── progress-db.ts
│   │   │       └── srs-algorithm.ts
│   │   │
│   │   ├── language/                   # Agent #6: Language (Japanese)
│   │   │   ├── language-agent.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── kana-trainer.ts
│   │   │   │   ├── kanji-trainer.ts
│   │   │   │   ├── vocabulary-builder.ts
│   │   │   │   ├── grammar-coach.ts
│   │   │   │   ├── listening-trainer.ts
│   │   │   │   ├── speaking-coach.ts
│   │   │   │   ├── reading-coach.ts
│   │   │   │   └── writing-coach.ts
│   │   │   ├── tools/
│   │   │   │   ├── jlpt-tracker.ts
│   │   │   │   ├── kanji-db.ts
│   │   │   │   ├── dictionary.ts
│   │   │   │   └── stroke-order.ts
│   │   │   └── data/
│   │   │       ├── jlpt-n5-vocab.json
│   │   │       ├── jlpt-n4-vocab.json
│   │   │       ├── core-2k-vocab.json
│   │   │       └── grammar-patterns.json
│   │   │
│   │   ├── news/                       # Agent #7: News Aggregator
│   │   │   ├── news-agent.ts
│   │   │   ├── sub-agents/
│   │   │   │   ├── tech-news.ts
│   │   │   │   ├── saas-tracker.ts
│   │   │   │   ├── programming-news.ts
│   │   │   │   ├── security-cve.ts
│   │   │   │   ├── psychology-news.ts
│   │   │   │   ├── ai-news.ts
│   │   │   │   ├── economy-news.ts
│   │   │   │   ├── science-news.ts
│   │   │   │   ├── health-news.ts
│   │   │   │   └── summarizer.ts
│   │   │   └── tools/
│   │   │       ├── rss-reader.ts
│   │   │       ├── web-scraper.ts
│   │   │       └── deduplicator.ts
│   │   │
│   │   ├── note-taker/                 # Agent #8: Note-taker ✅
│   │   │   ├── note-taker-agent.ts     # ✅ Implemented
│   │   │   ├── sub-agents/
│   │   │   │   ├── quick-capture.ts    # ✅ Implemented
│   │   │   │   ├── auto-linker.ts      # ✅ Implemented
│   │   │   │   ├── organizer.ts        # ✅ Implemented
│   │   │   │   └── knowledge-graph.ts  # ✅ Implemented
│   │   │   └── note-taker.test.ts      # ✅ 13 tests passing
│   │   │
│   │   └── meta/                       # Agent #9: Meta-learning
│   │       ├── meta-agent.ts
│   │       ├── analyzers/
│   │       │   ├── usage-analyzer.ts
│   │       │   ├── performance-analyzer.ts
│   │       │   ├── pattern-detector.ts
│   │       │   └── preference-learner.ts
│   │       └── suggesters/
│   │           ├── tool-suggester.ts
│   │           ├── prompt-optimizer.ts
│   │           ├── subagent-suggester.ts
│   │           └── structure-optimizer.ts
│   │
│   ├── memory/                         # Shared memory & state
│   │   ├── session-store.ts            # Pi session management
│   │   ├── artifact-store.ts           # Outputs between agents
│   │   ├── conversation-history.ts     # Cross-agent conversations
│   │   └── preference-store.ts         # User preferences database
│   │
│   ├── web-ui/                         # Web dashboard
│   │   ├── server.ts                   # Express/Fastify server
│   │   ├── rpc-client.ts               # Connect to pi agents via RPC
│   │   ├── routes/
│   │   │   ├── api.ts                  # REST API for mobile
│   │   │   └── websocket.ts            # Real-time updates
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── styles/
│   │   │   │   └── main.css
│   │   │   ├── components/
│   │   │   │   ├── TradingChart.tsx    # TradingView charts
│   │   │   │   ├── KnowledgeGraph.tsx  # D3.js graph viz
│   │   │   │   ├── NewsFeed.tsx
│   │   │   │   ├── ProgressDashboard.tsx
│   │   │   │   └── DocumentPreview.tsx
│   │   │   └── pages/
│   │   │       ├── Dashboard.tsx       # Main overview
│   │   │       ├── Trading.tsx         # Trading interface
│   │   │       ├── Documents.tsx       # PM doc library
│   │   │       ├── Learning.tsx        # Learning progress
│   │   │       ├── Japanese.tsx        # Language practice
│   │   │       └── Notes.tsx           # Knowledge base browser
│   │   └── Dockerfile                  # For containerized deployment
│   │
│   └── utils/                          # Utilities
│       ├── pi-wrapper.ts               # ✅ Pi SDK helpers
│       ├── logger.ts                   # ✅ Structured logging
│       ├── audio-transcriber.ts        # Whisper integration
│       ├── pii-detector.ts             # PII pattern matching
│       ├── cloudflare-tunnel.ts        # Tunnel configuration
│       └── git-helpers.ts              # Git automation
│
├── config/                             # Configuration files
│   ├── agents.json                     # Agent configs & model assignments
│   ├── models.json                     # Model tier definitions
│   ├── preferences.json                # Learned user preferences (auto-gen)
│   ├── schedules.json                  # Proactive agent schedules
│   ├── privacy.json                    # PII masking rules
│   ├── workflows.json                  # Cross-agent workflow definitions
│   └── templates/
│       ├── corporate-doc.docx          # Company document template
│       ├── corporate-presentation.pptx # Company presentation template
│       └── style-guide.json            # Brand guidelines
│
├── data/                               # All data (iCloud synced)
│   ├── obsidian-vault/                 # ✅ Obsidian-compatible notes
│   │   ├── Welcome.md                  # ✅ Sample note
│   │   ├── trading/
│   │   │   ├── strategies/
│   │   │   ├── journal/                # LOCAL ONLY (privacy)
│   │   │   ├── analysis/
│   │   │   └── charts/
│   │   ├── learning/
│   │   │   ├── topics/
│   │   │   ├── curricula/
│   │   │   ├── quizzes/
│   │   │   └── progress/
│   │   ├── japanese/
│   │   │   ├── vocabulary/
│   │   │   ├── kanji/
│   │   │   ├── grammar/
│   │   │   └── practice-logs/
│   │   ├── projects/
│   │   │   ├── requirements/
│   │   │   ├── specs/
│   │   │   └── decisions/
│   │   ├── meetings/
│   │   ├── ideas/
│   │   └── daily-notes/
│   │
│   ├── knowledge-base/                 # ✅ Structured KB
│   │   ├── graph.json                  # ✅ Knowledge graph
│   │   ├── trading/
│   │   │   ├── index.json
│   │   │   └── embeddings/
│   │   ├── learning/
│   │   ├── japanese/
│   │   ├── projects/
│   │   └── shared/                     # Cross-domain insights
│   │
│   ├── sessions/                       # ✅ Pi session storage (per agent)
│   │   ├── distributor/
│   │   ├── trader/
│   │   ├── pm/
│   │   ├── engineer/
│   │   ├── educator/
│   │   ├── language/
│   │   ├── news/
│   │   ├── note-taker/
│   │   └── meta/
│   │
│   ├── artifacts/                      # ✅ Agent outputs
│   │   ├── trading/
│   │   │   ├── reports/                # Analysis reports (PDF/MD)
│   │   │   └── data-exports/           # XLSX exports
│   │   ├── documents/                  # PM outputs
│   │   │   ├── prds/
│   │   │   ├── specs/
│   │   │   ├── presentations/
│   │   │   └── exports/                # Final PDF/DOCX/PPTX
│   │   ├── prototypes/                 # Engineer outputs
│   │   │   ├── web/
│   │   │   ├── mobile/
│   │   │   └── scripts/
│   │   ├── news/
│   │   │   ├── daily-briefs/           # Daily summaries
│   │   │   └── archive/
│   │   └── audio/
│   │       ├── recordings/
│   │       └── transcripts/
│   │
│   └── temp/                           # ✅ Temporary scratch space
│
├── prompts/                            # System prompts for each agent
│   ├── distributor.md                  # Task routing instructions
│   ├── trader.md                       # Trading analysis guidelines
│   ├── pm.md                           # PM best practices
│   ├── engineer.md                     # Coding standards (SOLID/DRY)
│   ├── educator.md                     # Teaching methodology
│   ├── language.md                     # Language learning approach
│   ├── news.md                         # News curation guidelines
│   ├── note-taker.md                   # ✅ Note organization rules
│   └── meta.md                         # Meta-learning objectives
│
├── skills/                             # Pi skills (Agent Skills standard)
│   ├── trading-analysis/
│   │   └── SKILL.md
│   ├── chart-review/
│   │   └── SKILL.md
│   ├── document-creation/
│   │   └── SKILL.md
│   ├── code-review/
│   │   └── SKILL.md
│   ├── learn-topic/
│   │   └── SKILL.md
│   ├── japanese-practice/
│   │   └── SKILL.md
│   ├── quick-note/
│   │   └── SKILL.md
│   └── graphify/                       # Code analysis skill (external)
│       └── SKILL.md
│
├── extensions/                         # Pi extensions
│   ├── orchestrator-ui.ts              # Custom TUI for multi-agent view
│   ├── inter-agent-messaging.ts        # Tools for agent handoffs
│   ├── privacy-tools.ts                # PII masking tools
│   ├── chart-viewer.ts                 # Inline chart preview in terminal
│   ├── knowledge-graph-viewer.ts       # Graph visualization command
│   └── audio-handler.ts                # Audio upload/transcription
│
├── scripts/                            # Automation & utilities
│   ├── setup.js                        # ✅ Initial setup
│   ├── start-terminal.sh               # Launch pi terminal interface
│   ├── start-web.sh                    # Launch web UI + Cloudflare tunnel
│   ├── backup.sh                       # Backup knowledge base
│   ├── sync-obsidian.sh                # Sync vault with KB structure
│   └── run-scheduled.sh                # Cron job for proactive agents
│
├── tests/                              # Tests
│   ├── unit/
│   │   ├── agents/
│   │   │   └── note-taker.test.ts      # ✅ 13 tests passing
│   │   ├── tools/
│   │   └── utils/
│   ├── integration/
│   │   ├── agent-handoffs.test.ts
│   │   ├── knowledge-base.test.ts
│   │   └── export-pipeline.test.ts
│   └── e2e/
│       ├── trading-workflow.test.ts
│       ├── document-creation.test.ts
│       └── learning-session.test.ts
│
├── docs/                               # Documentation
│   ├── architecture.md                 # System design overview
│   ├── agent-protocols.md              # Inter-agent communication
│   ├── handoff-guide.md                # How agents coordinate
│   ├── deployment.md                   # Cloudflare tunnel setup
│   ├── privacy.md                      # PII handling & local models
│   ├── model-strategy.md               # Tier assignments & costs
│   └── workflows/
│       ├── trading-analysis.md
│       ├── document-creation.md
│       ├── prototyping.md
│       └── learning-session.md
│
├── logs/                               # ✅ Application logs
│   └── life-ai.log
│
└── examples/                           # Example interactions
    ├── analyze-trade.md                # Trading workflow example
    ├── create-prd.md                   # PM workflow example
    ├── build-prototype.md              # Engineering workflow example
    └── learn-topic.md                  # Learning workflow example
```

---

## Technology Stack

### Core Infrastructure

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Agent Harness** | Pi (by badlogic) | Proven terminal coding harness, extensible, sessions |
| **Runtime** | Node.js 18+ | Required by Pi, excellent ecosystem |
| **Language** | TypeScript | Type safety, better tooling, catches errors early |
| **Package Manager** | pnpm | Faster than npm, disk space efficient |
| **Testing** | Vitest | Fast, better TS support than Jest |

### Agent Layer

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **LLM Orchestration** | Pi SDK | createAgentSession, session management |
| **Primary Models** | GPT-4, Claude Opus (Tier 1) | Best reasoning for complex tasks |
| **Standard Models** | GPT-4o-mini, Claude Sonnet (Tier 2) | Good balance of cost/performance |
| **Economy Models** | GPT-3.5-turbo, Haiku (Tier 3) | Fast, cheap for simple tasks |
| **Local Models** | Ollama (Llama 3, Mixtral) | Privacy-sensitive data |

### Data & Knowledge

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Note Storage** | Obsidian Vault (Markdown) | Future-proof, human-readable, git-friendly |
| **Frontmatter** | gray-matter | YAML metadata in markdown |
| **Knowledge Graph** | Custom (JSON) | NetworkX-inspired, lightweight |
| **NLP** | natural library | TF-IDF, tokenization, similarity |
| **Vector Search** | (Future: Qdrant or local) | Semantic search when needed |

### Specialized Tools

#### Trading Agent
- **Market Data:** Oanda REST API
- **Charts:** TradingView Lightweight Charts
- **Scraping:** Beautiful Soup (Python) or Cheerio (Node)
- **Data Export:** ExcelJS

#### PM Agent
- **DOCX:** docxtemplater
- **PPTX:** pptxgenjs
- **PDF:** Puppeteer
- **XLSX:** ExcelJS

#### Engineer Agent
- **Code Analysis:** Graphify (Tree-sitter + NetworkX)
- **AST Parsing:** Tree-sitter
- **Scaffolding:** Custom templates
- **Git:** simple-git library

#### Educator Agent
- **SRS Algorithm:** SM-2 (Anki-style)
- **Quiz Engine:** Custom
- **Progress Tracking:** JSON + SQLite (future)

#### Language Agent
- **Kanji Database:** KANJIDIC2
- **Dictionary:** JMdict
- **TTS:** OpenAI TTS / Google TTS
- **Speech Recognition:** OpenAI Whisper

#### News Agent
- **RSS:** feedparser
- **Web Scraping:** Beautiful Soup / Cheerio
- **Deduplication:** Text similarity algorithms

### Web UI

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Frontend Framework** | React / Next.js | Industry standard, great ecosystem |
| **Backend** | Express / Fastify | Simple REST + WebSocket |
| **RPC Client** | Custom (Pi RPC mode) | Connect to terminal agents |
| **Charts** | TradingView Lightweight Charts | Trading charts |
| **Graph Viz** | D3.js | Knowledge graph visualization |
| **Mobile** | Progressive Web App (PWA) | No separate mobile app needed |
| **Deployment** | Cloudflare Tunnel | Secure access without port forwarding |

### Storage & Sync

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Primary Storage** | iCloud Drive | Already in use, syncs across devices |
| **Obsidian Vault** | iCloud sync | Native Obsidian support |
| **Session Storage** | Pi JSONL files | Built-in to Pi harness |
| **Preferences** | JSON files | Simple, editable, version-controllable |

---

## Data Flow & Integration

### 1. User Input Flow

```
User Input (text/voice/file)
    ↓
Task Distributor analyzes
    ↓
Asks clarifying questions
    ↓
User answers
    ↓
Route to specialized agent
    ↓
Agent executes with sub-agents
    ↓
May request handoff to another agent
    ↓
User approves handoff
    ↓
Receiving agent continues
    ↓
Results saved to appropriate location
    ↓
Note-taker auto-files to knowledge base
    ↓
Meta-agent observes pattern (background)
```

### 2. Knowledge Flow

```
Capture (Note-taker)
    ↓
Organize (Categories)
    ↓
Link (Auto-linking)
    ↓
Graph (Knowledge graph)
    ↓
Search (Semantic search)
    ↓
Retrieve (Agent queries KB)
```

### 3. Trading Analysis Flow

```
User: "Analyze XAUUSD setup" + screenshot
    ↓
Task Distributor → Trader Agent
    ↓
Trader asks: timeframe, bias, position size
    ↓
User answers
    ↓
Market Data sub-agent fetches Oanda data
    ↓
Chart Renderer displays in web UI
    ↓
Technical Analysis sub-agent analyzes
    ↓
Fundamental News checks ForexFactory
    ↓
Risk Calculator determines position size
    ↓
Trader generates comprehensive analysis
    ↓
Asks: "Hand off to Note-taker to journal this?"
    ↓
User: "Yes"
    ↓
Note-taker creates journal entry
    ↓
Auto-links to [[Trading Strategy]], [[XAUUSD]]
    ↓
Updates knowledge graph
    ↓
Meta-agent notes: frequent XAUUSD analysis pattern
```

### 4. Document Creation Flow

```
User: "Create PRD for mobile app feature"
    ↓
Task Distributor → PM Agent
    ↓
PM asks: feature details, target users, timeline
    ↓
Document Generator creates content
    ↓
Document Formatter applies corporate template
    ↓
Preview shown in web UI
    ↓
User reviews, requests changes
    ↓
Revisions made
    ↓
Export Manager generates:
  - Editable DOCX
  - Final PDF
  - Obsidian note
    ↓
Saved to artifacts/documents/ and projects/
```

### 5. Learning Session Flow

```
User: "Teach me about React hooks"
    ↓
Task Distributor → Educator Agent
    ↓
Educator asks: current knowledge level, learning goal, time
    ↓
Curriculum Designer creates lesson plan
    ↓
Teacher explains with examples
    ↓
User asks questions
    ↓
Teacher clarifies
    ↓
Quiz Generator creates 5 questions
    ↓
User answers
    ↓
Quiz Evaluator grades + provides feedback
    ↓
Progress Tracker updates mastery level
    ↓
Spaced Repetition schedules review in 3 days
    ↓
Note-taker creates learning note
    ↓
Auto-links to [[React]], [[JavaScript]]
```

---

## Phase-by-Phase Implementation Plan

### 📋 Phase 1: Foundation & Note-taker

**Duration:** 2 weeks  
**Status:** ⏳ Not Started

**Deliverables:**
- [ ] Project structure
- [ ] Base agent classes
- [ ] Type system
- [ ] Logger utility
- [ ] Note-taker agent (fully functional)
- [ ] Tests passing
- [ ] Setup script
- [ ] README & documentation

---

### 📋 Phase 2: Core Infrastructure

**Duration:** 2 weeks  
**Goal:** Enable agent communication and orchestration

**Deliverables:**
1. **Task Distributor Agent**
   - Intent classification
   - Route to appropriate agent
   - Context extraction
   - Basic routing tests

2. **Message Bus**
   - Inter-agent messaging
   - Message queue
   - History tracking

3. **Handoff Manager**
   - Explicit handoff requests
   - User confirmation flow
   - Handoff history

4. **Privacy Guard**
   - PII detection patterns
   - Auto-masking
   - Local vs cloud routing

5. **Simple CLI**
   - Interactive chat interface
   - File upload
   - Voice input
   - Agent selection

**Success Criteria:**
- User can chat with task distributor
- Distributor routes to note-taker
- Handoff works between agents
- PII is detected and masked

---

### 📈 Phase 3: Trader Agent

**Duration:** 2-3 weeks  
**Goal:** Full trading analysis capability

**Deliverables:**
1. **Market Data Sub-agent**
   - Oanda API integration
   - Real-time price feeds
   - Historical data

2. **Chart Renderer Sub-agent**
   - TradingView Lightweight Charts
   - Basic web UI for charts
   - Interactive exploration

3. **Technical Analysis Sub-agent**
   - Support/resistance detection
   - Pattern recognition
   - Breakout analysis

4. **Fundamental News Sub-agent**
   - ForexFactory scraper
   - News calendar
   - Event impact analysis

5. **Journal Assistant Sub-agent**
   - Trade logging
   - Screenshot handling
   - Performance tracking

6. **Risk Calculator Sub-agent**
   - Position sizing
   - R:R calculation

**Success Criteria:**
- Can analyze XAUUSD from Oanda
- Displays interactive chart
- Generates analysis report
- Logs trades to journal
- News events incorporated

---

### 📝 Phase 4: PM Agent

**Duration:** 2 weeks  
**Goal:** Professional document generation

**Deliverables:**
1. **Document Generator Sub-agent**
   - PRD generation
   - Spec creation
   - Requirement structuring

2. **Document Formatter Sub-agent**
   - Apply corporate templates
   - Style enforcement

3. **Presentation Builder Sub-agent**
   - Slide generation
   - Layout management

4. **Export Manager Sub-agent**
   - DOCX export
   - PPTX export
   - PDF export
   - XLSX export

5. **Templates**
   - PRD template
   - Tech spec template
   - Roadmap template

**Success Criteria:**
- Generate complete PRD
- Apply custom template
- Export to DOCX and PDF
- Presentation slides created

---

### 💻 Phase 5: Engineer Agent

**Duration:** 3 weeks  
**Goal:** Code prototyping and analysis

**Deliverables:**
1. **Planner Sub-agent**
   - Problem decomposition
   - Show plan before code

2. **POC Sub-agents**
   - Frontend (React/Next.js)
   - Backend (Node/Python)
   - Mobile (Flutter/Swift/Kotlin)
   - Scripts (Python/Bash)

3. **Code Reviewer Sub-agent**
   - SOLID/DRY enforcement
   - Security checks

4. **Git Manager Sub-agent**
   - Auto-commits
   - Branch strategy
   - PR descriptions

5. **Code Analyzer Sub-agent**
   - Graphify integration
   - Knowledge graph of code
   - God node identification

6. **Productionizer Sub-agent**
   - Full scaffolding
   - Tests, CI/CD

**Success Criteria:**
- Quick POC in 2 minutes
- Full productionization works
- Code passes quality checks
- Git commits are clean
- Graphify analyzes codebase

---

### 🎓 Phase 6: Educator & Language Agents

**Duration:** 2-3 weeks  
**Goal:** Learning support

**Educator Agent Deliverables:**
1. Curriculum Designer
2. Teacher (adaptive)
3. Quiz Generator
4. Quiz Evaluator
5. Progress Tracker
6. SRS Scheduler

**Language Agent Deliverables:**
1. Kana Trainer (Hiragana/Katakana)
2. Kanji Trainer
3. Vocabulary Builder (SRS)
4. Grammar Coach
5. Listening/Speaking/Reading/Writing coaches
6. JLPT tracking

**Success Criteria:**
- Complete learning session works
- Quizzes are generated and graded
- Progress tracked
- Japanese daily practice functional
- SRS reminders work

---

### 📰 Phase 7: News Aggregator

**Duration:** 1 week  
**Goal:** Daily news curation

**Deliverables:**
1. 9 news sub-agents (tech, SaaS, programming, security, etc.)
2. RSS feed readers
3. Web scrapers
4. Summarizer
5. Deduplicator
6. Daily brief generator

**Success Criteria:**
- Daily brief at 8am
- All 9 categories covered
- Deduplicated content
- Saved to artifacts

---

### 🧠 Phase 8: Meta Agent

**Duration:** 2 weeks  
**Goal:** System optimization

**Deliverables:**
1. Usage Analyzer
2. Pattern Detector
3. Preference Learner
4. Tool Suggester
5. Prompt Optimizer
6. Subagent Suggester
7. Structure Optimizer

**Success Criteria:**
- Weekly analysis runs
- Patterns detected
- Suggestions presented
- User can approve/reject
- Preferences updated

---

### 🌐 Phase 9: Web UI & Mobile

**Duration:** 2-3 weeks  
**Goal:** Visual dashboard and mobile access

**Deliverables:**
1. **Web Server**
   - Express/Fastify
   - RPC connection to agents
   - WebSocket for real-time

2. **Dashboard**
   - Overview of all agents
   - Recent activity
   - Quick actions

3. **Specialized Views**
   - Trading: interactive charts
   - Documents: library browser
   - Learning: progress dashboard
   - Japanese: daily practice
   - Notes: knowledge graph viz

4. **Mobile**
   - PWA for mobile Safari
   - Quick capture
   - Voice notes
   - Photo upload

5. **Deployment**
   - Cloudflare Tunnel
   - HTTPS access

**Success Criteria:**
- Dashboard shows all agent status
- Trading charts work on web
- Mobile capture works
- Knowledge graph visualized
- Accessible from phone

---

### 🔄 Phase 10: Polish & Integration

**Duration:** 2 weeks  
**Goal:** End-to-end workflows

**Deliverables:**
1. **Cross-agent workflows**
   - Trading analysis → Note-taker → Educator
   - Meeting → PM → Note-taker
   - Code question → Engineer → Graphify

2. **Proactive features**
   - Scheduled tasks (cron)
   - Morning news
   - Trading pre-market
   - Japanese daily practice
   - Weekly summary

3. **Audio transcription**
   - Whisper integration
   - Meeting recordings
   - Voice notes

4. **Documentation**
   - User guide
   - Architecture docs
   - API reference

5. **Tests**
   - Integration tests
   - E2E workflows
   - Performance testing

**Success Criteria:**
- All agents work together
- Proactive tasks run on schedule
- Audio transcription works
- Complete documentation
- 80%+ test coverage

---

## Key Design Principles

### 1. Explicit Confirmation Required

**Always ask before acting:**
- Show plan before implementation
- Request approval for handoffs
- Confirm preference changes
- Display costs before expensive operations

**Example:**
```
User: "Analyze this trade"
Trader: "I'll analyze XAUUSD. A few questions first:
  1. What timeframe are you trading?
  2. What's your bias (long/short)?
  3. What position size are you considering?
  
Proceed with analysis?"
```

### 2. Problem Decomposition

**Break complex tasks into steps:**
- Show the breakdown
- Each step independently debuggable
- User can modify plan
- Clear dependencies

**Example:**
```
User: "Build a todo app"
Engineer: "Here's my plan:
  1. Create Next.js project structure
  2. Design database schema (SQLite)
  3. Build API routes (CRUD)
  4. Create UI components
  5. Add authentication
  6. Write tests
  
Does this approach work? Any changes?"
```

### 3. Privacy-First

**Sensitive data handling:**
- Auto-detect PII (account numbers, P&L, etc.)
- Route to local models when detected
- User can override routing
- Mask before logging
- Trading journal → always local

**PII Patterns:**
- Account numbers: `\b\d{8,12}\b`
- Position sizes: `\b\d+\s*(lots?|units?)\b`
- P&L: `\$\d+|\+\d+\.\d+%`
- API keys: `sk-[a-zA-Z0-9]+`

### 4. Learn Preferences, Don't Assume

**Preference learning flow:**
1. Meta-agent observes pattern
2. Suggests preference explicitly
3. User confirms or rejects
4. Store in `preferences.json`
5. Apply going forward

**Example:**
```
Meta-agent: "I noticed you prefer bullet points over 
paragraphs in PM docs (observed 5 times). Should I 
make this a default preference?

[ Approve ] [ Reject ] [ Remind me later ]"
```

### 5. Sub-agents for Specialization

**When to create a sub-agent:**
- Distinct, focused responsibility
- Reusable across contexts
- Can be tested independently
- Doesn't need own LLM session (just helper functions)

**When NOT to:**
- One-time use
- Tightly coupled to parent
- Too granular (over-engineering)

### 6. Git Workflow Best Practices

**Engineer agent git rules:**
- One feature = one branch
- Descriptive commit messages
- Commit after each logical step
- PR descriptions auto-generated
- Never commit secrets

**Commit message format:**
```
type(scope): Short description

- Detailed change 1
- Detailed change 2

Resolves: #issue-number
```

### 7. SOLID & DRY Enforcement

**Code quality rules:**
- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution
- Interface Segregation
- Dependency Inversion
- Don't Repeat Yourself

**Code reviewer sub-agent checks:**
- Class/function size
- Coupling
- Duplication
- Naming clarity

### 8. Model Tier Strategy

**Tier 1 (Premium): GPT-4, Claude Opus**
- Trading analysis
- Curriculum design
- Architecture planning
- Complex reasoning

**Tier 2 (Standard): GPT-4o-mini, Claude Sonnet**
- Code generation
- Document writing
- Teaching
- Most tasks

**Tier 3 (Economy): GPT-3.5-turbo, Haiku**
- Summarization
- News aggregation
- Simple formatting
- Repetitive tasks

**Local: Ollama (Llama 3, Mixtral)**
- Trading journal (P&L)
- Confidential docs
- PII-containing data

### 9. Scheduling Strategy

**Proactive vs On-demand:**

**Proactive (scheduled):**
- Daily news brief (8:00 AM)
- Trading pre-market analysis (9:00 AM, weekdays)
- Japanese daily practice (9:00 PM)
- Weekly knowledge summary (Sunday 10:00 AM)
- Meta-agent analysis (Sunday 11:00 AM)

**On-demand (user triggered):**
- Trade analysis
- Document generation
- Code prototyping
- Learning sessions
- Quick notes

### 10. Error Handling

**Every operation returns Result<T>:**
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error; message: string };
```

**Benefits:**
- Explicit error handling
- No uncaught exceptions
- Clear error messages
- Debuggable

---

## Integration Points

### 1. Obsidian Integration

**Bidirectional sync:**
- Life AI writes notes → Obsidian reads
- Obsidian edits → Life AI detects changes
- Knowledge graph updates
- No lock-in (plain markdown)

**File watching:**
- Monitor vault for changes
- Re-index on file modification
- Update knowledge graph
- Invalidate caches

### 2. Graphify Integration (Engineer Agent)

**Use cases:**
1. **Before prototyping:**
   - Analyze existing codebase
   - Understand architecture
   - Find god nodes
   - Identify patterns

2. **During learning:**
   - Understand open-source projects
   - Learn framework structure
   - Study design patterns

3. **Meta analysis:**
   - Analyze Life AI codebase itself
   - Find optimization opportunities
   - Detect tight coupling

**Integration approach:**
```bash
# Install Graphify as Pi skill
pi install npm:graphifyy

# Use in engineer agent
Engineer: "Let me analyze the codebase first..."
[Runs /graphify on target repo]
Engineer: "Found 3 god nodes: Server, Database, Router
  Surprise connection: Auth → Logging
  
  Here's my plan based on this architecture..."
```

### 3. Pi Extensions

**Custom extensions to build:**

1. **Orchestrator UI Extension**
   - Multi-agent view in terminal
   - Agent status indicators
   - Quick switching

2. **Inter-agent Messaging Extension**
   - Tools for handoffs
   - Message queue visualization
   - History browser

3. **Privacy Tools Extension**
   - PII detection tools
   - Masking utilities
   - Local/cloud routing

4. **Chart Viewer Extension**
   - Inline chart preview (terminal)
   - ASCII art charts
   - Link to web view

5. **Knowledge Graph Viewer Extension**
   - Terminal graph visualization
   - Interactive navigation
   - Search interface

6. **Audio Handler Extension**
   - Audio upload
   - Whisper transcription
   - Voice command

### 4. Web UI RPC Integration

**Architecture:**
```
Terminal (Pi agents running)
    ↓ RPC mode (stdin/stdout)
Web Server
    ↓ WebSocket
Browser/Mobile
```

**RPC Commands:**
- `list-agents` → Get agent status
- `send-message` → Send to agent
- `get-history` → Retrieve conversation
- `get-artifacts` → List outputs
- `handoff` → Trigger handoff

### 5. Cloud Storage (iCloud Drive)

**Sync strategy:**
- All files in `~/Library/Mobile Documents/com~apple~CloudDocs/life-ai/`
- Automatic sync by macOS
- Mobile access via Files app
- Git for version control (separate)

**What to sync:**
- Obsidian vault
- Knowledge base
- Artifacts
- Preferences
- Schedules

**What NOT to sync:**
- Sessions (too large, frequent changes)
- Logs (local only)
- Temp files
- node_modules

---

## Success Metrics

### Phase Completion Metrics

**Phase 1: Note-taker**
- [ ] All tests pass
- [ ] Type check passes
- [ ] Can capture notes
- [ ] Auto-linking works
- [ ] Knowledge graph builds

**Phase 2: Core Infrastructure**
- [ ] Task distributor routes correctly (90%+ accuracy)
- [ ] Handoffs work smoothly
- [ ] PII detected (95%+ accuracy)
- [ ] CLI is usable

**Phase 3: Trader**
- [ ] Oanda data retrieved
- [ ] Charts render
- [ ] Analysis is useful (subjective)
- [ ] Journal entries saved

**Phase 4-10:**
- Similar criteria for each agent

### System-Wide Metrics

**Performance:**
- Response time < 3s for simple queries
- Chart generation < 5s
- Document export < 10s

**Quality:**
- Test coverage > 80%
- Zero critical security issues
- No PII leaks in logs

**Usability:**
- User can complete task in < 5 interactions
- Handoffs are smooth
- Questions are clear

**Cost:**
- Average daily cost < $5 (adjustable by tier usage)
- Local models reduce cloud costs
- Caching reduces redundant calls

---

## Conclusion

This document serves as the **North Star** for the Life AI project. It captures:

1. **The Vision** - A comprehensive personal AI system
2. **The Architecture** - Multi-agent orchestration with Pi harness
3. **The Agents** - 9 specialized agents with clear responsibilities
4. **The Structure** - Detailed file organization
5. **The Plan** - 10 phases from foundation to polish
6. **The Principles** - Key design decisions and patterns

**Current Status:** Planning complete, ready to start Phase 1  
**Next Steps:** Begin Phase 1 - Foundation & Note-taker Agent

This is a living document. Update it as:
- Agents are implemented
- Architecture evolves
- Lessons are learned
- Requirements change

**Remember:**
- Start simple, iterate
- Test thoroughly
- Privacy first
- Ask before acting
- Learn over time

Let's build something amazing! 🚀

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Author:** Joseph (with AI assistance)  
**License:** Personal use only
