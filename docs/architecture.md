# Life AI - System Architecture

---

## High-Level Overview

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

## Data Flow Patterns

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
1. **Before prototyping:** Analyze existing codebase
2. **During learning:** Understand open-source projects
3. **Meta analysis:** Analyze Life AI codebase itself

### 3. Pi Extensions

**Custom extensions to build:**
1. **Orchestrator UI Extension** - Multi-agent view
2. **Inter-agent Messaging Extension** - Message queue visualization
3. **Privacy Tools Extension** - PII detection tools
4. **Chart Viewer Extension** - Inline chart preview
5. **Knowledge Graph Viewer Extension** - Terminal graph visualization
6. **Audio Handler Extension** - Whisper transcription

### 4. Web UI RPC Integration

**Architecture:**
```
Terminal (Pi agents running)
    ↓ RPC mode (stdin/stdout)
Web Server
    ↓ WebSocket
Browser/Mobile
```

### 5. Cloud Storage (iCloud Drive)

**Sync strategy:**
- All files in `~/Library/Mobile Documents/com~apple~CloudDocs/life-ai/`
- Automatic sync by macOS
- Mobile access via Files app
- Git for version control (separate)

**What to sync:**
- Obsidian vault, Knowledge base, Artifacts, Preferences, Schedules

**What NOT to sync:**
- Sessions (too large), Logs, Temp files, node_modules

---

**See also:**
- [Agents](agents/) - Individual agent details
- [File Structure](file-structure.md) - Complete directory layout
- [Technology Stack](technology-stack.md) - Tools and libraries
