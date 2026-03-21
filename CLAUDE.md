# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ERP 查询智能体 (ERP Query Agent) - A system that enables users to query ERP data using natural language AI queries. Users write queries in plain language, and the system translates them to SQL, executes them against configured data sources, and returns structured results.

## Tech Stack

**Backend**: Node.js + Express + TypeScript + Prisma ORM + MySQL
**Frontend**: React 18 + TypeScript + Vite + Ant Design 5 + Zustand
**AI**: MiniMax API integration for natural language processing

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start dev server (port 4000)
npm run build        # Build for production
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run lint         # ESLint check
npm run seed         # Seed database
```

### Frontend
```bash
cd frontend
npm run dev          # Start dev server (port 3000, auto-selects if taken: 3020, 3021)
npm run build        # Build for production
npm test             # Run Vitest unit tests
npm run lint         # ESLint check
```

### E2E Tests (Playwright)
```bash
npx playwright test                    # Run all e2e tests
npx playwright test e2e/role-menu.spec.ts  # Run specific test
npx playwright test --project=chromium # Run specific browser only
```

## Architecture

### Backend (Express + Prisma)

**Layered Architecture**: Routes → Controllers → Services → Models/Prisma

Key routes:
- `/api/auth` - Authentication (login, logout)
- `/api/users`, `/api/roles`, `/api/menus` - RBAC management
- `/api/data-sources` - External database connections
- `/api/table-mappings` - Mapping external DB tables to internal aliases
- `/api/field-mappings` - Field-level mapping with sync capability
- `/api/prompt-rules` - AI prompt templates
- `/api/query` - Main AI query endpoint with history tracking

**Database**: MySQL via Prisma. Connection uses socket at `/tmp/mysql.sock`.

**Auth**: express-session with bcrypt password hashing. Default admin: `admin` / `admin123`.

### Frontend (React + Vite)

**Routing**: React Router with routes:
- `/login` - Login page
- `/dashboard` - KPI dashboard with charts
- `/query` - AI query interface
- `/admin/users`, `/admin/roles`, `/admin/menus` - RBAC management
- `/datasource/list`, `/datasource/mappings`, `/datasource/prompts` - Data source management

**State Management**: Zustand for global state, React state for component-local state.

**API Layer**: Axios with `/api` proxy to backend (configured in vite.config.ts).

## Testing Structure

```
backend/tests/
├── unit/           # Jest unit tests
└── integration/    # Jest integration tests

frontend/tests/
└── unit/           # Vitest unit tests

e2e/
├── playwright.config.ts  # Playwright configuration
└── *.spec.ts            # Playwright e2e tests
```

**Important**: E2E tests use Node.js Playwright (`@playwright/test`), NOT Python Playwright. Do NOT install Python Playwright in the frontend directory.

## Project File Locations

- Backend entry: `backend/src/index.ts`
- Frontend entry: `frontend/src/main.tsx`
- Prisma schema: `backend/prisma/schema.prisma`
- Frontend router: `frontend/src/App.tsx`
- Backend port: 4000 (env: `PORT`)
- Frontend port: 3000 (auto-fallback to 3020, 3021)

## Key Implementation Notes

- AI queries flow: User → Query page → `/api/query` → AI service → SQL generation → External DB → Results
- Table/Field mappings allow connecting external ERP databases with local semantic aliases
- Prompt rules define system prompts for AI query interpretation
- Role-menu assignments use tree structure for hierarchical permissions
