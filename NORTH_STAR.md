# Life AI - North Star Document

**Vision:** A comprehensive personal AI agent orchestration system that assists with all aspects of life - trading, work, learning, health, and knowledge management.

**Date Created:** May 3, 2026  
**Status:** Planning Complete - Phase 1 Implemented (Note-taker Agent)

---

## Quick Links

📖 **Core Documentation**
- [Vision & Philosophy](docs/vision.md) - What Life AI is and why
- [System Architecture](docs/architecture.md) - High-level design and data flow
- [Design Principles](docs/design-principles.md) - Key patterns and practices
- [Technology Stack](docs/technology-stack.md) - Tools and libraries
- [Implementation Plan](docs/implementation-plan.md) - 10-phase roadmap
- [File Structure](docs/file-structure.md) - Complete directory layout

🤖 **Agents**
- [Agent Overview](docs/agents/overview.md) - All 9 agents summary
- [Note-taker Agent](docs/agents/note-taker.md) - ✅ Implemented
- [Individual Agent Specs](docs/agents/) - Detailed specifications

📊 **Status & Progress**
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current progress tracking

---

## What is Life AI?

A **privacy-first, locally-controlled, multi-agent AI system** that acts as your:
- **Second brain** (knowledge management)
- **Trading analyst** (XAUUSD analysis)
- **Work assistant** (PM documentation, code prototyping)
- **Learning companion** (curriculum design, Japanese tutoring)
- **Information curator** (news aggregation)
- **System optimizer** (meta-learning patterns)

---

## The 9 Agents

| # | Agent | Status | Purpose |
|---|-------|--------|---------|
| 1 | Task Distributor | 📋 Planned | Smart routing and orchestration |
| 2 | Trader | 📋 Planned | XAUUSD trading analysis & journaling |
| 3 | PM | 📋 Planned | Product management documents |
| 4 | Engineer | 📋 Planned | Full-stack prototyping & code review |
| 5 | Educator | 📋 Planned | General learning & curriculum design |
| 6 | Language | 📋 Planned | Japanese language learning (JLPT) |
| 7 | News | 📋 Planned | Multi-topic news aggregation |
| 8 | Note-taker | ✅ Implemented | Obsidian vault & knowledge graphs |
| 9 | Meta | 📋 Planned | System optimization & pattern learning |

**See:** [Agent Overview](docs/agents/overview.md) for detailed specifications.

---

## Current Status

### Phase 1: Foundation & Note-taker ✅ Complete

**Implemented:**
- ✅ Project structure and documentation
- ✅ Base agent classes
- ✅ Type system with Result<T> pattern
- ✅ Structured logger
- ✅ Note-taker agent (fully functional)
  - QuickCapture sub-agent
  - AutoLinker sub-agent (TF-IDF similarity)
  - Organizer sub-agent
  - KnowledgeGraph sub-agent
- ✅ 13 tests passing
- ✅ Pre-commit validation (Husky)

**Next:** [Phase 2: Core Infrastructure](docs/implementation-plan.md#phase-2-core-infrastructure)
- Task Distributor Agent
- Message Bus
- Handoff Manager
- Privacy Guard

---

## Core Philosophy

1. **Explicit over Implicit** - Always ask before acting
2. **Problem Decomposition** - Break tasks into clear steps
3. **Privacy-First** - Sensitive data stays local
4. **Learn Over Time** - System observes patterns (with user approval)
5. **Minimal Core** - Use sub-agents for specialization

**See:** [Design Principles](docs/design-principles.md) for detailed patterns.

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm type-check

# Development
pnpm dev
```

---

## Documentation Structure

This North Star document is now split into focused files:

```
docs/
├── vision.md                   # Vision & philosophy
├── architecture.md             # System design
├── design-principles.md        # Key patterns
├── technology-stack.md         # Tools & libraries
├── implementation-plan.md      # Phase-by-phase roadmap
├── file-structure.md           # Directory layout
│
├── agents/                     # Agent specifications
│   ├── overview.md
│   ├── note-taker.md          # ✅ Implemented
│   └── [other agents...]
│
└── workflows/                  # Example workflows
    └── [coming soon]
```

---

## Key Principles

**Development Process:**
- ✅ Test-Driven Development (TDD) - Tests before code
- ✅ Pre-commit validation - Husky hooks ensure quality
- ✅ Incremental progress - Type-check after each change
- ✅ Result<T> pattern - Explicit error handling

**Architecture:**
- Clear separation of concerns
- Base classes for shared behavior
- Sub-agents for specialization (no LLM)
- Agents for decision-making (with LLM)

**Privacy:**
- PII auto-detected and masked
- Trading journal → Local models only
- Cloud models for general tasks
- User controls data routing

**See:** [Design Principles](docs/design-principles.md) for complete list.

---

## Success Metrics

### System-Wide
- Response time < 3s for simple queries
- Test coverage > 80%
- Zero critical security issues
- No PII leaks in logs

### User Experience
- Complete task in < 5 interactions
- Smooth agent handoffs
- Clear questions and responses

---

## Contributing

This is a personal project, but the architecture is designed to be:
- **Understandable** - Clear documentation and examples
- **Testable** - Every component has tests
- **Extensible** - Easy to add new agents/sub-agents
- **Maintainable** - Type-safe, well-structured code

---

## License

Personal use only.

---

**Document Version:** 2.0 (Modular)  
**Last Updated:** May 3, 2026  
**Author:** Joseph (with AI assistance)

---

**Remember:**
- Start simple, iterate
- Test thoroughly
- Privacy first
- Ask before acting
- Learn over time

Let's build something amazing! 🚀
