# Spec Kit

Spec Kit is a **Spec-Driven Development (SDD) toolkit** from GitHub that inverts the traditional code-first approach. Instead of treating specifications as scaffolding for code, **specifications become the primary development artifact** that directly generates working implementations.

## Core Philosophy

- **Intent-driven**: Specifications define the "what" before the "how"
- **Multi-step refinement**: Not one-shot code generation from prompts
- **Heavy AI reliance**: Uses advanced AI models for specification interpretation
- **Rich specifications**: Uses guardrails and organizational principles

## Core Commands (Slash Commands)

| Command                  | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `/speckit.constitution`  | Create or update project principles and guidelines     |
| `/speckit.specify`       | Transform natural language into structured specs       |
| `/speckit.clarify`       | Identify and resolve ambiguous areas in specs          |
| `/speckit.plan`          | Generate technical implementation plans with architecture |
| `/speckit.analyze`       | Cross-artifact consistency and quality analysis        |
| `/speckit.tasks`         | Generate dependency-ordered task breakdown             |
| `/speckit.taskstoissues` | Convert tasks into GitHub issues                       |
| `/speckit.implement`     | Execute all tasks to build the feature                 |

## Typical Workflow

```bash
# 1. Initialize project
specify init my-project --ai claude

# 2. Establish principles
/speckit.constitution Create principles focused on simplicity...

# 3. Create feature specification
/speckit.specify Build a feature where users can...

# 4. Clarify ambiguities (optional)
/speckit.clarify

# 5. Create implementation plan
/speckit.plan Use React with TypeScript...

# 6. Analyze consistency (optional)
/speckit.analyze

# 7. Generate tasks
/speckit.tasks

# 8. Execute implementation
/speckit.implement
```

## Generated Artifacts

| File              | Description                                    |
| ----------------- | ---------------------------------------------- |
| `spec.md`         | User stories, functional requirements, success criteria |
| `plan.md`         | Tech stack, architecture, component structure  |
| `research.md`     | Best practices, decision rationale             |
| `data-model.md`   | Entity definitions                             |
| `contracts/`      | Internal API definitions                       |
| `tasks.md`        | Dependency-ordered implementation tasks        |

## Command Details

### `/speckit.specify`

Transforms natural language feature descriptions into structured specifications:

- Creates semantic branch names automatically
- Generates `spec.md` with user stories, functional requirements (FR-XXX), and success criteria (SC-XXX)
- Manages feature numbering (001, 002, etc.)

### `/speckit.plan`

Generates technical implementation plans:

- Phase 0: Research - investigates tech choices, documents decisions
- Phase 1: Design - data models, API contracts, quickstart examples
- Updates agent-specific context files (CLAUDE.md, AGENTS.md, etc.)

### `/speckit.tasks`

Analyzes implementation plans and generates:

- Dependency-ordered task list organized by user story
- Parallel execution opportunities marked with `[P]`
- Task-to-story linking with `[Story: US1]` markers
- Dependency graphs and checkpoints

### `/speckit.clarify`

Identifies underspecified areas and:

- Asks up to 5 targeted clarification questions
- Encodes answers back into the spec
- Resolves `[NEEDS CLARIFICATION]` markers

### `/speckit.analyze`

Performs non-destructive analysis:

- Cross-artifact consistency checks
- Quality analysis across spec.md, plan.md, and tasks.md
- Identifies gaps and inconsistencies

## Resources

- [GitHub Repository](https://github.com/github/spec-kit)
- [Documentation](https://github.com/github/spec-kit/blob/main/docs/index.md)
