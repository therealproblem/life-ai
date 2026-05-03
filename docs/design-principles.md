# Life AI - Key Design Principles

---

## 1. Explicit Confirmation Required

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

---

## 2. Problem Decomposition

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

---

## 3. Privacy-First

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

---

## 4. Learn Preferences, Don't Assume

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

---

## 5. Sub-agents for Specialization

**When to create a sub-agent:**
- Distinct, focused responsibility
- Reusable across contexts
- Can be tested independently
- Doesn't need own LLM session (just helper functions)

**When NOT to:**
- One-time use
- Tightly coupled to parent
- Too granular (over-engineering)

---

## 6. Git Workflow Best Practices

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

---

## 7. SOLID & DRY Enforcement

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

---

## 8. Model Tier Strategy

**Tier 1 (Premium): GPT-4, Claude Opus**
- Trading analysis, Curriculum design, Architecture planning, Complex reasoning

**Tier 2 (Standard): GPT-4o-mini, Claude Sonnet**
- Code generation, Document writing, Teaching, Most tasks

**Tier 3 (Economy): GPT-3.5-turbo, Haiku**
- Summarization, News aggregation, Simple formatting, Repetitive tasks

**Local: Ollama (Llama 3, Mixtral)**
- Trading journal (P&L), Confidential docs, PII-containing data

---

## 9. Scheduling Strategy

**Proactive (scheduled):**
- Daily news brief (8:00 AM)
- Trading pre-market analysis (9:00 AM, weekdays)
- Japanese daily practice (9:00 PM)
- Weekly knowledge summary (Sunday 10:00 AM)
- Meta-agent analysis (Sunday 11:00 AM)

**On-demand (user triggered):**
- Trade analysis, Document generation, Code prototyping, Learning sessions, Quick notes

---

## 10. Error Handling

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

## 11. Development Process Principles

**Ask questions one at a time:**
- Present single decision points with clear recommendations
- Provide pros/cons for each option
- Wait for confirmation before proceeding
- No assumptions - always get explicit approval

**Break down complex decisions:**
- When options are unclear, explain tradeoffs in detail
- Help user make informed choices
- Show examples of each approach
- Explain why certain options are recommended

**Justify every piece of code:**
- Question "why do we need this?"
- Every component must have clear purpose
- Remove unnecessary complexity
- Document the reasoning behind design decisions

### AI Assistant Collaboration Guidelines

How the AI assistant improves based on learned patterns:

1. **Explain WHY Before HOW**
   - Show reasoning upfront, not just recommendations
   - Example: "Option A because it's simpler (30 lines vs 100), and we only have 4 configs"

2. **Show System Impact**
   - Map how changes propagate through the system
   - Identify all affected components before implementing

3. **Provide Concrete Comparisons**
   - Show real code examples, not abstract descriptions
   - Include line counts, complexity metrics, actual implementations

4. **Question Own Recommendations**
   - Pre-emptively address potential issues
   - Challenge suggestions: "What if we need X in the future?"

5. **Explain Trade-offs Upfront**
   - Frame decisions as explicit trade-offs
   - "Choosing between: type safety vs simplicity vs flexibility"

6. **Connect to Existing Patterns**
   - Show how new code fits with established patterns
   - Maintain consistency across the codebase

7. **Validate Understanding**
   - Confirm reasoning, not just choices
   - "You chose Option A because [reason]. Is my understanding correct?"

8. **Flag Future Implications**
   - Think ahead to upcoming features
   - Document tech debt vs. addressing now

9. **Catch Issues Earlier**
   - Type-check logic mentally before coding
   - Verify assumptions before implementation

10. **Document Decisions in Code**
    - Add comments explaining WHY, not just WHAT
    - Make code self-explanatory for future developers

### Post-Commit Reflection Workflow

After every commit, the AI assistant must:

1. **Reflect on learnings** - What was learned about the user's preferences, work style, and decision-making patterns since the last commit?

2. **Identify patterns** - What recurring themes emerged? How does the user approach problems?

3. **Recommend actionables** - What specific improvements will the AI make going forward based on these learnings?

4. **Validate understanding** - Present learnings and ask "Is this accurate?"

5. **Get buy-in** - Explain "how will I do better?" and get user confirmation on the approach

6. **Document in design-principles.md** - Add validated learnings to this section for persistent context

This creates a continuous improvement loop where the AI adapts to the user's unique working style.

### Validated Actionables (Updated Post-Commit)

Learned behaviors the AI commits to following:

1. **Always Compare Options with Concrete Metrics**
   - Don't just say "A is better" - show why with data
   - Include: line counts, file sizes, complexity measures
   - Provide real code examples, not abstract descriptions
   - Example: "Option A: 30 lines, Option B: 100 lines. Here's the actual code..."

2. **Think About Future Scenarios**
   - Consider maintainability, not just immediate functionality
   - Ask: "What if you clone this repo later?"
   - Ask: "What if someone else contributes?"
   - Design for longevity and team scale, not just solo/now

3. **Question Own Recommendations**
   - Before recommending A, explicitly consider why not B or C
   - Present the comparison, not just the conclusion
   - Be willing to change recommendation when better arguments emerge
   - Example: "I initially thought A, but after comparing... C is better because..."

4. **Prefer Industry Standards**
   - Choose tools other developers recognize (Husky vs manual hooks)
   - Proven solutions over clever custom implementations
   - Better documentation, community support, and future hiring
   - Balance: standards when available, custom when needed

5. **Test Immediately After Building**
   - After writing ANY code, ask: "Should I write tests for this now?"
   - Reference principle #12: "TDD - write tests first"
   - Don't assume testing comes later
   - Tests are part of implementation, not afterthought

6. **Self-Police Against Mistakes**
   - Check against documented principles before suggesting
   - Don't wait for user to catch violations
   - Example: Should have suggested tests for file-operations immediately

*This section updates after each validated post-commit reflection*

---

## 12. Code Quality Principles

**Type safety first:**
- TypeScript strict mode always enabled
- Runtime validation with Zod schemas
- Prefer compile-time errors over runtime failures
- Use generics for flexible but type-safe APIs

**Incremental progress:**
- Build one component at a time
- Run `pnpm type-check` after each change
- Catch errors early before building more
- Small, testable increments

**Start simple, add complexity gradually:**
- Minimal implementation first
- Add features when actually needed
- "Easier to diagnose issues and better breakdown"
- Don't over-engineer upfront

**Example:**
```typescript
// Start simple
class Agent {
  execute() { ... }
}

// Add complexity when needed
class Agent {
  async initialize() { ... }
  execute() { ... }
  validate() { ... }
  cleanup() { ... }
}
```

**Test-Driven Development (TDD):**

Mandatory workflow for all new features:

1. **Decide what to build**
   - Agree on feature scope and requirements
   - Define inputs, outputs, and behavior
   - Identify dependencies

2. **Design test cases**
   - Show what will be tested BEFORE writing code
   - List all test scenarios
   - Cover success cases (happy path)
   - Cover error cases (edge cases, failures)
   - Cover boundary conditions
   - Get user approval on test plan

3. **Write tests first**
   - Implement test cases (they will fail - red)
   - Tests document expected behavior
   - Forces thinking about edge cases upfront

4. **Build the feature**
   - Write minimum code to make tests pass (green)
   - Focus on functionality, not perfection
   - Let tests guide implementation

5. **Verify**
   - Run tests: `pnpm test`
   - Type-check: `pnpm type-check`
   - All tests must pass before continuing

6. **Refactor**
   - Clean up code while tests stay green
   - Improve naming, structure, documentation
   - Tests protect against breaking changes

**Benefits of TDD:**
- Catches bugs before they exist
- Forces clear requirements thinking
- Documents expected behavior (tests as specs)
- Prevents scope creep (only build what's tested)
- Ensures testability (can't write untestable code)
- Faster debugging (tests pinpoint failures)
- Confidence in refactoring (tests verify correctness)

**Example TDD workflow:**
```
AI: "Building markdown-parser.ts. Here are the test cases I plan:
  1. Parse frontmatter from markdown
  2. Extract wiki-links from content
  3. Handle missing frontmatter
  4. Handle malformed YAML
  5. Return empty array when no links
  
Should I proceed with these tests?"

User: "Yes"

AI: [Writes tests - all fail]
AI: [Implements markdown-parser.ts]
AI: [Tests pass]
AI: "All 5 tests passing. Feature complete."
```

**When to skip TDD:**
- Never. If it's code, it needs tests.
- Prototyping/spikes: Mark clearly as "experimental", delete or test before merging

**Pre-Commit Validation:**

Every commit must pass validation before being accepted:

1. **Automated with Husky**
   - Git pre-commit hook runs automatically
   - Cannot commit if validation fails
   - Configured in `.husky/pre-commit`

2. **Validation steps:**
   ```bash
   pnpm type-check  # TypeScript compilation
   pnpm test --run  # All tests must pass
   ```

3. **Benefits:**
   - Main branch always builds
   - No broken commits
   - Tests can't be forgotten
   - Quality enforced, not requested

4. **Setup for new developers:**
   ```bash
   pnpm install  # Automatically sets up hooks
   ```
   Husky's `prepare` script installs hooks on `pnpm install`

**Why Husky over manual hooks:**
- Version controlled (`.husky/` committed to repo)
- Automatic setup for all developers
- Shareable and maintainable
- Industry standard (recognizable by other devs)

---

## 13. Error Handling Philosophy

**Catch errors early and often:**
- Type-check after every significant change
- Don't accumulate technical debt
- Fix errors immediately before continuing
- Errors reveal design issues - learn from them

**Verify APIs before implementation:**
- Check actual exports, don't assume
- Read type signatures carefully
- Test assumptions with small examples
- Don't trust documentation alone - verify

**Learn from mistakes:**
- Wrong import? Check the actual module exports
- Type mismatch? Understand what the API expects
- Version conflict? Check breaking changes
- Each error teaches API design patterns

**Example lessons:**
```typescript
// ✗ Assumed: readOnlyTools (doesn't exist)
// ✓ Verified: createReadOnlyTools(cwd) (actual export)

// ✗ Assumed: tools: Tool[] (wrong type)
// ✓ Verified: tools: string[] (API expects names)
```

---

## 14. Architecture Principles

**Clear separation of concerns:**
- Each class/module has one focused responsibility
- Base classes for shared behavior
- Sub-agents for specialized tasks (no LLM)
- Agents for decision-making (with LLM)

**Understand foundation before building up:**
- Build infrastructure first (types, base classes, utils)
- Test base components before using them
- Don't build on shaky foundations
- Each layer depends on stable lower layers

**Prefer explicit over implicit:**
- Configuration is explicit, not hidden
- Dependencies are clear in constructors
- No magic - everything is traceable
- Factory methods over complex constructors

**Independently testable components:**
- Each module can be tested in isolation
- Mock dependencies cleanly
- Use dependency injection
- Result<T> for predictable error handling

**Example structure:**
```typescript
// Foundation layer
export type Result<T> = ...
export class Logger { ... }

// Base layer (depends on foundation)
export abstract class BaseAgent { ... }
export abstract class SubAgent { ... }

// Implementation layer (depends on base)
export class NoteTakerAgent extends BaseAgent { ... }
export class AutoLinker extends SubAgent { ... }
```

---

## 15. Version Control Strategy

**What gets tracked in Git:**
- Source code (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`docs/`)
- Test vault (`data/obsidian-vault/`) - safe test data
- Project structure (empty directories via `.gitkeep` if needed)

**What stays ignored:**
- Dependencies (`node_modules/`)
- Build outputs (`dist/`)
- Environment secrets (`.env`)
- Session history (`data/sessions/`) - can be large, personal
- Temporary files (`data/temp/`)
- Generated artifacts (`data/artifacts/`)
- Knowledge base (`data/knowledge-base/`) - derived from vault
- Logs (`logs/`)

**Rationale:**

**Test vault tracked because:**
- Small size (just examples)
- Helps onboarding (clone and go)
- Test data is safe to share
- Consistency across environments
- Documents expected structure

**Sessions ignored because:**
- Can grow very large (100s of MB)
- Personal conversation history
- Contains API request/response data
- Easily regenerated
- Each developer has own sessions

**Artifacts ignored because:**
- Generated outputs (documents, charts, reports)
- Can be reproduced
- May contain user-specific data
- Keeps repo focused on source

**Example .gitignore:**
```gitignore
# Track source and config
src/
package.json
tsconfig.json

# Track test data
data/obsidian-vault/

# Ignore runtime data
data/sessions/
data/temp/
data/artifacts/
data/knowledge-base/

# Ignore dependencies and builds
node_modules/
dist/
```

---

**See also:**
- [Vision](vision.md) - Project philosophy
- [Architecture](architecture.md) - System design
- [Code Quality](code-quality.md) - Standards and best practices
