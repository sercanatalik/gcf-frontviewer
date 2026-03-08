# CLAUDE.md

## Project Overview

GCF FrontViewer — a financial dashboard built with Next.js for viewing GCF (General Collateral Finance) repo trade data. Connects to ClickHouse for real-time data querying and visualization, with Perspective integration for advanced data grid and charting.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript 5.9)
- **Database**: ClickHouse (`@clickhouse/client`)
- **State**: TanStack React Query (server state), TanStack React Store (client state)
- **UI**: shadcn/ui (radix-nova style), Radix UI, Tailwind CSS v4 (OKLch colors)
- **Charts**: Recharts (dashboard), Perspective d3fc (workspace)
- **Tables**: TanStack React Table (dashboard), Perspective Datagrid (workspace)
- **Data Grid**: Perspective (WASM-based — `@perspective-dev/*` v4.2)
- **Animations**: motion (Framer Motion v12)
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
  api/tables/              # API route handlers (ClickHouse queries)
    route.ts               # List tables with schemas
    [table]/route.ts       # Generic table data (for Perspective)
    kpi-summary/           # KPI metrics with period comparison
    stats-summary/         # Count-based statistics
    distinct/              # Distinct values for filter dropdowns
    recent-trades/         # Individual trade records
    grouped-stats/         # Aggregated metrics by dimension
    historical/            # Time-series historical data
    future/                # Future maturity projections
    tab-summary/           # Grouped summary for bottom tabs
  dashboard/page.tsx       # Dashboard page
  workspace/               # Perspective workspace page
    page.tsx               # Workspace with WASM data grid
    layout.tsx             # Workspace layout wrapper
  layout.tsx               # Root layout (server component)
  page.tsx                 # Redirects to /workspace
components/
  dashboard/               # Feature components
    header.tsx             # Animated TrueFocus branding header
    filter-bar.tsx         # Main filter interface with theme/layout controls
    kpi-cards/             # KPI metric cards with trend indicators & PNG export
    cash-out-chart/        # Historical/future cash out charts (tabbed, animated)
    recent-trades/         # Trade list with detail modals & mini KPI stats
    stats-row/             # Horizontal row of countable metric cards
    radial-charts-group/   # 5 radial/donut charts (product, currency, desk, region, CP type)
    bottom-tabs/           # Tabbed data tables (location, portfolio, clients, wrong way risk)
    filters/               # Filter popover, controls, and config
  workspace/               # Perspective workspace components
    layout-menu.tsx        # Navigation, preset layouts, custom layout save/load
    layout-presets.ts      # 7 preset layout definitions
    loading-screen.tsx     # WASM init progress indicator
  ui/                      # shadcn/ui primitives (20+ components)
  query-provider.tsx       # TanStack React Query provider
  theme-provider.tsx       # next-themes provider (D key toggles theme)
  theme-toggle.tsx         # Manual theme switch button
lib/
  store/filters.ts         # TanStack Store for filter state
  filters/serialize.ts     # Filter serialization & parameterized WHERE builder
  api.ts                   # API client with batch fetching
  clickhouse.ts            # ClickHouse singleton client config
  clickhouse-type-map.ts   # ClickHouse → Perspective type mapping
  columns.ts               # Date column definitions
  types.ts                 # Shared TypeScript interfaces
  utils.ts                 # cn() utility, basePath
hooks/
  use-perspective.ts       # Perspective WASM init, data loading, layout restore
styles/globals.css         # Tailwind + OKLch theme variables
types/perspective.d.ts     # Perspective type declarations
```

## Coding Conventions

- **Components**: PascalCase names, feature-based folders under `components/dashboard/`
- **Component structure**: `index.tsx` (entry), `use-*.ts` (hooks), `types.ts`, `data.ts`, `utils.ts`
- **Client components**: Use `"use client"` directive; default is server components
- **Styling**: Tailwind utility classes, `cn()` for merging, CVA for variants, `data-slot` attributes
- **Formatting**: Double quotes, no semicolons, 2-space indent, trailing comma (es5)
- **Path aliases**: `@/*` maps to project root
- **Imports**: Use `@/` alias for all imports

## Pages & Routing

- `/` → Redirects to `/workspace`
- `/dashboard` → Analytics dashboard with KPIs, charts, trades, tables
- `/workspace` → Perspective WASM workspace with data grids and visualizations

## Dashboard Features

### KPI Cards (`components/dashboard/kpi-cards/`)
- Displays primary and secondary KPIs in a grid layout
- Metrics: Cash Out, Funding Amount, Collateral Amount, Avg Spread, Avg DTM, Avg Margin, Avg Haircut
- Period-over-period comparison with change deltas and trend indicators
- Expandable modal view with PNG download (html2canvas-pro)

### Cash Out Chart (`components/dashboard/cash-out-chart/`)
- Tabbed interface: Historical (line/bar) and Future (grouped by maturity month)
- Animated tab transitions with motion.div
- Chart settings dropdown for field selection and group-by options

### Recent Trades (`components/dashboard/recent-trades/`)
- Dual tabs: Recent trades and Maturing Soon
- Mini KPI stats: Net Funding, Collateral, Exposure, Avg Margin, Avg Haircut, PAY/REC ratio
- Desk and region breakdowns with pills
- Paginated trade list (9 items/page) with detail dialog modals

### Stats Row (`components/dashboard/stats-row/`)
- Horizontal row of countable metrics (distinct trades, counterparties, desks, etc.)
- Period comparison with delta indicators

### Radial Charts (`components/dashboard/radial-charts-group/`)
- Grid of 5 donut charts: Product Type, Collateral Currency, Desk, Region, CP Type
- Auto-grouped with "Others" rollup for small values

### Bottom Tabs (`components/dashboard/bottom-tabs/`)
- Tabbed tables: By Location, Portfolio, Clients, Wrong Way Risk
- TanStack React Table with sorting and pagination
- Dynamic columns based on groupBy field

## Workspace Features

### Perspective Integration (`hooks/use-perspective.ts`)
- WASM-based data grid and visualization engine
- 4-phase initialization: init-wasm → fetch-schemas → load-tables → restore-layout
- Global caching of WASM client and table data across soft navigations
- Automatic type coercion (string, datetime, integer, float, boolean)
- Perspective bug patches: command labels, maximize/restore buttons

### Layout System (`components/workspace/`)
- 7 preset layouts: Overview, Risk Dashboard, Counterparty Analysis, Collateral & Maturity, Desk P&L, Regional & Currency, Product Deep-Dive
- Custom layouts: save/load/delete to localStorage
- Maximize/restore single viewer mode
- Loading screen with phase progress indicator

## Filter System

### Filter Store (`lib/store/filters.ts`)
- State: `filters[]`, `activeTable`, `asOfDate`
- Actions: `setFilters`, `addFilter`, `removeFilter`, `updateFilter`, `clearFilters`, `setActiveTable`, `setAsOfDate`

### Filter Fields (`components/dashboard/filters/filter-config.tsx`)
- 15 filterable columns: hmsDesk, hmsSL1, hmsSL2, tradeDt, maturityDt, tenor, counterParty, productType, hmsBook, collateralDesc, collatCurrency, issuerName, counterpartyParentName, cpType, asofDate
- 3 operator types: select (single/multi), text (ILIKE), date (comparisons)
- Operators: IS, IS NOT, IS ANY OF, INCLUDE, DO NOT INCLUDE, BEFORE, AFTER, BEFORE & EQUAL, AFTER & EQUAL

### Filter Serialization (`lib/filters/serialize.ts`)
- Converts filters to parameterized ClickHouse WHERE clauses
- Date math: Today, Yesterday, This Week, Last Week, etc.
- SQL injection prevention via allowlist + parameterized queries

## API Routes

| Route | Purpose |
|-------|---------|
| `GET /api/tables` | List tables with schemas and row counts |
| `GET /api/tables/[table]` | Generic paginated data (batch 100K) |
| `GET /api/tables/kpi-summary` | KPI metrics with period comparison |
| `GET /api/tables/stats-summary` | Count statistics with period comparison |
| `GET /api/tables/distinct` | Distinct values for filter dropdowns |
| `GET /api/tables/recent-trades` | Individual trades (max 200, recent/maturity sort) |
| `GET /api/tables/grouped-stats` | Metrics aggregated by dimension |
| `GET /api/tables/historical` | Time-series historical data |
| `GET /api/tables/future` | Future maturity projections by month |
| `GET /api/tables/tab-summary` | Grouped summary for bottom tabs |

## Data Flow

1. Components use `useQuery()` hooks to fetch from `/api/tables/*`
2. API routes deserialize filters via `buildWhereClausesFromFilters()`
3. Parameterized ClickHouse SQL prevents injection; columns validated against allowlist
4. Responses cached: `max-age=60` (general), `max-age=300` (distinct, future)

## State Management

- **Server state**: React Query (5min staleTime, 10min gcTime)
- **Client state**: TanStack Store in `lib/store/filters.ts` — manages filters, activeTable, asOfDate
- **Layout state**: localStorage for workspace layout persistence and custom layouts

## Key Patterns

- API routes use parameterized queries (never interpolate user input into SQL)
- ClickHouse singleton client with connection pooling (10 max, 30s timeout)
- Table allowlist from `allowedTables` env var (defaults: gcf_risk_mv, gcf_hmsbook, gcf_counterparty, gcf_trade)
- Dark/light theme via next-themes with OKLch color variables; D key toggles theme
- Animated header with TrueFocus glow effect
- BasePath configurable via `NEXT_PUBLIC_BASE_PATH` env (default: `/gcf-frontview`)
- No test suite currently exists
