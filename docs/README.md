# Life AI Documentation

Complete documentation for the Life AI multi-agent system.

---

## Getting Started

**New to Life AI?** Start here:
1. [Vision & Philosophy](vision.md) - Understand the goals
2. [Architecture](architecture.md) - See how it works
3. [Implementation Plan](implementation-plan.md) - Current roadmap

---

## Documentation Index

### Core Concepts
- [Vision & Philosophy](vision.md) - What Life AI is and why
- [System Architecture](architecture.md) - High-level design and data flow
- [Design Principles](design-principles.md) - Key patterns and practices
- [Technology Stack](technology-stack.md) - Tools and libraries
- [File Structure](file-structure.md) - Complete directory layout

### Implementation
- [Implementation Plan](implementation-plan.md) - 10-phase roadmap
- [Implementation Status](../IMPLEMENTATION_STATUS.md) - Current progress

### Agents
- [Agent Overview](agents/overview.md) - All 9 agents summary
- [Note-taker Agent](agents/note-taker.md) - ✅ Implemented (Phase 1)
- [Task Distributor](agents/task-distributor.md) - 📋 Planned (Phase 2)
- [Trader Agent](agents/trader.md) - 📋 Planned (Phase 3)
- [PM Agent](agents/pm.md) - 📋 Planned (Phase 4)
- [Engineer Agent](agents/engineer.md) - 📋 Planned (Phase 5)
- [Educator Agent](agents/educator.md) - 📋 Planned (Phase 6)
- [Language Agent](agents/language.md) - 📋 Planned (Phase 6)
- [News Agent](agents/news.md) - 📋 Planned (Phase 7)
- [Meta Agent](agents/meta.md) - 📋 Planned (Phase 8)

### Workflows (Coming Soon)
- Trading Analysis Workflow
- Document Creation Workflow
- Code Prototyping Workflow
- Learning Session Workflow

---

## Quick Reference

### Architecture Diagram

```
User Interfaces (Terminal, Web, Mobile)
    ↓
Orchestration Layer (Task Distributor, Message Bus)
    ↓
Specialized Agents (9 agents with sub-agents)
    ↓
Data & Memory Layer (Obsidian, Sessions, Artifacts)
```

### Agent Routing

**"I want to analyze a trading setup"** → Trader Agent  
**"Create a PRD for this feature"** → PM Agent  
**"Build a quick prototype"** → Engineer Agent  
**"Teach me about X"** → Educator Agent  
**"Help me practice Japanese"** → Language Agent  
**"What's happening in tech today?"** → News Agent  
**"Save this note"** → Note-taker Agent  
**"How can I improve my workflow?"** → Meta Agent

### Key Principles

1. **Explicit over Implicit** - Always ask before acting
2. **Problem Decomposition** - Break tasks into steps
3. **Privacy-First** - Sensitive data stays local
4. **Test-Driven Development** - Tests before code
5. **Incremental Progress** - Type-check after each change

---

## Document Structure

```
docs/
├── README.md                   # This file
│
├── vision.md                   # Vision & philosophy
├── architecture.md             # System design
├── design-principles.md        # Key patterns (largest file)
├── technology-stack.md         # Tools & libraries
├── implementation-plan.md      # Phase-by-phase roadmap
├── file-structure.md           # Directory layout
│
├── agents/                     # Agent specifications
│   ├── overview.md             # All agents summary
│   ├── note-taker.md           # ✅ Implemented
│   └── [other agents...]       # 📋 Planned
│
└── workflows/                  # Example workflows
    └── [coming soon]
```

---

## Related Files

- [Main README](../README.md) - Project overview
- [North Star](../NORTH_STAR.md) - Quick reference index
- [Implementation Status](../IMPLEMENTATION_STATUS.md) - Current progress
- [Source Code](../src/) - TypeScript implementation
- [Tests](../tests/) - Test suite

---

**Last Updated:** May 3, 2026
