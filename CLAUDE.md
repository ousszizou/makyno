# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Enforcement Notice

**ALL (MUST) rules are MANDATORY. NO EXCEPTIONS.**
- Reference rule numbers internally when making decisions (e.g., "Following CD-1...") - do NOT include rule references in commits or code comments
- Check ALL applicable rules before ANY code changes
- Immediately correct violations

## Project Overview

**Makyno** - A workspace where software work happens.

## Purpose

These rules ensure maintainability, safety, and developer velocity. MUST rules are enforced by CI; SHOULD rules are strongly recommended.

## Architecture

This is a **TanStack Start** fullstack React app with:

- **Framework**: TanStack Start (React meta-framework with SSR)
- **Routing**: TanStack Router with file-based routing in `src/routes/`
- **State/Data**: TanStack Query for server state, TanStack DB for client collections
- **Databases**:
  - PostgreSQL via Drizzle ORM (schema at `src/db/schema.ts`, config at `drizzle.config.ts`)
  - Convex for real-time data (schema at `convex/schema.ts`)
- **Auth**: Better Auth with email/password (`src/lib/auth.ts`)
- **i18n**: Paraglide with messages in `messages/{locale}.json` (en, de)
- **Styling**: Tailwind CSS v4 with shadcn/ui components in `src/components/ui/`
- **Validation**: Zod for runtime schema validation

## Key Directory Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (shadcn/ui)
│   ├── custom/        # Custom components
│   └── inputs/        # Form input components
├── features/          # Feature-based modules
├── routes/            # File-based routing (TanStack Router)
│   └── api/           # API routes
├── integrations/      # Provider setup (Convex, TanStack Query, Better Auth)
├── db/                # Drizzle schema and database client
├── lib/               # Utility libraries
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── paraglide/         # Generated i18n runtime (auto-generated)
convex/                # Convex functions and schema
drizzle/               # Generated migrations
```

## Rule Taxonomy

Each rule belongs to a category and is labeled with a prefix:
- **BC** = Before Coding → rules to follow before writing any code.
- **CD** = Coding → rules to follow while writing code.
- **SC** = Security → rules ensuring security & data safety.
- **TS** = Testing → rules for validation, testing, and QA.
- **GIT** = Git → rules for version control and commit practices.
- **DC** = Development Commands → rules controlling execution of dev commands and scripts.
- **OF** = Output Formatting → rules about how code is delivered/presented.

**Technology-specific rules** are maintained in separate files under `.claude/rules/` for scalability and clarity:

- [React 19 Rules](./.claude/rules/react-19.md)
- [Tailwind CSS Rules](./.claude/rules/tailwind-css.md)

All technology-specific rules use their respective prefix (e.g., **TS-** for TanStack Start, **TQ-** for TanStack Query, **DR-** for Drizzle ORM) and follow the same **MUST** / **SHOULD** convention.

### BC - Before Coding Rules

- **BC-1** (MUST) Ask clarifying questions if requirements are ambiguous.
- **BC-2** (SHOULD) Draft and confirm an approach for complex tasks.
- **BC-3** (SHOULD) Compare ≥ 2 approaches if available, with pros/cons.
- **BC-4** (SHOULD) Review existing codebase patterns before implementing new features.
- **BC-5** (SHOULD) Highlight potential risks early.
- **BC-6** (SHOULD) Check if similar functionality already exists to avoid duplication.
- **BC-7** (SHOULD) Plan for scalability and performance implications.
- **BC-8** (SHOULD) Identify authentication/authorization requirements upfront.
- **BC-9** (SHOULD) Consider mobile responsiveness and accessibility needs.

### CD - Coding Rules

- **CD-1** (MUST) Name functions with existing domain vocabulary for consistency.
- **CD-2** (MUST) Follow language/framework conventions.
- **CD-3** (MUST) Keep functions/classes single-responsibility.
- **CD-4** (MUST) Avoid hard-coded secrets; use configs/env vars.
- **CD-5** (SHOULD) Optimize for readability > clever tricks.
- **CD-6** (MUST) Handle errors gracefully with meaningful messages.
- **CD-7** (SHOULD) Use TypeScript strict mode and avoid `any` types.
- **CD-8** (SHOULD) Prefer functional patterns over class-based approaches.
- **CD-9** (MUST) Use established state management patterns (TanStack Query, React Hook Form).
- **CD-10** (SHOULD) Implement proper loading and error states for UI components.
- **CD-11** (MUST) Follow Tailwind CSS utility patterns consistently.
- **CD-12** (SHOULD) Use Zod schemas for runtime validation.
- **CD-13** (SHOULD) Implement proper React key props for list items.
- **CD-14** (MUST) Use semantic HTML elements for accessibility.
- **CD-15** (MUST) Use `import type { … }` for type-only imports.

- **CD-16** (MUST) NEVER import components or logic from other feature directories. Features must remain independent. Move shared functionality to `src/components/` or `src/utils/`.

### SC - Security Rules

- **SC-1** (MUST) Sanitize all user inputs.
- **SC-2** (MUST) Prevent common vulnerabilities (XSS, CSRF, SQLi).
- **SC-3** (MUST) Store passwords/tokens securely (hashed, encrypted).
- **SC-4** (SHOULD) Apply least-privilege principle in access control.
- **SC-5** (SHOULD) Log security-related events for auditing.
- **SC-6** (MUST) Validate file uploads (type, size, content).
- **SC-7** (MUST) Use HTTPS for all data transmission.
- **SC-8** (SHOULD) Implement rate limiting for API endpoints.
- **SC-11** (MUST) Validate and sanitize data before database operations.

### TS - Testing Rules

- **TS-1** (SHOULD) Follow TDD: scaffold stub → write failing test → implement.
- **TS-2** (MUST) Write unit tests for critical business logic.
- **TS-3** (SHOULD) Test API endpoints with various inputs and edge cases.
- **TS-4** (MUST) Validate that authentication/authorization works correctly.
- **TS-5** (SHOULD) Include integration tests for database operations.
- **TS-6** (MUST) Test form validation and error handling.
- **TS-7** (SHOULD) Verify mobile responsiveness across devices.
- **TS-8** (SHOULD) Test file upload functionality with various file types.
- **TS-9** (MUST) Run tests before committing code changes.
- **TS-10** (SHOULD) Test the entire structure in one assertion if possible:
  ```ts
  expect(result).toBe([value]) // Good
  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```
- **TS-11** (MUST) ALWAYS separate pure-logic unit tests from DB-touching integration tests.

### GIT - Git Rules

- **GIT-1** (MUST) Write clear, concise commit messages following conventional commits.
- **GIT-2** (SHOULD) Include scope if applicable: `type(scope): description`.
- **GIT-3** (SHOULD) Suggest splitting commits for different concerns.
- **GIT-4** (MUST) **NEVER** include Claude Code footer, co-authored-by, or any AI attribution in commit messages. Commit messages must contain ONLY the project changes without any Claude/AI references.

**Commit Types:**
- ✨ feat: New features
- 🐛 fix: Bug fixes
- 📝 docs: Documentation changes
- ♻️ refactor: Code restructuring without changing functionality
- 🎨 style: Code formatting, missing semicolons, etc.
- ⚡️ perf: Performance improvements
- ✅ test: Adding or correcting tests
- 🧑‍💻 chore: Tooling, configuration, maintenance
- 🚧 wip: Work in progress
- 🔥 remove: Removing code or files
- 🚑 hotfix: Critical fixes
- 🔒 security: Security improvements

### DC - Development Commands Rules

- **DC-1** (MUST) NEVER run any development commands (e.g., pnpm dev, pnpm format, pnpm lint, pnpm check, pnpm test, pnpm build, pnpm db:migrate, etc.) unless the user explicitly requests it in the current message.
- **DC-2** (MUST) NEVER suggest or imply running any pnpm/script commands in responses unless the user has specifically asked to execute or see the output of that command.
- **DC-3** (MUST) Do not automatically start or reference the development server (port 3000 or otherwise) without direct user instruction.
- **DC-4** (SHOULD) If a command's output would be helpful, ask for confirmation before running it (e.g., "Would you like me to run pnpm lint to check the current code?").

### OF - Output Formatting Rules

- **OF-1** (MUST) Format code with Biome before committing.
- **OF-2** (MUST) Include meaningful comments for complex business logic.
- **OF-3** (SHOULD) Use consistent indentation and spacing throughout codebase.
- **OF-4** (MUST) Remove console.log statements before production deployment.
- **OF-5** (SHOULD) Use descriptive variable and function names over comments when possible; add concise comments only for non-trivial logic.
- **OF-6** (SHOULD) Group related code together and separate concerns with whitespace.
- **OF-7** (MUST) Follow JSDoc standards for public API documentation.
- **OF-8** (SHOULD) Structure file exports consistently (named exports before default).

## Code Style

- Biome for linting/formatting with tab indentation and double quotes
- Path alias: `@/*` maps to `src/*`
- React Compiler enabled via babel plugin

## Convex Guidelines

- Use `v.id("tableName")` for references between tables
- System fields `_id` and `_creationTime` are automatic
- Define indexes with `.index("name", ["field"])`

## Framework Usage Rules

- **TanStack Start Documentation**: Follow TanStack Start official documentation for routing, rendering, and data fetching
- **Context7 MCP Server**: Use Context7 MCP Server for up-to-date code references and APIs instead of guessing or hallucinating

## Package Management & Environment

### Package Management
- **Package Manager**: Use `pnpm` exclusively (never npm or yarn)
- **Node.js Version**: 22.10.0 (managed by Volta)
- **Package Installation**: Only install packages when explicitly requested

### Development Environment
- **Server Configuration**: Development server always runs on port 3000
- **Build Target**: Netlify deployment
- **Environment Variables**:
  - Use **T3 Env** exclusively for type-safe environment variable validation and management
  - Define Zod schemas in `src/env.ts` for client and server environment variables
  - Client-side variables must be prefixed with `VITE_` (e.g., `VITE_SUPABASE_URL`)
  - Server-side variables accessed via `process.env` (e.g., `DATABASE_URL`, `RESEND_API_KEY`)
  - T3 Env provides runtime validation, type inference, and prevents server-side variable leaks
  - Never commit `.env` files with actual secrets to version control

### Integration & Monitoring
- **MCP Integration**: Utilize available MCP servers for knowledgebase and understanding
- **Console Monitoring**: Actively fetch and analyze logs from the console
- **Error Tracking**: Monitor and handle runtime errors appropriately
- **Performance**: Profile and optimize bundle size and runtime performance

## Component Guidelines

### File & Naming Conventions
- **Component Files**: Use kebab-case for component files (e.g., `user-profile.tsx`)
- **Utility Files**: Use kebab-case for utilities and helpers (e.g., `format-date.ts`)
- **Component Names**: Use PascalCase for component names (e.g., `UserProfile`)
- **Custom Hooks**: Prefix with `use` and use camelCase (e.g., `useAuth`, `useSupabaseUpload`)

### Component Structure
- **Arrow Functions**: Use arrow functions for component definitions
- **Logic Separation**: Keep logic in custom hooks, components should focus on view/presentation only
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Define TypeScript interfaces for all component props
- **Export Pattern**: Use named exports before default export

### React Best Practices
- **Proper Memoization**: Use `useMemo`, `useCallback`, and `memo` appropriately
- **Key Props**: Always provide stable keys for list items
- **Effect Dependencies**: Include all dependencies in `useEffect` dependency arrays
- **Error Boundaries**: Wrap components that might error with error boundaries
- **Loading States**: Implement proper loading and error states for async operations

## Visual Development

### Design Principles
- **Comprehensive Design Checklist**: Reference `.claude/context/design-principles.md` for S-Tier SaaS dashboard standards
- **Design Compliance**: When making visual (front-end, UI/UX) changes, always refer to design principles for guidance
- **Premium Standards**: Apply Stripe, Airbnb, and Linear-inspired design principles

### Quick Visual Check Protocol
IMMEDIATELY after implementing any front-end change:

1. **Identify What Changed**: Review the modified components/pages
2. **Navigate to Affected Pages**: Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify Design Compliance**: Compare against `.claude/context/design-principles.md`
4. **Validate Feature Implementation**: Ensure the change fulfills the user's specific request
5. **Check Acceptance Criteria**: Review any provided context files or requirements
6. **Capture Evidence**: Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for Errors**: Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Visual Quality Standards
- **Accessibility First**: Verify WCAG AA+ compliance using browser tools
- **Responsive Design**: Test across mobile, tablet, and desktop viewports
- **Performance Monitoring**: Use browser DevTools for optimization analysis
- **Cross-Browser Compatibility**: Validate across different browsers and environments

## Development Philosophy

### Code Quality & Architecture
- **Iteration over Duplication**: Prioritize modular, reusable code over copy-paste solutions
- **Type Safety First**: Write strict TypeScript with proper type definitions and avoid `any`
- **Functional Patterns**: Favor functional and declarative patterns over class-based approaches
- **Single Responsibility**: Each function/component should have one clear purpose

### Performance & Optimization
- **Performance Conscious**: Proactively identify and suggest performance improvements
- **Bundle Optimization**: Monitor and optimize bundle size and loading performance
- **React Best Practices**: Use proper memoization, avoid unnecessary re-renders
- **Database Efficiency**: Optimize queries and minimize database round trips

### Security & Reliability
- **Security First**: Proactively identify potential security vulnerabilities and provide solutions
- **Error Handling**: Implement comprehensive error boundaries and graceful degradation
- **Input Validation**: Validate all user inputs using Zod schemas
- **Environment Safety**: Properly manage environment variables and secrets

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm email:dev        # Start email development server (React Email)

# Build & Preview
pnpm build            # Production build (Netlify target)
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests with Vitest

# Linting & Formatting (Biome)
pnpm check            # Run all checks (lint + format)
pnpm lint             # Lint only
pnpm format           # Format only

# Database (Drizzle + PostgreSQL)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly (dev)
pnpm db:studio        # Open Drizzle Studio
pnpm db:reset         # Reset database to clean state (dev only)

# Add shadcn/ui components
pnpm dlx shadcn@latest add <component>
```
