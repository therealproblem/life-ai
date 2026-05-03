# Life AI - File Structure

Complete directory layout and organization.

---

## Root Structure

```
~/Library/Mobile Documents/com~apple~CloudDocs/life-ai/
│
├── README.md                           # Project overview
├── NORTH_STAR.md                       # Quick reference (points to docs/)
├── IMPLEMENTATION_STATUS.md            # Current progress tracking
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vitest.config.ts                    # Test configuration
├── .env                                # Environment variables (gitignored)
├── .env.example                        # Environment template
├── .gitignore                          # Git ignore rules
│
├── docs/                               # 📚 Documentation
├── src/                                # 💻 Source code
├── config/                             # ⚙️  Configuration
├── data/                               # 📊 Data storage
├── prompts/                            # 📝 Agent prompts
├── skills/                             # 🛠️  Pi skills
├── extensions/                         # 🔌 Pi extensions
├── scripts/                            # 🤖 Automation
├── tests/                              # ✅ Tests
└── logs/                               # 📋 Application logs
```

---

## Documentation (`docs/`)

```
docs/
├── vision.md                           # Vision & philosophy
├── architecture.md                     # System architecture
├── design-principles.md                # Key design patterns
├── technology-stack.md                 # Tools and libraries
├── implementation-plan.md              # Phase-by-phase roadmap
├── file-structure.md                   # This file
│
├── agents/                             # Agent specifications
│   ├── overview.md                     # All agents summary
│   ├── task-distributor.md
│   ├── trader.md
│   ├── pm.md
│   ├── engineer.md
│   ├── educator.md
│   ├── language.md
│   ├── news.md
│   ├── note-taker.md                   # ✅ Implemented
│   └── meta.md
│
└── workflows/                          # Example workflows
    ├── trading-analysis.md
    ├── document-creation.md
    ├── prototyping.md
    └── learning-session.md
```

---

## Source Code (`src/`)

```
src/
├── index.ts                            # Main entry point (CLI)
├── types.ts                            # Shared TypeScript types
│
├── core/                               # Orchestration engine
│   ├── orchestrator.ts                 # Main orchestration logic
│   ├── task-distributor.ts             # Agent #1: Router
│   ├── context-manager.ts              # Shared context between agents
│   ├── message-bus.ts                  # Inter-agent communication
│   ├── handoff-manager.ts              # Explicit handoff coordination
│   ├── model-manager.ts                # Local vs cloud model selection
│   ├── privacy-guard.ts                # PII detection & masking
│   └── scheduler.ts                    # Proactive task scheduling
│
├── agents/
│   ├── base/
│   │   ├── agent.ts                    # ✅ Base agent class
│   │   ├── sub-agent.ts                # ✅ Base sub-agent class
│   │   └── agent-config.ts             # Agent configuration interface
│   │
│   ├── note-taker/                     # ✅ Implemented
│   │   ├── note-taker-agent.ts
│   │   ├── sub-agents/
│   │   │   ├── quick-capture.ts
│   │   │   ├── auto-linker.ts
│   │   │   ├── organizer.ts
│   │   │   └── knowledge-graph.ts
│   │   ├── tools/
│   │   │   ├── markdown-parser.ts
│   │   │   ├── file-operations.ts
│   │   │   ├── tf-idf.ts
│   │   │   └── graph-builder.ts
│   │   └── types.ts
│   │
│   └── [other agents - see docs/agents/]
│
├── memory/                             # Shared memory & state
│   ├── session-store.ts                # Pi session management
│   ├── artifact-store.ts               # Outputs between agents
│   ├── conversation-history.ts         # Cross-agent conversations
│   └── preference-store.ts             # User preferences database
│
├── web-ui/                             # Web dashboard (Phase 9)
│   ├── server.ts                       # Express/Fastify server
│   ├── rpc-client.ts                   # Connect to pi agents via RPC
│   └── [components, pages, etc.]
│
└── utils/                              # Utilities
    ├── pi-wrapper.ts                   # ✅ Pi SDK helpers
    ├── logger.ts                       # ✅ Structured logging
    ├── audio-transcriber.ts            # Whisper integration
    ├── pii-detector.ts                 # PII pattern matching
    ├── cloudflare-tunnel.ts            # Tunnel configuration
    └── git-helpers.ts                  # Git automation
```

---

## Configuration (`config/`)

```
config/
├── agents.json                         # Agent configs & model assignments
├── models.json                         # Model tier definitions
├── preferences.json                    # Learned user preferences (auto-gen)
├── schedules.json                      # Proactive agent schedules
├── privacy.json                        # PII masking rules
├── workflows.json                      # Cross-agent workflow definitions
└── templates/
    ├── corporate-doc.docx              # Company document template
    ├── corporate-presentation.pptx     # Company presentation template
    └── style-guide.json                # Brand guidelines
```

---

## Data Storage (`data/`)

```
data/
├── obsidian-vault/                     # ✅ Obsidian-compatible notes
│   ├── Welcome.md                      # ✅ Sample note
│   ├── trading/
│   ├── learning/
│   ├── japanese/
│   ├── projects/
│   ├── meetings/
│   ├── ideas/
│   └── daily-notes/
│
├── knowledge-base/                     # ✅ Structured KB
│   ├── graph.json                      # ✅ Knowledge graph
│   └── [category-specific data]
│
├── sessions/                           # ✅ Pi session storage (per agent)
│   ├── distributor/
│   ├── trader/
│   ├── note-taker/
│   └── [other agents]
│
├── artifacts/                          # ✅ Agent outputs
│   ├── trading/
│   ├── documents/
│   ├── prototypes/
│   └── news/
│
└── temp/                               # ✅ Temporary scratch space
```

---

## Prompts (`prompts/`)

System prompts for each agent:

```
prompts/
├── distributor.md                      # Task routing instructions
├── trader.md                           # Trading analysis guidelines
├── pm.md                               # PM best practices
├── engineer.md                         # Coding standards (SOLID/DRY)
├── educator.md                         # Teaching methodology
├── language.md                         # Language learning approach
├── news.md                             # News curation guidelines
├── note-taker.md                       # ✅ Note organization rules
└── meta.md                             # Meta-learning objectives
```

---

## Pi Skills (`skills/`)

Reusable agent capabilities:

```
skills/
├── trading-analysis/
│   └── SKILL.md
├── chart-review/
│   └── SKILL.md
├── document-creation/
│   └── SKILL.md
├── code-review/
│   └── SKILL.md
├── learn-topic/
│   └── SKILL.md
├── japanese-practice/
│   └── SKILL.md
├── quick-note/
│   └── SKILL.md
└── graphify/                           # Code analysis skill (external)
    └── SKILL.md
```

---

## Pi Extensions (`extensions/`)

Custom Pi TUI and tools:

```
extensions/
├── orchestrator-ui.ts                  # Custom TUI for multi-agent view
├── inter-agent-messaging.ts            # Tools for agent handoffs
├── privacy-tools.ts                    # PII masking tools
├── chart-viewer.ts                     # Inline chart preview in terminal
├── knowledge-graph-viewer.ts           # Graph visualization command
└── audio-handler.ts                    # Audio upload/transcription
```

---

## Scripts (`scripts/`)

Automation and utilities:

```
scripts/
├── setup.js                            # ✅ Initial setup
├── start-terminal.sh                   # Launch pi terminal interface
├── start-web.sh                        # Launch web UI + Cloudflare tunnel
├── backup.sh                           # Backup knowledge base
├── sync-obsidian.sh                    # Sync vault with KB structure
└── run-scheduled.sh                    # Cron job for proactive agents
```

---

## Tests (`tests/`)

```
tests/
├── unit/
│   ├── agents/
│   │   └── note-taker.test.ts          # ✅ 13 tests passing
│   ├── tools/
│   └── utils/
│
├── integration/
│   ├── agent-handoffs.test.ts
│   ├── knowledge-base.test.ts
│   └── export-pipeline.test.ts
│
└── e2e/
    ├── trading-workflow.test.ts
    ├── document-creation.test.ts
    └── learning-session.test.ts
```

---

## Version Control Strategy

### Tracked in Git
- Source code (`src/`)
- Configuration (`config/`, `package.json`, `tsconfig.json`)
- Documentation (`docs/`, `README.md`, `NORTH_STAR.md`)
- Test vault (`data/obsidian-vault/` - safe test data)
- Scripts and extensions

### Ignored (`.gitignore`)
- Dependencies (`node_modules/`)
- Build outputs (`dist/`)
- Secrets (`.env`)
- Sessions (`data/sessions/` - personal, large)
- Temporary files (`data/temp/`)
- Generated artifacts (`data/artifacts/`)
- Knowledge base (`data/knowledge-base/` - derived)
- Logs (`logs/`)

---

**See also:**
- [Design Principles](design-principles.md#15-version-control-strategy) - Git strategy rationale
- [Architecture](architecture.md) - How components fit together
- [Implementation Status](../IMPLEMENTATION_STATUS.md) - Current progress
