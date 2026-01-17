<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: N/A → 1.0.0 (Initial ratification)
Bump Type: MAJOR (Initial constitution creation)

Modified Principles: N/A (Initial creation)

Added Sections:
  - Core Principles (4 principles: Code Quality, Testing Standards, UX Consistency, Performance)
  - Quality Gates (measurable enforcement criteria)
  - Development Workflow (review and compliance process)
  - Governance (amendment procedures and versioning policy)

Removed Sections: N/A (Initial creation)

Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Success Criteria align with performance gates)
  - .specify/templates/tasks-template.md: ✅ Compatible (Test-first workflow supported)

Follow-up TODOs: None
=============================================================================
-->

# Makyno Constitution

## Core Principles

### I. Code Quality First

Every code change MUST meet strict quality standards before merge. Quality is not negotiable.

- **Single Responsibility**: Functions and components MUST have one clear purpose
- **Type Safety**: TypeScript strict mode is mandatory; `any` types are forbidden except with explicit justification
- **Readability**: Code MUST be self-documenting through clear naming; comments are reserved for non-obvious logic only
- **Consistency**: All code MUST follow established project patterns and conventions (see CLAUDE.md)
- **No Dead Code**: Unused code, commented-out blocks, and orphaned files MUST be removed immediately
- **Dependency Discipline**: New dependencies require justification; prefer existing solutions over new packages

**Rationale**: Makyno is an autonomous development agent. Code quality directly impacts the agent's ability to understand, modify, and maintain the codebase. Poor quality compounds over time and degrades agent effectiveness.

### II. Testing Standards

Testing is MANDATORY for all code that affects system behavior. Tests MUST be written to fail first.

- **Test Coverage**: Critical business logic MUST have unit tests; integration points MUST have integration tests
- **Test Separation**: Pure-logic unit tests MUST be separate from database-touching integration tests
- **Test-First Discipline**: For new features, tests SHOULD be written before implementation (Red-Green-Refactor)
- **Test Assertions**: Prefer single comprehensive assertions over multiple fragmented checks
- **Test Independence**: Each test MUST be independently runnable and produce consistent results
- **No Flaky Tests**: Tests that intermittently fail MUST be fixed or removed; they block all development

**Rationale**: Makyno executes tasks autonomously and iterates based on test results. Unreliable or missing tests cause the agent to make incorrect decisions and produce broken code.

### III. User Experience Consistency

Every user-facing change MUST maintain visual and behavioral consistency across the application.

- **Design System Adherence**: UI components MUST use established primitives from `@/components/ui`
- **Responsive Design**: All interfaces MUST work correctly across mobile, tablet, and desktop viewports
- **Accessibility**: WCAG AA compliance is mandatory; semantic HTML, proper contrast, keyboard navigation
- **RTL Support**: All layouts MUST work correctly with `dir="rtl"` using logical properties
- **Loading States**: Async operations MUST display appropriate loading and error feedback
- **Dark Mode**: All UI MUST support both light and dark themes

**Rationale**: Makyno generates UI code. Inconsistent UX degrades user trust and creates technical debt that compounds across features. A strict design system enables predictable, high-quality output.

### IV. Performance Requirements

Performance is a feature. Every change MUST be evaluated for its impact on system responsiveness.

- **Bundle Size**: New dependencies MUST be evaluated for bundle impact; unnecessary bloat is rejected
- **Render Performance**: React components MUST avoid unnecessary re-renders; memoization where measured benefit exists
- **Database Efficiency**: Queries MUST be optimized; N+1 queries are forbidden; indexes are required for filtered columns
- **API Response Time**: Endpoints SHOULD respond within 200ms for simple operations; complex operations MUST be async
- **Core Web Vitals**: Frontend changes MUST not degrade LCP, FID, or CLS metrics
- **Memory Management**: Long-running processes MUST not leak memory; cleanup is mandatory

**Rationale**: Makyno operates in real codebases with real users. Performance problems discovered late are expensive to fix. Proactive performance discipline prevents degradation.

## Quality Gates

*GATE: All changes MUST pass these checks before merge.*

| Gate | Requirement | Enforcement |
|------|-------------|-------------|
| Type Check | Zero TypeScript errors | CI blocks on failure |
| Lint | Zero Biome errors/warnings | CI blocks on failure |
| Format | Code formatted per Biome config | CI blocks on failure |
| Tests | All tests pass | CI blocks on failure |
| Coverage | Critical paths have tests | Code review verification |
| Bundle | No unexplained size increase >5% | CI warning, review required |
| Accessibility | No new a11y violations | Automated + manual review |

## Development Workflow

### Code Review Requirements

- All changes require review before merge
- Reviewers MUST verify compliance with all four Core Principles
- Complexity MUST be justified; simpler alternatives MUST be documented if rejected
- Performance-sensitive changes require benchmark comparison

### Compliance Verification

Before marking any task complete:

1. Run `pnpm check` (lint + format verification)
2. Run `pnpm test` (all tests pass)
3. Verify UI changes visually at mobile, tablet, and desktop breakpoints
4. Verify RTL layout if UI was modified
5. Verify dark mode if UI was modified
6. Check console for errors and warnings

## Governance

This Constitution is the authoritative source for development standards in Makyno. It supersedes conflicting guidance in other documents.

### Amendment Process

1. Propose changes via pull request to this file
2. Document rationale for each change
3. Assess impact on dependent artifacts (templates, specs, tasks)
4. Update all affected artifacts in the same PR
5. Require maintainer approval for MAJOR version changes

### Versioning Policy

- **MAJOR**: Principle removal, redefinition, or backward-incompatible governance change
- **MINOR**: New principle, new section, or materially expanded guidance
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Dependent Artifacts

Changes to this Constitution may require updates to:

- `.specify/templates/plan-template.md` (Constitution Check section)
- `.specify/templates/spec-template.md` (Success Criteria alignment)
- `.specify/templates/tasks-template.md` (Task categorization and test requirements)
- `CLAUDE.md` (Runtime development guidance)

**Version**: 1.0.0 | **Ratified**: 2026-01-17 | **Last Amended**: 2026-01-17
