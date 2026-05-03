# Life AI - Agent Roster

This directory contains detailed specifications for each of the 9 specialized agents.

---

## Agent Overview

| # | Agent | Status | Purpose |
|---|-------|--------|---------|
| 1 | [Task Distributor](task-distributor.md) | 📋 Planned | Smart routing and orchestration |
| 2 | [Trader](trader.md) | 📋 Planned | XAUUSD trading analysis & journaling |
| 3 | [PM](pm.md) | 📋 Planned | Product management documents |
| 4 | [Engineer](engineer.md) | 📋 Planned | Full-stack prototyping & code review |
| 5 | [Educator](educator.md) | 📋 Planned | General learning & curriculum design |
| 6 | [Language](language.md) | 📋 Planned | Japanese language learning (JLPT) |
| 7 | [News](news.md) | 📋 Planned | Multi-topic news aggregation |
| 8 | [Note-taker](note-taker.md) | ✅ Implemented | Obsidian vault & knowledge graphs |
| 9 | [Meta](meta.md) | 📋 Planned | System optimization & pattern learning |

---

## Quick Reference

### When to Use Which Agent

**"I want to analyze a trading setup"** → Trader Agent  
**"Create a PRD for this feature"** → PM Agent  
**"Build a quick prototype of X"** → Engineer Agent  
**"Teach me about topic X"** → Educator Agent  
**"Help me practice Japanese"** → Language Agent  
**"What's happening in tech today?"** → News Agent  
**"Save this note"** → Note-taker Agent  
**"How can I improve my workflow?"** → Meta Agent

The **Task Distributor** automatically routes requests to the appropriate agent.

---

## Common Patterns

### Agent Communication
All agents follow the same communication protocol:
1. Receive task from distributor
2. Ask clarifying questions
3. Execute with sub-agents
4. Optionally request handoff
5. Save outputs to appropriate location

### Privacy Handling
Agents that handle sensitive data:
- **Trader** - Trading journal with P&L → Local model
- **PM** - Confidential company docs → Local model option
- **Meta** - Usage analytics → PII masked

### Sub-agent Architecture
Each agent has specialized sub-agents:
- No separate LLM sessions (just helper functions)
- Focused, single-purpose responsibilities
- Independently testable
- Reusable across contexts

---

**See also:**
- [Architecture](../architecture.md) - System design overview
- [Design Principles](../design-principles.md) - Key patterns
- [Data Flow](../architecture.md#data-flow-patterns) - How agents communicate
