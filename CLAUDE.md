# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Build & Preview
pnpm build            # Production build
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests with Vitest

# Linting & Formatting (Biome)
pnpm check            # Run all checks
pnpm lint             # Lint only
pnpm format           # Format only

# Database (Drizzle + PostgreSQL)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly (dev)
pnpm db:studio        # Open Drizzle Studio

# Add shadcn/ui components
pnpm dlx shadcn@latest add <component>
```

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

## Key Directory Structure

- `src/routes/` - File-based routing (TanStack Router)
- `src/routes/api/` - API routes
- `src/integrations/` - Provider setup (Convex, TanStack Query, Better Auth)
- `src/db/` - Drizzle schema and database client
- `convex/` - Convex functions and schema
- `src/paraglide/` - Generated i18n runtime (auto-generated)
- `drizzle/` - Generated migrations

## Code Style

- Biome for linting/formatting with tab indentation and double quotes
- Path alias: `@/*` maps to `src/*`
- React Compiler enabled via babel plugin

## Convex Guidelines

When working with Convex schemas:
- Use `v.id("tableName")` for references between tables
- System fields `_id` and `_creationTime` are automatic
- Define indexes with `.index("name", ["field"])`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (server)
- `VITE_CONVEX_URL` - Convex deployment URL (client)
- Client-side vars must be prefixed with `VITE_`
