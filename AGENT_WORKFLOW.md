# Agent-Driven Development Workflow

This document defines the execution model and lifecycle for an AI-driven development system using Git worktrees and feature cards.

The goal is to allow an AI agent to autonomously implement features in an isolated environment, while keeping humans in control of approval and merging.

---

## Core Concepts

### Feature Card
A **Feature Card** represents a unit of work.
It is stored as a JSON file and acts as the single source of truth for the task.

Path:
```
.makyno/features/{featureId}/feature.json
```

The feature card:
- Describes what needs to be built
- Defines constraints and expectations
- Tracks execution status
- Is readable and writable by the AI agent

---

### Git Worktree
Each feature is executed inside a **dedicated Git worktree**.

This provides:
- A fully isolated working directory
- A dedicated git branch
- Zero interference with other features or `main`

The worktree is the **execution sandbox** for the AI agent.

---

### AI Agent
The AI agent:
- Reads feature requirements from `feature.json`
- Reads and modifies code inside the worktree
- Executes allowed shell commands
- Commits changes to the feature branch
- Never merges code by itself

The agent does **not** have direct access to the main repository.

---

## Workflow Overview

1. User creates a feature
2. Feature is moved to "In Progress"
3. Feature card (JSON) is created
4. Git worktree is created
5. AI agent is spawned
6. Agent implements the feature
7. Feature is marked as completed
8. Human reviews and merges

---

## Detailed Execution Flow

### 1. Feature Creation (User Action)

The user creates a new feature via the UI (e.g. Kanban board).

At this stage, no code execution happens.

---

### 2. Feature Moved to "In Progress"

When the user moves the feature card from **Todo** to **In Progress**, this acts as a trigger.

This event starts the automated execution workflow.

---

### 3. Feature Card Initialization

The backend creates a feature directory and a `feature.json` file.

Example structure:
```
.makyno/
  features/
    feat-123/
      feature.json
```

Example content:
```json
{
  "id": "feat-123",
  "title": "Add OAuth login",
  "description": "Implement Google OAuth login",
  "constraints": ["no breaking changes"],
  "status": "in_progress"
}
```

This file is the **contract** between the human and the AI agent.

---

### 4. Git Worktree Creation

The backend creates a new git worktree linked to a feature branch.

Example:
```bash
git worktree add ../feat-123 feat/feat-123
```

This results in:
- A new branch: `feat/feat-123`
- A separate working directory
- Full git history shared, but working files isolated

---

### 5. AI Agent Initialization

An AI agent process is spawned and receives:
- Path to the worktree
- Path to `feature.json`
- A set of allowed tools and commands
- Execution rules and safety constraints

The agent operates **only** inside the worktree directory.

---

### 6. Agent Execution Loop

The agent follows an iterative execution loop:

1. Read `feature.json`
2. Inspect relevant source code
3. Plan changes
4. Modify files
5. Run allowed commands (tests, formatters, etc.)
6. Commit changes to the feature branch
7. Repeat until requirements are satisfied

Typical loop:
```
PLAN → READ → MODIFY → TEST → COMMIT
```

The agent may create multiple commits.

---

### 7. Implementation Completion

When the agent determines the feature is complete, it updates the feature card.

Example:
```json
{
  "status": "implemented"
}
```

At this point:
- No merge is performed
- The feature remains isolated
- Human approval is required

---

### 8. Review and Approval (Human-in-the-Loop)

A human reviewer:
- Inspects the git diff
- Reviews commits
- Validates behavior and constraints

If approved:
```bash
git merge feat/feat-123
git worktree remove ../feat-123
```

The feature is now part of `main`.

---

## Safety Guarantees

- The AI agent cannot affect `main` directly
- All changes are tracked via git commits
- Each feature runs in a fully isolated environment
- Human approval is required for merging

---

## Design Principles

- Deterministic
- Auditable
- Isolated
- Human-in-the-loop

---

## Mental Model

- UI → Control Panel
- Feature Card → Task Contract
- Git Worktree → Execution Sandbox
- AI Agent → Autonomous Worker
- Git → Safety Net

---

## Non-Goals

- The AI agent does NOT auto-merge code
- The AI agent does NOT modify other features
- The AI agent does NOT operate outside its worktree

---

End of document.
