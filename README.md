# Makyno

A workspace where software work happens.

## Project Overview

Makyno is an AI-powered development agent designed to execute real software development tasks autonomously. Unlike traditional AI assistants that wait for instructions and respond to prompts, Makyno operates as an active worker that can understand high-level goals, plan execution steps, and carry out the work independently.

This project exists because of real needs that emerged from working with clients. Building software for others requires speed, consistency, and the ability to handle repetitive implementation work without losing focus on what matters. Makyno was created to address those needs.

## Core Philosophy

**Tasks, not prompts.** You describe what you want to achieve, not how to achieve it. Makyno determines the approach.

**Autonomy with boundaries.** The agent works independently but operates within the constraints of your codebase, your tools, and your review process.

**Real work, not demos.** Makyno is built to work inside actual codebases with real complexity, not just generate isolated code snippets.

**Transparency over magic.** Every step the agent takes is visible. You can see what it plans to do, what it reads, what it changes, and why.

## How Makyno Works (High Level)

1. **Task Input** — You provide a high-level task or feature description. This is not a detailed specification. It is a goal.

2. **Mission Creation** — Makyno interprets the task and creates a clear mission with defined objectives.

3. **Planning** — The agent breaks down the mission into concrete steps. It identifies what needs to be understood, what needs to be changed, and what needs to be verified.

4. **Codebase Understanding** — Before making changes, Makyno reads and analyzes the relevant parts of your codebase. It understands existing patterns, conventions, and architecture.

5. **Execution** — The agent modifies or creates files, runs commands, and executes tests. It does the work.

6. **Iteration** — If something fails or needs adjustment, Makyno iterates. It reads error messages, adjusts its approach, and tries again.

7. **Completion** — The task is done when the objective is met, not when a response is generated.

## What Makyno Can Do

- Accept feature requests and implement them across multiple files
- Read and understand existing code before making changes
- Follow the conventions and patterns already present in your codebase
- Run tests and respond to failures
- Execute shell commands as part of the development workflow
- Create, modify, and delete files as needed
- Plan multi-step tasks and execute them in sequence

## What Makyno Is NOT

**Not a chatbot.** There is no conversation for the sake of conversation. Makyno receives tasks and executes them.

**Not a code snippet generator.** The output is not a block of code for you to copy and paste. The output is changes applied directly to your codebase.

**Not a replacement for developers.** Makyno is a tool that does work. It still requires human oversight, review, and decision-making for anything important.

**Not infallible.** The agent can misunderstand requirements, introduce bugs, or make poor architectural decisions. Human review is not optional.

## Typical Use Cases

- "Add a user settings page with email and password update forms"
- "Refactor the authentication module to use the new session library"
- "Fix the failing tests in the payment service"
- "Add input validation to all API endpoints"
- "Update the database schema and create the migration"

These are goals, not instructions. Makyno figures out what files to touch, what code to write, and what commands to run.

## Who This Project Is For

- Developers who want to delegate routine implementation work
- Teams exploring how AI agents can fit into development workflows
- Anyone interested in the practical application of autonomous AI in software engineering

This is not for people looking for a plug-and-play solution. Makyno requires understanding of your own codebase and willingness to review AI-generated changes.

## Project Status

**Early-stage / Experimental**

Makyno is under active development. Core functionality is being built and refined. Expect breaking changes, incomplete features, and rough edges.

The project is not ready for production use. It is suitable for experimentation, learning, and contribution.

## Disclaimer

Makyno is an AI agent. AI agents can and will make mistakes.

- Generated code may contain bugs
- Architectural decisions may not align with your preferences
- The agent may misinterpret requirements
- Commands executed by the agent can have unintended effects

**Human review is required.** Do not deploy AI-generated changes without careful inspection. Do not run the agent with elevated permissions in environments where mistakes have significant consequences.

Use at your own risk.

---

Makyno — A workspace where software work happens.
