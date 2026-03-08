# CLAUDE.md

## Project Overview

GCF FrontViewer — a financial dashboard built with Next.js for viewing GCF (General Collateral Finance) repo trade data. Connects to ClickHouse for real-time data querying and visualization.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript 5.9)
- **Database**: ClickHouse (`@clickhouse/client`)
- **State**: TanStack React Query (server state), TanStack React Store (client state)
- **UI**: shadcn/ui (radix-nova style), Radix UI, Tailwind CSS v4 (OKLch colors)
- **Charts**: Recharts
- **Tables**: TanStack React Table
- **Animations**: motion
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier (all .ts/.tsx files)
pnpm typecheck    # tsc --noEmit
```

## Project Structure

```
app/
  api/tables/         # API route handlers (ClickHouse queries)
  layout.tsx          # Root layout (server component)
  page.tsx            # Dashboard page
components/
  dashboard/          # Feature components (header, filter-bar, kpi-cards, etc.)
  ui/                 # shadcn/ui primitives
lib/
  store/filters.ts    # TanStack Store for filter state
  filters/serialize.ts # Filter serialization/deserialization
  clickhouse.ts       # ClickHouse client config
  utils.ts            # cn() utility
hooks/                # Custom React hooks
styles/globals.css    # Tailwind + theme variables
```

## Coding Conventions

- **Components**: PascalCase names, feature-based folders under `components/dashboard/`
- **Component structure**: `index.tsx` (entry), `use-*.ts` (hooks), `types.ts`, `data.ts`, `utils.ts`
- **Client components**: Use `"use client"` directive; default is server components
- **Styling**: Tailwind utility classes, `cn()` for merging, CVA for variants, `data-slot` attributes
- **Formatting**: Double quotes, no semicolons, 2-space indent, trailing comma (es5)
- **Path aliases**: `@/*` maps to project root
- **Imports**: Use `@/` alias for all imports

## Data Flow

1. Components use `useQuery()` hooks to fetch from `/api/tables/*`
2. API routes deserialize filters, build parameterized ClickHouse SQL
3. Filter columns are validated against an allowlist
4. Responses cached with `public, max-age=60`

## State Management

- **Server state**: React Query (5min staleTime, 10min gcTime)
- **Client state**: TanStack Store in `lib/store/filters.ts` — manages filters, activeTable, asOfDate
- **Filter actions**: `setFilters`, `addFilter`, `removeFilter`, `updateFilter`, `clearFilters`

## Key Patterns

- API routes use parameterized queries (never interpolate user input into SQL)
- Filter system supports operators: IN, ILIKE, NOT ILIKE, =, !=, <, >, <=, >=
- Dark/light theme via next-themes with OKLch color variables
- No test suite currently exists
