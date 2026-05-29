# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

This project serves as a **software development portfolio and learning exercise**. Because of that, when implementing anything — a feature, a design decision, a refactor — always explain:

- **Why** this approach was chosen over alternatives
- **Which principles** apply (e.g., DRY, SRP, separation of concerns, YAGNI)
- **Any trade-offs** made (e.g., simplicity vs. flexibility, performance vs. readability)
- **What to watch out for** as the project grows

The goal is that every change is also a learning opportunity.

## Coding standards

Apply these across both backend and frontend:

- **DRY (Don't Repeat Yourself)** — extract shared logic; avoid copy-paste patterns
- **SRP (Single Responsibility Principle)** — each module, class, or function does one thing
- **Separation of concerns** — keep data fetching, business logic, and UI rendering in separate layers
- **YAGNI (You Aren't Gonna Need It)** — don't build for hypothetical futures; implement what is needed now
- **Explicit over implicit** — prefer readable, obvious code over clever one-liners
- In the same line of the previous statement, always use clear names for methods and variables that clearly describe the purpose. **Don't use abrevations** (eg. use 'year' instead of 'y', 'month' instead of 'm', 'user' instead of 'usr', 'reference' instead of 'ref', etc)
- **No dead code** — don't leave commented-out code, unused imports, or stubs in code _you write_

When a decision deviates from these principles for a good reason (performance, framework constraints, time), call it out explicitly.

## Repository layout

```
loan-tracker/
├── backend/                      # FastAPI application (Python 3.13)
│   ├── app/
│   │   ├── main.py               # FastAPI app + lifespan + CORS middleware
│   │   ├── models.py             # SQLModel table definitions (Debtor, Transaction, TransactionType)
│   │   ├── database.py           # Engine, session factory, ping + create_db_and_tables
│   │   ├── config.py             # Pydantic Settings (DATABASE_URL, CORS_ORIGINS from .env)
│   │   └── routers/
│   │       ├── debtors.py        # POST /debtors, GET /debtors, GET /debtors/{id}
│   │       └── transactions.py   # POST, GET, PUT, DELETE /debtors/{id}/transactions
│   ├── main.py                   # Re-export shim — lets `uvicorn main:app` work from backend/
│   └── requirements.txt
└── frontend/                     # React 19 + Vite 6 + TypeScript
    ├── src/
    │   ├── main.tsx              # App entry point, wraps with ChakraProvider
    │   ├── App.tsx               # Root component — React Router routes defined here
    │   ├── types.ts              # Shared TypeScript interfaces (Debtor, Transaction, etc.)
    │   ├── theme.ts              # Centralized design tokens (colors, sizes)
    │   ├── utils.ts              # Shared helpers (e.g. currency formatting)
    │   ├── pages/
    │   │   ├── DebtorListPage.tsx    # Route `/` — list debtors + create debtor form
    │   │   └── DebtorDetailPage.tsx  # Route `/debtors/:id` — transactions + balance
    │   ├── components/
    │   │   ├── CreateDebtorForm.tsx
    │   │   ├── DebtorCard.tsx
    │   │   ├── DebtorList.tsx
    │   │   ├── CreateTransactionForm.tsx
    │   │   ├── TransactionList.tsx
    │   │   ├── TransactionRow.tsx        # Inline editing mode (edit/delete per row)
    │   │   ├── EditTransactionModal.tsx  # Unused — superseded by inline editing in TransactionRow
    │   │   └── ui/               # Chakra UI scaffolded helpers (color-mode, provider, toaster, tooltip)
    │   └── services/
    │       └── api.ts            # All typed API functions (getDebtors, createDebtor, etc.)
    ├── index.html
    ├── vite.config.ts
    └── .env_example              # VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Backend — running the API

All commands run from `backend/`, with `.venv` active.

```bash
pip install -r requirements.txt

# Either form works
uvicorn main:app --reload
uvicorn app.main:app --reload
```

`.env` must exist with at minimum `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres@localhost:5432/loan_tracker
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173   # optional, this is the default
```

Tables are created automatically on startup via `SQLModel.metadata.create_all`. No migration tool is wired up yet.

Health check endpoints: `GET /health` (validates config), `GET /health/db` (pings the database).

## Frontend — running the dev server

```bash
cd frontend
pnpm install
pnpm dev        # starts at http://localhost:5173
```

Key dependencies:

- **Chakra UI v3** — component library with dark/light mode via `next-themes`
- **React Router v7** — client-side routing
- **Axios** — HTTP client for API calls
- **React Icons** — icon library

## Data model

Two tables. Balance is derived, not stored.

- **`debtor`** — `id` (PK), `name` VARCHAR(255, not null)
- **`loan_transaction`** — `id`, `debtor_id` (FK → debtor, CASCADE DELETE), `amount` NUMERIC(12,2) CHECK > 0, `occurred_on` DATE, `type` ENUM(`loan`|`payment`), `notes` VARCHAR(500) NULL, `created_at` TIMESTAMPTZ

`Transaction` maps to the physical table `loan_transaction` to avoid collisions with reserved SQL words.

## API endpoints

| Method | Path                                                 | Description                    |
| ------ | ---------------------------------------------------- | ------------------------------ |
| GET    | `/`                                                  | Service root                   |
| GET    | `/health`                                            | Config health check            |
| GET    | `/health/db`                                         | Database ping                  |
| POST   | `/debtors`                                           | Create debtor                  |
| GET    | `/debtors`                                           | List all debtors               |
| GET    | `/debtors/{debtor_id}`                               | Get single debtor              |
| POST   | `/debtors/{debtor_id}/transactions`                  | Create transaction             |
| GET    | `/debtors/{debtor_id}/transactions`                  | List transactions for a debtor |
| PUT    | `/debtors/{debtor_id}/transactions/{transaction_id}` | Full-replace a transaction     |
| DELETE | `/debtors/{debtor_id}/transactions/{transaction_id}` | Delete a transaction           |

## API conventions

- Plural resource URLs: `/debtors`
- Transactions nested under their debtor: `/debtors/{debtor_id}/transactions`
- List endpoints return a JSON array directly (not wrapped)
- Sort transactions by `occurred_on` ASC, `created_at` ASC
- 404 on `debtor_id` not found for both debtor and transaction endpoints

## Schema classes (in routers)

- `DebtorCreate` / `DebtorRead` — in `routers/debtors.py`
- `TransactionCreate` / `TransactionRead` / `TransactionUpdate` — in `routers/transactions.py`
  - `TransactionUpdate` uses PUT semantics: all fields (`amount`, `occurred_on`, `type`) required; `notes` optional

## Frontend development methodology

Build the UI incrementally so every step produces something visible and verifiable in the browser before moving to the next one:

1. **UI first, API second** — implement each component with hardcoded mock data, verify it looks and behaves correctly, then replace the mock with the real API call.
2. **One component per step** — don't implement two components at once; complete and verify each before starting the next.
3. **Mock data is temporary** — mock data exists only until the real API connection is implemented in that same component. Remove it when wiring up; don't leave both coexisting.
4. **Each step must be browser-verifiable** — after every step, the app should render without errors and show the new UI change. If a step produces no visible output, it's too granular or should be combined with the next.
5. **No API calls before the service layer exists** — create `src/services/api.ts` (with all typed API functions) before connecting any component to the backend.

# Behavioral guidelines to reduce common LLM coding mistakes.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked — point it out instead.

> **Reconciling with "No dead code":** that rule applies to code _you introduce_. Surgical Changes applies to code _already there_. Don't create dead code; don't silently delete existing dead code either.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
