# Life AI

A comprehensive personal AI agent orchestration system.

---

## Overview

Life AI is a **privacy-first, multi-agent AI system** built on the [Pi harness](https://github.com/badlogic/pi) that acts as your:

- 🧠 **Second brain** - Knowledge management with Obsidian integration
- 📈 **Trading analyst** - XAUUSD analysis, journaling, and risk management
- 📋 **Work assistant** - PM documentation and code prototyping
- 🎓 **Learning companion** - Curriculum design and Japanese tutoring
- 📰 **Information curator** - Multi-topic news aggregation
- 🔧 **System optimizer** - Meta-learning and workflow improvement

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm type-check

# Start development
pnpm dev
```

---

## Current Status

### ✅ Phase 1: Foundation & Note-taker (Complete)

**Implemented:**
- Project structure and documentation
- Base agent classes with Result<T> pattern
- Note-taker agent with 4 sub-agents:
  - QuickCapture - Parse and tag notes
  - AutoLinker - TF-IDF-based wiki-link insertion
  - Organizer - Categorize and save to folders
  - KnowledgeGraph - Build and query knowledge graphs
- 13 tests passing
- Pre-commit validation with Husky

**See:** [Implementation Status](IMPLEMENTATION_STATUS.md) for detailed progress.

---

## Documentation

Complete documentation is in [`docs/`](docs/):

### 📖 Core Docs
- [Vision & Philosophy](docs/vision.md) - What Life AI is and why
- [System Architecture](docs/architecture.md) - High-level design
- [Design Principles](docs/design-principles.md) - Key patterns and practices
- [Technology Stack](docs/technology-stack.md) - Tools and libraries
- [Implementation Plan](docs/implementation-plan.md) - 10-phase roadmap
- [File Structure](docs/file-structure.md) - Directory layout

### 🤖 Agents
- [Agent Overview](docs/agents/overview.md) - All 9 agents
- [Note-taker](docs/agents/note-taker.md) - ✅ Implemented

### 📊 Status
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current progress
- [North Star](NORTH_STAR.md) - Quick reference index

---

## The 9 Agents

| # | Agent | Status | Purpose |
|---|-------|--------|---------|
| 1 | Task Distributor | 📋 Planned | Smart routing and orchestration |
| 2 | Trader | 📋 Planned | XAUUSD trading analysis |
| 3 | PM | 📋 Planned | Product management docs |
| 4 | Engineer | 📋 Planned | Code prototyping & review |
| 5 | Educator | 📋 Planned | Learning & curriculum design |
| 6 | Language | 📋 Planned | Japanese language learning |
| 7 | News | 📋 Planned | Multi-topic news aggregation |
| 8 | Note-taker | ✅ Implemented | Obsidian & knowledge graphs |
| 9 | Meta | 📋 Planned | System optimization |

---

## Key Features

### Privacy-First
- Sensitive data (trading journals, P&L) uses local models
- PII automatically detected and masked
- User controls data routing (cloud vs local)

### Test-Driven Development
- Tests written before code
- Pre-commit hooks enforce quality
- 13/13 tests passing for Note-taker

### Explicit Over Implicit
- Agents always ask before acting
- Show plan before implementation
- User approval required for handoffs

### Knowledge Management
- Obsidian-compatible markdown notes
- Auto-linking via TF-IDF similarity
- Knowledge graph construction
- Category-based organization

---

## Technology Stack

- **Runtime:** Node.js 18+ with TypeScript
- **Agent Harness:** Pi by badlogic
- **Testing:** Vitest
- **Storage:** Obsidian vault (Markdown + YAML)
- **NLP:** natural library (TF-IDF, tokenization)
- **Models:** GPT-4, Claude, local Ollama

**See:** [Technology Stack](docs/technology-stack.md) for complete list.

---

## Project Structure

```
life-ai/
├── docs/                   # 📚 Documentation
├── src/                    # 💻 Source code
│   ├── agents/            # Agent implementations
│   ├── core/              # Orchestration layer
│   ├── memory/            # Shared state
│   └── utils/             # Utilities
├── data/                   # 📊 Data storage
│   ├── obsidian-vault/    # Markdown notes
│   ├── sessions/          # Pi sessions
│   └── artifacts/         # Agent outputs
├── tests/                  # ✅ Tests
├── config/                 # ⚙️  Configuration
└── scripts/                # 🤖 Automation
```

**See:** [File Structure](docs/file-structure.md) for complete layout.

---

## Development Principles

1. **TDD Mandatory** - Tests before code
2. **Type Safety First** - TypeScript strict mode
3. **Incremental Progress** - Type-check after each change
4. **Result<T> Pattern** - Explicit error handling
5. **Pre-commit Validation** - Husky enforces quality

**See:** [Design Principles](docs/design-principles.md) for complete list.

---

## Next Steps

**Phase 2: Core Infrastructure** (2 weeks)
- Task Distributor Agent (routing)
- Message Bus (inter-agent communication)
- Handoff Manager (explicit handoffs)
- Privacy Guard (PII detection)
- Simple CLI interface

**See:** [Implementation Plan](docs/implementation-plan.md) for full roadmap.

---

## Contributing

This is a personal project, but the architecture is designed to be:
- **Understandable** - Clear docs and examples
- **Testable** - Every component has tests
- **Extensible** - Easy to add agents/sub-agents
- **Maintainable** - Type-safe, well-structured

---

## License

Personal use only.

---

**Version:** 1.0.0  
**Last Updated:** May 3, 2026  
**Author:** Joseph (with AI assistance)
