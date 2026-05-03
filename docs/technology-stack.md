# Life AI - Technology Stack

---

## Core Infrastructure

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Agent Harness** | Pi (by badlogic) | Proven terminal coding harness, extensible, sessions |
| **Runtime** | Node.js 18+ | Required by Pi, excellent ecosystem |
| **Language** | TypeScript | Type safety, better tooling, catches errors early |
| **Package Manager** | pnpm | Faster than npm, disk space efficient |
| **Testing** | Vitest | Fast, better TS support than Jest |

---

## Agent Layer

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **LLM Orchestration** | Pi SDK | createAgentSession, session management |
| **Primary Models** | GPT-4, Claude Opus (Tier 1) | Best reasoning for complex tasks |
| **Standard Models** | GPT-4o-mini, Claude Sonnet (Tier 2) | Good balance of cost/performance |
| **Economy Models** | GPT-3.5-turbo, Haiku (Tier 3) | Fast, cheap for simple tasks |
| **Local Models** | Ollama (Llama 3, Mixtral) | Privacy-sensitive data |

---

## Data & Knowledge

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Note Storage** | Obsidian Vault (Markdown) | Future-proof, human-readable, git-friendly |
| **Frontmatter** | gray-matter | YAML metadata in markdown |
| **Knowledge Graph** | Custom (JSON) | NetworkX-inspired, lightweight |
| **NLP** | natural library | TF-IDF, tokenization, similarity |
| **Vector Search** | (Future: Qdrant or local) | Semantic search when needed |

---

## Specialized Tools

### Trading Agent
- **Market Data:** Oanda REST API
- **Charts:** TradingView Lightweight Charts
- **Scraping:** Beautiful Soup (Python) or Cheerio (Node)
- **Data Export:** ExcelJS

### PM Agent
- **DOCX:** docxtemplater
- **PPTX:** pptxgenjs
- **PDF:** Puppeteer
- **XLSX:** ExcelJS

### Engineer Agent
- **Code Analysis:** Graphify (Tree-sitter + NetworkX)
- **AST Parsing:** Tree-sitter
- **Scaffolding:** Custom templates
- **Git:** simple-git library

### Educator Agent
- **SRS Algorithm:** SM-2 (Anki-style)
- **Quiz Engine:** Custom
- **Progress Tracking:** JSON + SQLite (future)

### Language Agent
- **Kanji Database:** KANJIDIC2
- **Dictionary:** JMdict
- **TTS:** OpenAI TTS / Google TTS
- **Speech Recognition:** OpenAI Whisper

### News Agent
- **RSS:** feedparser
- **Web Scraping:** Beautiful Soup / Cheerio
- **Deduplication:** Text similarity algorithms

---

## Web UI

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Frontend Framework** | React / Next.js | Industry standard, great ecosystem |
| **Backend** | Express / Fastify | Simple REST + WebSocket |
| **RPC Client** | Custom (Pi RPC mode) | Connect to terminal agents |
| **Charts** | TradingView Lightweight Charts | Trading charts |
| **Graph Viz** | D3.js | Knowledge graph visualization |
| **Mobile** | Progressive Web App (PWA) | No separate mobile app needed |
| **Deployment** | Cloudflare Tunnel | Secure access without port forwarding |

---

## Storage & Sync

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Primary Storage** | iCloud Drive | Already in use, syncs across devices |
| **Obsidian Vault** | iCloud sync | Native Obsidian support |
| **Session Storage** | Pi JSONL files | Built-in to Pi harness |
| **Preferences** | JSON files | Simple, editable, version-controllable |

---

## Development Tools

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Pre-commit Hooks** | Husky | Industry standard, auto-setup on install |
| **Type Checking** | TypeScript strict mode | Catch errors at compile time |
| **Linting** | ESLint | Code quality and consistency |
| **Formatting** | Prettier | Auto-format on save |

---

**See also:**
- [Architecture](architecture.md) - How components fit together
- [Design Principles](design-principles.md) - Model tier strategy
- [File Structure](file-structure.md) - Where everything lives
